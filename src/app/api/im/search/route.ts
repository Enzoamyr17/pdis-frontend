import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, IMStatus } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/im/search - Search active IMs by name
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    const searchTerm = query.trim().toLowerCase()

    // Search active IMs by firstName, middleName, or lastName
    const ims = await prisma.iM.findMany({
      where: {
        status: IMStatus.ACTIVE,
        OR: [
          {
            firstName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            middleName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        imNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        ownGcash: true,
        authorizedGcash: true,
        authorizedReceiver: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      take: 10 // Limit results for performance
    })

    // Format the results with full name for display
    const formattedResults = ims.map(im => ({
      ...im,
      fullName: `${im.lastName}, ${im.firstName} ${im.middleName || ''}`.trim()
    }))

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Error searching IMs:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}