import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/im - Get all IM registrations
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
 //issue
    const ims = await prisma.iM.findMany({
      include: {
        registeredByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(ims)
  } catch (error) {
    console.error('Error fetching IMs:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// POST /api/im - Create new IM registration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const {
      lastName,
      firstName,
      middleName,
      birthday,
      contactNo,
      email,
      houseNo,
      street,
      subdivision,
      region,
      province,
      cityMunicipality,
      barangay,
      ownGcash,
      authorizedGcash,
      authorizedReceiver,
      fbLink,
      imFilesLink
    } = body

    // Generate IM number (YR-XXXXX format)
    const currentYear = new Date().getFullYear().toString().slice(-2)
    const lastIM = await prisma.iM.findFirst({
      where: {
        imNumber: {
          startsWith: `${currentYear}-`
        }
      },
      orderBy: {
        imNumber: 'desc'
      }
    })

    let nextNumber = 1
    if (lastIM) {
      const lastNumber = parseInt(lastIM.imNumber.split('-')[1])
      nextNumber = lastNumber + 1
    }

    const imNumber = `${currentYear}-${nextNumber.toString().padStart(5, '0')}`

    // Create IM registration
    const newIM = await prisma.iM.create({
      data: {
        imNumber,
        lastName,
        firstName,
        middleName,
        birthday: new Date(birthday),
        contactNo,
        email,
        houseNo,
        street,
        subdivision: subdivision || null,
        region,
        province,
        cityMunicipality,
        barangay,
        ownGcash,
        authorizedGcash,
        authorizedReceiver,
        fbLink,
        imFilesLink,
        registeredBy: session.user.id
      },
      include: {
        registeredByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(newIM, { status: 201 })
  } catch (error) {
    console.error('Error creating IM:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}