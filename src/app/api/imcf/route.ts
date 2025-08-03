import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IMCFStatus } from '@prisma/client'

interface PersonnelData {
  registeredName: string;
  position: string;
  outletVenue: string;
  packagedFee: number;
  dailyFees: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
  ownGcash: string;
  authGcash: string;
  authGcashAccName: string;
  remarks?: string;
  duplicateRemark?: string;
}

// Helper function to check for duplicate personnel
async function checkForDuplicates(
  personnel: PersonnelData[],
  projectId: string,
  coverageFromDate: string,
  coverageToDate: string,
  excludeFormId?: string
) {
  const duplicateResults = []
  const coverageStart = new Date(coverageFromDate)
  const coverageEnd = new Date(coverageToDate)
  
  for (const person of personnel) {
    const hasPackagedFee = parseFloat(String(person.packagedFee)) > 0
    const feeType = hasPackagedFee ? 'packaged' : 'daily'
    
    // Find existing IMCF forms with the same personnel AND same project
    const whereClause = {
      personnel: {
        some: {
          registeredName: {
            equals: person.registeredName,
            mode: 'insensitive' as const
          }
        }
      },
      // Only check for duplicates within the same project
      projectID: projectId,
      status: {
        in: [IMCFStatus.SUBMITTED, IMCFStatus.UNDER_REVIEW, IMCFStatus.APPROVED]
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
            registeredName: {
              equals: person.registeredName,
              mode: 'insensitive' as const
            }
          }
        }
      }
    })

    // Check if there are any duplicates
    const duplicates = []
    for (const form of existingForms) {
      const existingPerson = form.personnel.find(p => 
        p.registeredName.toLowerCase() === person.registeredName.toLowerCase()
      )
      
      if (!existingPerson) continue
      
      const hasExistingPackagedFee = existingPerson.packagedFee.gt(0)
      const existingFeeType = hasExistingPackagedFee ? 'packaged' : 'daily'
      
      let isDuplicate = false
      let reason = ''
      
      // Since we're only checking within the same project now
      if (feeType === 'packaged' && existingFeeType === 'packaged') {
        isDuplicate = true
        reason = 'Same project with overlapping packaged fee coverage dates'
      } else if (feeType === 'daily' && existingFeeType === 'daily') {
        isDuplicate = true
        reason = 'Same project with overlapping daily fees'
      } else if (feeType === 'packaged' && existingFeeType === 'daily') {
        isDuplicate = true
        reason = 'Same project: packaged fee overlaps with existing daily fees'
      } else if (feeType === 'daily' && existingFeeType === 'packaged') {
        isDuplicate = true
        reason = 'Same project: daily fees overlap with existing packaged fee'
      }
      
      // Check if duplicate should be allowed based on remarks
      if (isDuplicate) {
        const hasCurrentRemark = person.duplicateRemark && person.duplicateRemark.trim() !== ''
        const hasExistingRemark = existingPerson.remarks && existingPerson.remarks.trim() !== ''
        
        // Allow duplicate if either the current person has a remark OR the existing person already has remarks
        if (hasCurrentRemark || hasExistingRemark) {
          // Skip adding to duplicates - this is allowed
          continue
        }
        
        duplicates.push({
          formId: form.id,
          referenceNumber: form.referenceNumber,
          projectName: form.project?.projectName || 'Unknown Project',
          reason,
          sameProject: true
        })
      }
    }
    
    if (duplicates.length > 0) {
      duplicateResults.push({
        personnelName: person.registeredName,
        duplicates
      })
    }
  }
  
  return duplicateResults
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()

    const {
      projectId,
      ceId,
      targetReleaseDate,
      coverageFromDate,
      coverageToDate,
      clearanceRequestorRemarks,
      personnel,
      isDraft = false
    } = body

    // Check for duplicate personnel for both drafts and submissions
    if (personnel && personnel.length > 0 && projectId && coverageFromDate && coverageToDate) {
      const duplicateResults = await checkForDuplicates(
        personnel,
        projectId,
        coverageFromDate,
        coverageToDate
      )

      if (duplicateResults.length > 0) {
        // Create detailed error message with personnel list and guidance
        const duplicatePersonnel = duplicateResults.map(result => result.personnelName).join(', ')
        const duplicateForms = duplicateResults.flatMap(result => 
          result.duplicates.map(dup => dup.referenceNumber)
        ).join(', ')
        
        return NextResponse.json(
          { 
            error: 'Duplicate personnel detected',
            duplicates: duplicateResults,
            message: `Personnel "${duplicatePersonnel}" found in existing forms: ${duplicateForms}. Please edit the existing form(s) and add remarks to explain the overlap, then save.`
          },
          { status: 400 }
        )
      }
    }

    // Validate required fields for submission (not draft)
    if (!isDraft) {
      if (!projectId || !ceId || !targetReleaseDate || !coverageFromDate || !coverageToDate) {
        return NextResponse.json(
          { error: 'Missing required fields for submission' },
          { status: 400 }
        )
      }

      if (!personnel || personnel.length === 0) {
        return NextResponse.json(
          { error: 'At least one personnel entry is required' },
          { status: 400 }
        )
      }
    }

    // Get user details for auto-population
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        department: true,
        group: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Generate reference number
    const year = new Date().getFullYear().toString().slice(-2)
    const randomNum = Math.floor(Math.random() * 9999) + 1
    const referenceNumber = `IMCF ${year}-${String(randomNum).padStart(4, '0')}`

    // Create IMCF form
    const imcfForm = await prisma.iMCFForm.create({
      data: {
        referenceNumber,
        projectID: projectId,
        ceID: ceId,
        clearanceRequestor: userId,
        department: user.department || '',
        group: user.group || undefined,
        targetReleaseDate: targetReleaseDate ? new Date(targetReleaseDate) : undefined,
        coverageFromDate: coverageFromDate ? new Date(coverageFromDate) : undefined,
        coverageToDate: coverageToDate ? new Date(coverageToDate) : undefined,
        clearanceRequestorRemarks,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
        personnel: {
          create: personnel?.map((person: PersonnelData) => ({
            registeredName: person.registeredName,
            position: person.position,
            outletVenue: person.outletVenue,
            packagedFee: parseFloat(String(person.packagedFee)) || 0,
            mondayFee: parseFloat(String(person.dailyFees?.monday)) || 0,
            tuesdayFee: parseFloat(String(person.dailyFees?.tuesday)) || 0,
            wednesdayFee: parseFloat(String(person.dailyFees?.wednesday)) || 0,
            thursdayFee: parseFloat(String(person.dailyFees?.thursday)) || 0,
            fridayFee: parseFloat(String(person.dailyFees?.friday)) || 0,
            saturdayFee: parseFloat(String(person.dailyFees?.saturday)) || 0,
            sundayFee: parseFloat(String(person.dailyFees?.sunday)) || 0,
            ownGcash: person.ownGcash,
            authGcash: person.authGcash,
            authGcashAccName: person.authGcashAccName,
            remarks: person.duplicateRemark || person.remarks || null
          })) || []
        }
      },
      include: {
        project: {
          select: {
            projectName: true,
            projectID: true
          }
        },
        ce: {
          select: {
            cepdNumber: true
          }
        },
        requestor: {
          select: {
            name: true,
            email: true
          }
        },
        personnel: true
      }
    })

    return NextResponse.json({
      success: true,
      imcfForm: {
        id: imcfForm.id,
        referenceNumber: imcfForm.referenceNumber,
        status: imcfForm.status,
        project: imcfForm.project,
        ce: imcfForm.ce,
        requestor: imcfForm.requestor,
        personnel: imcfForm.personnel,
        createdAt: imcfForm.createdAt
      },
      message: isDraft ? 'Draft saved successfully' : 'IMCF submitted successfully'
    })

  } catch (error) {
    console.error('Error saving IMCF:', error)
    return NextResponse.json(
      { error: 'Failed to save IMCF form' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const whereClause: {
      clearanceRequestor: string;
      status?: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    } = {
      clearanceRequestor: userId
    }

    if (status && status !== 'all') {
      const upperStatus = status.toUpperCase()
      if (['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(upperStatus)) {
        whereClause.status = upperStatus as 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
      }
    }

    const [imcfForms, total] = await Promise.all([
      prisma.iMCFForm.findMany({
        where: whereClause,
        include: {
          project: {
            select: {
              projectName: true,
              projectID: true
            }
          },
          ce: {
            select: {
              cepdNumber: true
            }
          },
          personnel: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.iMCFForm.count({
        where: whereClause
      })
    ])

    return NextResponse.json({
      imcfForms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching IMCF forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IMCF forms' },
      { status: 500 }
    )
  }
}