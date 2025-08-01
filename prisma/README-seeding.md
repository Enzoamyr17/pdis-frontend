# Database Seeding Instructions

## IM (Independent Manpower) Table Seeding

This directory contains a comprehensive seeding script for populating the IM table with 100 realistic sample records.

### Prerequisites

1. Ensure your database is running and accessible
2. Make sure Prisma is properly configured with your database connection
3. Run any pending migrations: `npx prisma migrate dev`

### Running the Seeding Script

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Run the IM seeding script**:
   ```bash
   npm run seed:im
   ```

   Or directly with tsx:
   ```bash
   npx tsx prisma/seed-im.ts
   ```

### What the Script Does

The seeding script (`seed-im.ts`) generates 100 realistic IM records with:

#### **Personal Information**
- Randomly generated Filipino names (first, middle, last names)
- Random birthdates between 1970-2005
- Unique IM numbers in `YR-XXXXX` format (e.g., `25-00001`)

#### **Contact Information**
- Philippine mobile phone numbers with realistic prefixes
- Email addresses based on names with common domains
- Realistic Philippine addresses using:
  - National Capital Region (NCR)
  - Central Luzon (Region III)
  - CALABARZON (Region IV-A)

#### **Address Details**
- Authentic Filipino street names (Rizal Street, Bonifacio Avenue, etc.)
- Real Philippine regions, provinces, cities, and barangays
- House numbers and optional subdivisions

#### **Payment Information**
- 70% have their own GCash numbers
- 30% use authorized GCash with receiver names
- Realistic Philippine mobile numbers for GCash

#### **Social Media & Files**
- 70% have Facebook profile links
- 60% have IM files (Google Drive) links
- Links follow realistic URL patterns

#### **Status Distribution**
- 90% Active status
- 10% Inactive status
- Random registration dates within the past year

### Script Features

#### **Realistic Data Generation**
- Uses authentic Filipino names, places, and phone number formats
- Follows proper address hierarchy (Region → Province → City → Barangay)
- Generates unique IM numbers following the system's format

#### **Database Safety**
- Creates a default admin user if none exists
- Uses batch insertion (10 records per batch) for performance
- Includes error handling and logging
- Shows progress during execution

#### **Statistics Display**
After completion, the script displays:
- Total IM records created
- Active vs Inactive distribution
- GCash usage statistics
- Social media link statistics

### Sample Output

```
Starting IM database seeding...
Using user admin@projectduo.com as registeredBy for seeded IMs
Creating IM records...
Created batch 1/10 (10 records)
Created batch 2/10 (10 records)
...
✅ Successfully seeded 100 IM records!

📊 Database Statistics:
Total IM records: 100
Active IMs: 89
Inactive IMs: 11
IMs with own GCash: 72
IMs with authorized GCash: 28
IMs with Facebook links: 68
IMs with file links: 59
```

### Customization

You can modify the script to:

1. **Change the number of records**: Edit the loop limit `for (let i = 0; i < 100; i++)`
2. **Add more regions/cities**: Extend the `philippineRegions` array
3. **Adjust data distributions**: Modify the probability values (e.g., `Math.random() < 0.7`)
4. **Clear existing data**: Uncomment the line `await prisma.iM.deleteMany({})`

### Troubleshooting

#### **Database Connection Issues**
- Ensure your `DATABASE_URL` is correctly set in `.env`
- Verify your database is running and accessible

#### **Migration Issues**
- Run `npx prisma migrate dev` to apply any pending migrations
- Ensure the IM table exists with the correct schema

#### **Permission Issues**
- Make sure your database user has INSERT permissions
- Check that the `registeredBy` foreign key constraint is satisfied

#### **TypeScript Issues**
- Run `npx prisma generate` to update the Prisma client
- Ensure all dependencies are installed with `npm install`

### Verification

After seeding, you can verify the data:

1. **Using Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   Navigate to the IM table to view the seeded records.

2. **Using the Application**:
   - Start your Next.js development server: `npm run dev`
   - Navigate to the Independent Manpower module
   - Switch to the "IM List" tab to see the seeded records

3. **Direct Database Query**:
   ```sql
   SELECT COUNT(*) FROM "IM";
   SELECT status, COUNT(*) FROM "IM" GROUP BY status;
   ```

### Data Structure

Each seeded IM record includes:
- **Required fields**: All mandatory fields are populated
- **Optional fields**: Realistically distributed (some records have subdivisions, some don't)
- **Relationships**: Proper foreign key relationships with User table
- **Constraints**: Respects all database constraints and validations

The seeded data is designed to be realistic and useful for:
- UI testing and development
- Performance testing with substantial data
- Feature demonstrations
- Quality assurance testing

### Cleanup

To remove seeded data (if needed):
```sql
DELETE FROM "IM" WHERE "registeredBy" = '[admin-user-id]';
```

Or modify the script to include a cleanup function.