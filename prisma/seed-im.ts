import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Philippine regions and provinces data for realistic addresses
const philippineRegions = [
  {
    name: 'National Capital Region (NCR)',
    cities: ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig', 'Marikina', 'Caloocan', 'Las Piñas', 'Muntinlupa', 'Parañaque']
  },
  {
    name: 'Region III (Central Luzon)',
    province: 'Bulacan',
    cities: ['Malolos', 'Meycauayan', 'San Jose del Monte', 'Marilao', 'Bocaue']
  },
  {
    name: 'Region IV-A (CALABARZON)',
    province: 'Laguna',
    cities: ['Santa Rosa', 'Biñan', 'San Pedro', 'Calamba', 'Los Baños']
  },
  {
    name: 'Region IV-A (CALABARZON)',
    province: 'Cavite',
    cities: ['Bacoor', 'Imus', 'Dasmariñas', 'General Trias', 'Silang']
  },
  {
    name: 'Region IV-A (CALABARZON)',
    province: 'Rizal',
    cities: ['Antipolo', 'Cainta', 'Taytay', 'Angono', 'San Mateo']
  }
]

// Sample barangays for each city
const barangays = [
  'Barangay 1', 'Barangay 2', 'Barangay 3', 'Poblacion', 'San Antonio', 'San Jose',
  'Santa Cruz', 'Santo Domingo', 'San Miguel', 'San Juan', 'Santa Maria', 'San Pedro',
  'San Pablo', 'San Rafael', 'San Nicolas', 'Santa Ana', 'San Isidro', 'San Vicente'
]

// Sample first names
const firstNames = [
  'Maria', 'Jose', 'Juan', 'Ana', 'Antonio', 'Rosa', 'Manuel', 'Carmen', 'Francisco', 'Elena',
  'Pedro', 'Luz', 'Carlos', 'Esperanza', 'Ricardo', 'Josephine', 'Roberto', 'Cristina', 'Luis', 'Teresita',
  'Miguel', 'Marilyn', 'Rafael', 'Gloria', 'Jesus', 'Rosario', 'Fernando', 'Remedios', 'Eduardo', 'Erlinda',
  'Angel', 'Soledad', 'Salvador', 'Leticia', 'Alfredo', 'Milagros', 'Alberto', 'Corazon', 'Ramon', 'Victoria',
  'Leonardo', 'Mercedes', 'Reynaldo', 'Felicidad', 'Mario', 'Concepcion', 'Ernesto', 'Natividad', 'Armando', 'Pacita'
]

// Sample middle names
const middleNames = [
  'De Leon', 'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Gonzales',
  'Rodriguez', 'Perez', 'Flores', 'Rivera', 'Gomez', 'Morales', 'Ramos', 'Castillo', 'Aquino', 'Villanueva',
  'Francisco', 'Santiago', 'Romero', 'Fernandez', 'Valdez', 'Mercado', 'Jimenez', 'Aguilar', 'Herrera', 'Castro'
]

// Sample last names
const lastNames = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Gonzales', 'Rodriguez',
  'Perez', 'Flores', 'Rivera', 'Gomez', 'Morales', 'Ramos', 'Castillo', 'Aquino', 'Villanueva', 'Francisco',
  'Santiago', 'Romero', 'Fernandez', 'Valdez', 'Mercado', 'Jimenez', 'Aguilar', 'Herrera', 'Castro', 'Diaz',
  'Martin', 'Lopez', 'Hernandez', 'Vargas', 'Silva', 'Medina', 'Guerrero', 'Ruiz', 'Alvarez', 'Ortega',
  'Navarro', 'Delgado', 'Moreno', 'Gutierrez', 'Chavez', 'Estrada', 'Sandoval', 'Salazar', 'Rojas', 'Contreras'
]

// Sample streets
const streets = [
  'Rizal Street', 'Bonifacio Avenue', 'Del Pilar Street', 'Mabini Street', 'Luna Street',
  'Burgos Street', 'Quezon Avenue', 'Aguinaldo Street', 'Laurel Street', 'Osmena Street',
  'Roxas Boulevard', 'Taft Avenue', 'EDSA', 'Commonwealth Avenue', 'Katipunan Avenue',
  'Ortigas Avenue', 'Shaw Boulevard', 'Marcos Highway', 'Magsaysay Street', 'Harrison Street'
]

// Sample subdivisions
const subdivisions = [
  'Villa Verde', 'Golden Hills', 'Greenfields', 'Sunrise Village', 'Palm Grove',
  'Royal Palm', 'Forest Hills', 'Garden Heights', 'Valley View', 'Mountain View',
  'Riverside', 'Lakeshore', 'Oceanview', 'Hillcrest', 'Meadowbrook',
  null, null, null // Some entries without subdivision
]

// Generate random date between 1970 and 2005 for birthday
function getRandomBirthday() {
  const start = new Date('1970-01-01')
  const end = new Date('2005-12-31')
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate random phone number
function getRandomPhoneNumber() {
  const prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926', '0927', '0928', '0929', '0939', '0956', '0957', '0958', '0959', '0963', '0965', '0966', '0967', '0968', '0969', '0970', '0975', '0976', '0977', '0978', '0979', '0989', '0992', '0993', '0994', '0995', '0996', '0997', '0998', '0999']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(1000000 + Math.random() * 9000000).toString()
  return prefix + suffix
}

// Generate random email
function getRandomEmail(firstName: string, lastName: string) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'email.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`
  return `${emailPrefix}@${domain}`
}

// Generate GCash number
function getRandomGCashNumber() {
  return getRandomPhoneNumber()
}

// Generate Facebook link
function getRandomFacebookLink(firstName: string, lastName: string) {
  if (Math.random() < 0.3) return null // 30% chance of no FB link
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`
  return `https://facebook.com/${username}`
}

// Generate IM Files link
function getRandomIMFilesLink() {
  if (Math.random() < 0.4) return null // 40% chance of no files link
  const fileId = Math.random().toString(36).substring(2, 15)
  return `https://drive.google.com/drive/folders/${fileId}`
}

// Generate random address
function getRandomAddress() {
  const region = philippineRegions[Math.floor(Math.random() * philippineRegions.length)]
  const city = region.cities[Math.floor(Math.random() * region.cities.length)]
  const street = streets[Math.floor(Math.random() * streets.length)]
  const subdivision = subdivisions[Math.floor(Math.random() * subdivisions.length)]
  const barangay = barangays[Math.floor(Math.random() * barangays.length)]
  const houseNo = Math.floor(1 + Math.random() * 999).toString()

  return {
    houseNo,
    street,
    subdivision,
    region: region.name,
    province: region.province || null,
    cityMunicipality: city,
    barangay
  }
}

// Generate IM number in YR-XXXXX format
function generateIMNumber(index: number) {
  const currentYear = new Date().getFullYear().toString().slice(-2)
  return `${currentYear}-${(index + 1).toString().padStart(5, '0')}`
}

async function main() {
  console.log('Starting IM database seeding...')

  // Get the first user to use as registeredBy (or create a default admin user)
  let adminUser = await prisma.user.findFirst({
    where: {
      email: {
        contains: '@'
      }
    }
  })

  // If no users exist, create a default admin user for seeding purposes
  if (!adminUser) {
    console.log('No users found. Creating default admin user for seeding...')
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@projectduo.com',
        name: 'System Administrator',
        firstName: 'System',
        lastName: 'Administrator',
        profileCompleted: true,
        office: 'PROJECT_DUO_GENERAL_ADMINISTRATION',
        group: 'ASG',
        department: 'PEOPLE_MANAGEMENT'
      }
    })
  }

  console.log(`Using user ${adminUser.email} as registeredBy for seeded IMs`)

  // Clear existing IM records (optional - uncomment if you want to start fresh)
  // console.log('Clearing existing IM records...')
  // await prisma.iM.deleteMany({})

  const imData = []
  
  for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const middleName = Math.random() < 0.8 ? middleNames[Math.floor(Math.random() * middleNames.length)] : '' // 80% have middle names
    const address = getRandomAddress()
    const hasOwnGcash = Math.random() < 0.7 // 70% have own GCash
    
    const imRecord = {
      imNumber: generateIMNumber(i),
      firstName,
      lastName,
      middleName,
      birthday: getRandomBirthday(),
      contactNo: getRandomPhoneNumber(),
      email: getRandomEmail(firstName, lastName),
      houseNo: address.houseNo,
      street: address.street,
      subdivision: address.subdivision,
      region: address.region,
      province: address.province,
      cityMunicipality: address.cityMunicipality,
      barangay: address.barangay,
      ownGcash: hasOwnGcash ? getRandomGCashNumber() : null,
      authorizedGcash: !hasOwnGcash ? getRandomGCashNumber() : null,
      authorizedReceiver: !hasOwnGcash ? `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}` : null,
      fbLink: getRandomFacebookLink(firstName, lastName),
      imFilesLink: getRandomIMFilesLink(),
      status: Math.random() < 0.9 ? 'ACTIVE' : 'INACTIVE', // 90% active, 10% inactive
      registeredBy: adminUser.id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)), // Random date within last year
    }
    
    imData.push(imRecord)
  }

  console.log('Creating IM records...')
  
  // Insert records in batches to avoid potential issues
  const batchSize = 10
  for (let i = 0; i < imData.length; i += batchSize) {
    const batch = imData.slice(i, i + batchSize)
    await prisma.iM.createMany({
      data: batch,
      skipDuplicates: true
    })
    console.log(`Created batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(imData.length/batchSize)} (${batch.length} records)`)
  }

  console.log(`✅ Successfully seeded ${imData.length} IM records!`)
  
  // Display some statistics
  const totalIMs = await prisma.iM.count()
  const activeIMs = await prisma.iM.count({ where: { status: 'ACTIVE' } })
  const inactiveIMs = await prisma.iM.count({ where: { status: 'INACTIVE' } })
  
  console.log('\n📊 Database Statistics:')
  console.log(`Total IM records: ${totalIMs}`)
  console.log(`Active IMs: ${activeIMs}`)
  console.log(`Inactive IMs: ${inactiveIMs}`)
  console.log(`IMs with own GCash: ${await prisma.iM.count({ where: { ownGcash: { not: null } } })}`)
  console.log(`IMs with authorized GCash: ${await prisma.iM.count({ where: { authorizedGcash: { not: null } } })}`)
  console.log(`IMs with Facebook links: ${await prisma.iM.count({ where: { fbLink: { not: null } } })}`)
  console.log(`IMs with file links: ${await prisma.iM.count({ where: { imFilesLink: { not: null } } })}`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })