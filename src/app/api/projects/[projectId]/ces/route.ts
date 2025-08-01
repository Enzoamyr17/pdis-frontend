import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params  : Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const projectId = (await params).projectId

    // Check if user has access to this project
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { office: true }
    })

    const isGenAdUser = user?.office === 'PROJECT_DUO_GENERAL_ADMINISTRATION'

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        projectName: true,
        accountManager: true,
        projectManager: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    const hasAccess = isGenAdUser || 
                     project.accountManager === userId || 
                     project.projectManager === userId

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this project' },
        { status: 403 }
      )
    }

    // Get CEs for this project
    const ces = await prisma.cE.findMany({
      where: {
        projectID: projectId
      },
      select: {
        id: true,
        ceID: true,
        cepdNumber: true,
        version: true,
        createdAt: true
      },
      orderBy: [
        { cepdNumber: 'asc' },
        { version: 'asc' }
      ]
    })

    const formattedCEs = ces.map(ce => ({
      id: ce.id,
      ceID: ce.ceID,
      cepdNumber: ce.cepdNumber,
      version: ce.version,
      displayName: ce.cepdNumber,
      createdAt: ce.createdAt
    }))

    return NextResponse.json({
      projectId: projectId,
      projectName: project.projectName,
      ces: formattedCEs,
      total: formattedCEs.length
    })

  } catch (error) {
    console.error('Error fetching CEs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch CEs' },
      { status: 500 }
    )
  }
}