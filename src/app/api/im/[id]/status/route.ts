import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/im/[id]/status - Update IM status
export async function PATCH(
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
    const { status } = body

    // Convert frontend status values to Prisma enum values
    let prismaStatus
    if (status === 'active') {
      prismaStatus = 'ACTIVE'
    } else if (status === 'inactive') {
      prismaStatus = 'INACTIVE'
    } else {
      return new NextResponse('Invalid status. Must be active or inactive', { status: 400 })
    }

    const updatedIM = await prisma.iM.update({
      where: {
        id: params.id
      },
      data: {
        status: prismaStatus
      },
      select: {
        id: true,
        imNumber: true,
        lastName: true,
        firstName: true,
        middleName: true,
        birthday: true,
        contactNo: true,
        email: true,
        houseNo: true,
        street: true,
        subdivision: true,
        region: true,
        province: true,
        cityMunicipality: true,
        barangay: true,
        ownGcash: true,
        authorizedGcash: true,
        authorizedReceiver: true,
        fbLink: true,
        imFilesLink: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(updatedIM)
  } catch (error) {
    console.error('Error updating IM status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}