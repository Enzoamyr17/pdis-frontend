import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, IMStatus } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/im/[id] - Get specific IM registration
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const im = await prisma.iM.findUnique({
      where: {
        id: params.id
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

    if (!im) {
      return new NextResponse('IM not found', { status: 404 })
    }

    return NextResponse.json(im)
  } catch (error) {
    console.error('Error fetching IM:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// PUT /api/im/[id] - Update IM registration
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
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
      imFilesLink,
      status
    } = body

    // Convert status if provided
    let prismaStatus: IMStatus | undefined = undefined
    if (status) {
      if (status === 'active') {
        prismaStatus = IMStatus.ACTIVE
      } else if (status === 'inactive') {
        prismaStatus = IMStatus.INACTIVE
      }
    }

    const updatedIM = await prisma.iM.update({
      where: {
        id: params.id
      },
      data: {
        lastName,
        firstName,
        middleName,
        birthday: birthday ? new Date(birthday) : undefined,
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
        ...(prismaStatus ? { status: prismaStatus } : {})
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

    return NextResponse.json(updatedIM)
  } catch (error) {
    console.error('Error updating IM:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// DELETE /api/im/[id] - Delete IM registration
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.iM.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse('IM deleted successfully', { status: 200 })
  } catch (error) {
    console.error('Error deleting IM:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}