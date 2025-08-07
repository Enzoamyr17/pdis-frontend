-- Create a temporary column to store IM references
ALTER TABLE "IMCFPersonnel" ADD COLUMN "imID" TEXT;

-- Add foreign key constraint
ALTER TABLE "IMCFPersonnel" ADD CONSTRAINT "IMCFPersonnel_imID_fkey" FOREIGN KEY ("imID") REFERENCES "IM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX "IMCFPersonnel_imID_idx" ON "IMCFPersonnel"("imID");

-- Make registeredName, ownGcash, authGcash, and authGcashAccName optional since they will come from IM table
ALTER TABLE "IMCFPersonnel" ALTER COLUMN "registeredName" DROP NOT NULL;
ALTER TABLE "IMCFPersonnel" ALTER COLUMN "ownGcash" DROP NOT NULL;
ALTER TABLE "IMCFPersonnel" ALTER COLUMN "authGcash" DROP NOT NULL;
ALTER TABLE "IMCFPersonnel" ALTER COLUMN "authGcashAccName" DROP NOT NULL;