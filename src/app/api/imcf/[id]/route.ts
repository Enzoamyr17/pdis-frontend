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
}

// Helper function to check for duplicate personnel (same as in route.ts)
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
      
      if (isDuplicate) {
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const imcfForm = await prisma.iMCFForm.findUnique({
      where: {
        id: params.id,
        clearanceRequestor: session.user.id // Ensure user can only access their own forms
      },
      include: {
        project: {
          select: {
            id: true,
            projectID: true,
            projectName: true
          }
        },
        ce: {
          select: {
            id: true,
            ceID: true,
            cepdNumber: true
          }
        },
        requestor: {
          select: {
            name: true,
            department: true,
            group: true
          }
        },
        personnel: true
      }
    })

    if (!imcfForm) {
      return NextResponse.json(
        { error: 'IMCF form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(imcfForm)
  } catch (error) {
    console.error('Error fetching IMCF form:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IMCF form' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Check if the form exists and belongs to the user
    const existingForm = await prisma.iMCFForm.findUnique({
      where: {
        id: params.id,
        clearanceRequestor: session.user.id
      }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: 'IMCF form not found' },
        { status: 404 }
      )
    }

    // Only allow editing if the form is in DRAFT status
    if (existingForm.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft forms can be edited' },
        { status: 400 }
      )
    }

    // Check for duplicate personnel for both drafts and submissions
    if (personnel && personnel.length > 0 && projectId && coverageFromDate && coverageToDate) {
      const duplicateResults = await checkForDuplicates(
        personnel,
        projectId,
        coverageFromDate,
        coverageToDate,
        params.id // Exclude current form from duplicate check
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

    // Update IMCF form
    const updatedForm = await prisma.iMCFForm.update({
      where: {
        id: params.id
      },
      data: {
        projectID: projectId,
        ceID: ceId,
        targetReleaseDate: targetReleaseDate ? new Date(targetReleaseDate) : undefined,
        coverageFromDate: coverageFromDate ? new Date(coverageFromDate) : undefined,
        coverageToDate: coverageToDate ? new Date(coverageToDate) : undefined,
        clearanceRequestorRemarks,
        status: isDraft ? 'DRAFT' : 'SUBMITTED',
        personnel: {
          deleteMany: {}, // Remove existing personnel
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
            remarks: person.remarks || null
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
      imcfForm: updatedForm,
      message: isDraft ? 'Draft updated successfully' : 'IMCF updated and submitted successfully'
    })

  } catch (error) {
    console.error('Error updating IMCF:', error)
    return NextResponse.json(
      { error: 'Failed to update IMCF form' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the form exists and belongs to the user
    const existingForm = await prisma.iMCFForm.findUnique({
      where: {
        id: params.id,
        clearanceRequestor: session.user.id
      }
    })

    if (!existingForm) {
      return NextResponse.json(
        { error: 'IMCF form not found' },
        { status: 404 }
      )
    }

    // Only allow deleting if the form is in DRAFT status
    if (existingForm.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft forms can be deleted' },
        { status: 400 }
      )
    }

    // Delete the IMCF form (personnel will be deleted automatically due to cascade)
    await prisma.iMCFForm.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting IMCF:', error)
    return NextResponse.json(
      { error: 'Failed to delete IMCF form' },
      { status: 500 }
    )
  }
}