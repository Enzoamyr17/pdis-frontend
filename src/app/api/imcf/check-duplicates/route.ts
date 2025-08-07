import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IMCFStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { personnelName, projectId, coverageFromDate, coverageToDate, feeType, excludeFormId } = body

    if (!personnelName || !projectId || !coverageFromDate || !coverageToDate || !feeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const coverageStart = new Date(coverageFromDate)
    const coverageEnd = new Date(coverageToDate)

    // Find existing IMCF forms with the same personnel AND same project
    const whereClause = {
      personnel: {
        some: {
          registeredName: {
            equals: personnelName,
            mode: 'insensitive' as const
          }
        }
      },
      // Only check for duplicates within the same project
      projectID: projectId,
      status: {
        in: [IMCFStatus.SUBMITTED, IMCFStatus.UNDER_REVIEW, IMCFStatus.APPROVED] // Only check non-draft forms
      },
      // Coverage date overlap check
      AND: [
        {
          coverageFromDate: {
            lte: coverageEnd
          }
        },
        {
          coverageToDate: {
            gte: coverageStart
          }
        }
      ],
      // Exclude current form if editing
      ...(excludeFormId ? { NOT: { id: excludeFormId } } : {})
    }

    const existingForms = await prisma.iMCFForm.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            projectID: true,
            projectName: true
          }
        },
        personnel: {
          where: {
            OR: [
              {
                registeredName: {
                  equals: personnelName,
                  mode: 'insensitive' as const
                }
              },
              {
                // Also check IM personnel by constructing full name from IM data
                im: {
                  OR: [
                    {
                      AND: [
                        { lastName: { contains: personnelName.split(',')[0]?.trim() || '', mode: 'insensitive' as const } },
                        { firstName: { contains: personnelName.split(',')[1]?.trim().split(' ')[0] || '', mode: 'insensitive' as const } }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          include: {
            im: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Check for duplicates within the same project and overlapping coverage dates
    const duplicates = []

    for (const form of existingForms) {
      const person = form.personnel.find(p => {
        // Check by registered name if available
        if (p.registeredName) {
          return p.registeredName.toLowerCase() === personnelName.toLowerCase()
        }
        // Check by IM full name if IM data is available
        if (p.im) {
          const fullName = `${p.im.lastName}, ${p.im.firstName} ${p.im.middleName || ''}`.trim()
          return fullName.toLowerCase() === personnelName.toLowerCase()
        }
        return false
      })
      
      if (!person) continue // Skip if person not found
      
      // Check for fee type conflicts
      const hasPackagedFee = person.packagedFee.gt(0)
      const existingFeeType = hasPackagedFee ? 'packaged' : 'daily'
      
      // Determine if this is a duplicate scenario
      let isDuplicate = false
      let reason = ''
      let requiresRemark = false

      // Since we're only checking within the same project now
      if (feeType === 'packaged' && existingFeeType === 'packaged') {
        // Both packaged fees for same project and overlapping coverage
        isDuplicate = true
        reason = 'Same project with overlapping packaged fee coverage dates'
        requiresRemark = true
      } else if (feeType === 'daily' && existingFeeType === 'daily') {
        // Check for specific day overlaps
        const dayOverlaps = checkDayOverlaps(coverageStart, coverageEnd, form.coverageFromDate!, form.coverageToDate!, person)
        if (dayOverlaps.length > 0) {
          isDuplicate = true
          reason = `Same project with overlapping daily fees on: ${dayOverlaps.join(', ')}`
          requiresRemark = true
        }
      } else if (feeType === 'packaged' && existingFeeType === 'daily') {
        // Packaged fee (current) vs existing daily fee - no remark needed
        isDuplicate = true
        reason = 'Same project: packaged fee overlaps with existing daily fees'
        requiresRemark = false
      } else if (feeType === 'daily' && existingFeeType === 'packaged') {
        // Daily fee (current) vs existing packaged fee
        isDuplicate = true
        reason = 'Same project: daily fees overlap with existing packaged fee'
        requiresRemark = true
      }

      if (isDuplicate) {
        duplicates.push({
          formId: form.id,
          referenceNumber: form.referenceNumber,
          projectName: form.project?.projectName || 'Unknown Project',
          projectId: form.project?.id,
          coverageFromDate: form.coverageFromDate,
          coverageToDate: form.coverageToDate,
          personnelName: person.registeredName,
          existingFeeType,
          packagedFee: person.packagedFee,
          dailyFees: {
            monday: person.mondayFee,
            tuesday: person.tuesdayFee,
            wednesday: person.wednesdayFee,
            thursday: person.thursdayFee,
            friday: person.fridayFee,
            saturday: person.saturdayFee,
            sunday: person.sundayFee
          },
          reason,
          requiresRemark,
          sameProject: true // Always true now since we only check same project
        })
      }
    }

    return NextResponse.json({
      hasDuplicates: duplicates.length > 0,
      duplicates
    })

  } catch (error) {
    console.error('Error checking duplicates:', error)
    return NextResponse.json(
      { error: 'Failed to check for duplicates' },
      { status: 500 }
    )
  }
}

// Helper function to check day overlaps for daily fees
function checkDayOverlaps(
  newStart: Date, 
  newEnd: Date, 
  existingStart: Date, 
  existingEnd: Date, 
  person: {
    mondayFee: Decimal;
    tuesdayFee: Decimal;
    wednesdayFee: Decimal;
    thursdayFee: Decimal;
    fridayFee: Decimal;
    saturdayFee: Decimal;
    sundayFee: Decimal;
  }
): string[] {
  const overlaps: string[] = []
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  // Iterate through each day in the new coverage period
  const currentDate = new Date(newStart)
  while (currentDate <= newEnd) {
    // Check if this date falls within the existing coverage period
    if (currentDate >= existingStart && currentDate <= existingEnd) {
      const dayName = dayNames[currentDate.getDay()]
      const dayFeeField = (dayName + 'Fee') as keyof typeof person
      
      // Check if there's a fee for this day in the existing form
      if (person[dayFeeField] && person[dayFeeField].gt(0)) {
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)
        if (!overlaps.includes(capitalizedDay)) {
          overlaps.push(capitalizedDay)
        }
      }
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return overlaps
}