import { PrismaClient, ProjectType, User } from '@prisma/client'

const prisma = new PrismaClient()

interface TestUser {
  id: string
  name: string
  email: string
}

const testUsers: TestUser[] = [
  {
    id: 'cmdro7px90000rfiu548jccx9',
    name: 'Carlo Angelo Felipe',
    email: 'carlo@example.com'
  },
  {
    id: 'cmds6fsaj0000i809t7wgnnig', 
    name: 'Von',
    email: 'von@example.com'
  }
]

const projectTypes: ProjectType[] = [
  'BTL_ACTIVATION',
  'SPECIAL_EVENT_PRODUCT',
  'MERCHANDISING',
  'MULTIMEDIA_PRODUCTION',
  'IN_TRADE_IN_STORE_EXPO_EXHIBITS_CONVENTIONS',
  'FABRICATION_SETUP',
  'OTHER_SERVICES'
]

const sampleProjects = [
  {
    projectID: 'PRJ-2024-001',
    projectName: 'Summer Brand Activation Campaign',
    type: 'BTL_ACTIVATION' as ProjectType,
    projectDate: new Date('2024-06-15'),
    projectVenue: 'SM Mall of Asia',
    brand: 'CocaCola',
    companyName: 'Coca-Cola Philippines',
    department: 'Marketing',
    proponent: 'Marketing Team Lead',
    internalBudgetInitial: 500000.00,
    internalBudgetCurrent: 500000.00
  },
  {
    projectID: 'PRJ-2024-002',
    projectName: 'Product Launch Event - New Smartphone',
    type: 'SPECIAL_EVENT_PRODUCT' as ProjectType,
    projectDate: new Date('2024-07-20'),
    projectVenue: 'Shangri-La Plaza',
    brand: 'Samsung',
    companyName: 'Samsung Philippines',
    department: 'Product Marketing',
    proponent: 'Product Manager',
    internalBudgetInitial: 750000.00,
    internalBudgetCurrent: 750000.00
  },
  {
    projectID: 'PRJ-2024-003',
    projectName: 'Holiday Merchandising Display',
    type: 'MERCHANDISING' as ProjectType,
    projectDate: new Date('2024-11-01'),
    projectVenue: 'Multiple Retail Locations',
    brand: 'Unilever',
    companyName: 'Unilever Philippines',
    department: 'Trade Marketing',
    proponent: 'Trade Marketing Manager',
    internalBudgetInitial: 300000.00,
    internalBudgetCurrent: 300000.00
  },
  {
    projectID: 'PRJ-2024-004',
    projectName: 'Corporate Video Production',
    type: 'MULTIMEDIA_PRODUCTION' as ProjectType,
    projectDate: new Date('2024-08-10'),
    projectVenue: 'Various Studio Locations',
    brand: 'PLDT',
    companyName: 'PLDT Inc.',
    department: 'Corporate Communications',
    proponent: 'Communications Director',
    internalBudgetInitial: 400000.00,
    internalBudgetCurrent: 400000.00
  },
  {
    projectID: 'PRJ-2024-005',
    projectName: 'Trade Show Exhibition Setup',
    type: 'IN_TRADE_IN_STORE_EXPO_EXHIBITS_CONVENTIONS' as ProjectType,
    projectDate: new Date('2024-09-05'),
    projectVenue: 'World Trade Center',
    brand: 'Globe Telecom',
    companyName: 'Globe Telecom Inc.',
    department: 'Business Development',
    proponent: 'Business Development Head',
    internalBudgetInitial: 600000.00,
    internalBudgetCurrent: 600000.00
  }
]

const generateCEsForProject = (projectId: string, projectIndex: number) => {
  const numCEs = Math.floor(Math.random() * 3) + 1 // 1-3 CEs per project
  const ces = []
  
  for (let i = 0; i < numCEs; i++) {
    const ceNumber = `24-${String(6361 + projectIndex).padStart(4, '0')}.${i + 1}`
    const version = i === 0 ? 'V1' : `V${i + 1}`
    
    ces.push({
      ceID: `CE-${projectId}-${i + 1}`,
      projectID: projectId,
      cepdNumber: `${ceNumber} ${version}`,
      version: version
    })
  }
  
  return ces
}

async function main() {
  console.log('🌱 Starting Project and CE database seeding...')
  
  try {
    // Check if users exist, if not create test users
    for (const testUser of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      })
      
      if (!existingUser) {
        console.log(`Creating test user: ${testUser.name}`)
        await prisma.user.create({
          data: {
            id: testUser.id,
            name: testUser.name,
            email: testUser.email,
            profileCompleted: true
          }
        })
      } else {
        console.log(`Test user ${testUser.name} already exists`)
      }
    }

    // Clear existing projects and CEs
    console.log('🗑️ Clearing existing Project and CE data...')
    await prisma.iMCFPersonnel.deleteMany({})
    await prisma.iMCFForm.deleteMany({})
    await prisma.cE.deleteMany({})
    await prisma.project.deleteMany({})

    console.log('📝 Creating Projects...')
    const createdProjects = []
    
    for (let i = 0; i < sampleProjects.length; i++) {
      const projectData = sampleProjects[i]
      const accountManager = i % 2 === 0 ? testUsers[0].id : testUsers[1].id
      const projectManager = i % 2 === 0 ? testUsers[1].id : testUsers[0].id
      
      const project = await prisma.project.create({
        data: {
          ...projectData,
          accountManager,
          projectManager,
          artist: Math.random() > 0.5 ? 'Creative Artist' : undefined,
          writer: Math.random() > 0.5 ? 'Content Writer' : undefined,
          others: Math.random() > 0.3 ? 'Additional team members' : undefined
        }
      })
      
      createdProjects.push(project)
      console.log(`✅ Created project: ${project.projectName}`)
    }

    console.log('📋 Creating CEs for each project...')
    let totalCEs = 0
    
    for (let i = 0; i < createdProjects.length; i++) {
      const project = createdProjects[i]
      const ces = generateCEsForProject(project.id, i)
      
      for (const ceData of ces) {
        await prisma.cE.create({
          data: ceData
        })
        totalCEs++
      }
      
      console.log(`✅ Created ${ces.length} CE(s) for project: ${project.projectName}`)
    }

    console.log('\n🎉 Project and CE seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   Projects created: ${createdProjects.length}`)
    console.log(`   CEs created: ${totalCEs}`)
    console.log(`   Test users: ${testUsers.length}`)
    
    // Display project assignments
    console.log('\n👥 Project Assignments:')
    for (const project of createdProjects) {
      const accountManager = testUsers.find(u => u.id === project.accountManager)
      const projectManager = testUsers.find(u => u.id === project.projectManager)
      console.log(`   ${project.projectName}:`)
      console.log(`     Account Manager: ${accountManager?.name}`)
      console.log(`     Project Manager: ${projectManager?.name}`)
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })