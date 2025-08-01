import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
          create: personnel?.map((person: {
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
          }) => ({
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
            authGcashAccName: person.authGcashAccName
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