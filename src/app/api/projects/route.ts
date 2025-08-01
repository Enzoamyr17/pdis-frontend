import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const search = searchParams.get('search') || ''

    // Get projects where user is account manager, project manager, or GenAd user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { office: true, group: true, department: true }
    })

    const isGenAdUser = user?.office === 'PROJECT_DUO_GENERAL_ADMINISTRATION'

    let whereClause: {
      OR?: Array<{
        accountManager?: string;
        projectManager?: string;
        projectName?: { contains: string; mode: 'insensitive' };
        projectID?: { contains: string; mode: 'insensitive' };
        brand?: { contains: string; mode: 'insensitive' };
      }>;
      AND?: Array<{ 
        OR: Array<{
          projectName?: { contains: string; mode: 'insensitive' };
          projectID?: { contains: string; mode: 'insensitive' };
          brand?: { contains: string; mode: 'insensitive' };
        }> 
      }>;
    } = {}

    if (isGenAdUser) {
      // GenAd users can access all projects
      whereClause = search 
        ? {
            OR: [
              { projectName: { contains: search, mode: 'insensitive' } },
              { projectID: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {}
    } else {
      // Other users can only access projects they're assigned to
      whereClause = {
        OR: [
          { accountManager: userId },
          { projectManager: userId }
        ],
        ...(search && {
          AND: [
            {
              OR: [
                { projectName: { contains: search, mode: 'insensitive' } },
                { projectID: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } }
              ]
            }
          ]
        })
      }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      select: {
        id: true,
        projectID: true,
        projectName: true,
        type: true,
        brand: true,
        projectDate: true,
        projectVenue: true,
        internalBudgetInitial: true,
        internalBudgetCurrent: true,
        accountManagerUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        projectManagerUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ces: {
          select: {
            id: true,
            ceID: true,
            cepdNumber: true,
            version: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' },
        { projectName: 'asc' }
      ],
      take: 50 // Limit results for performance
    })

    const formattedProjects = projects.map(project => ({
      id: project.id,
      projectID: project.projectID,
      projectName: project.projectName,
      displayName: `${project.projectName} - ${project.projectID}`,
      type: project.type,
      brand: project.brand,
      projectDate: project.projectDate,
      projectVenue: project.projectVenue,
      internalBudgetInitial: project.internalBudgetInitial,
      internalBudgetCurrent: project.internalBudgetCurrent,
      accountManager: project.accountManagerUser,
      projectManager: project.projectManagerUser,
      cesCount: project.ces.length,
      ces: project.ces
    }))

    return NextResponse.json({
      projects: formattedProjects,
      total: formattedProjects.length
    })

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}