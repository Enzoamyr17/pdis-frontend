/*
  Warnings:

  - The values [PGAS,PGOS] on the enum `Group` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."IMStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Group_new" AS ENUM ('ASG', 'AFG', 'SOG', 'CG');
ALTER TABLE "public"."User" ALTER COLUMN "group" TYPE "public"."Group_new" USING ("group"::text::"public"."Group_new");
ALTER TYPE "public"."Group" RENAME TO "Group_old";
ALTER TYPE "public"."Group_new" RENAME TO "Group";
DROP TYPE "public"."Group_old";
COMMIT;

-- CreateTable
CREATE TABLE "public"."IM" (
    "id" TEXT NOT NULL,
    "imNumber" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "contactNo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "houseNo" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "subdivision" TEXT,
    "region" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "cityMunicipality" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "ownGcash" TEXT NOT NULL,
    "authorizedGcash" TEXT NOT NULL,
    "authorizedReceiver" TEXT NOT NULL,
    "fbLink" TEXT NOT NULL,
    "imFilesLink" TEXT NOT NULL,
    "status" "public"."IMStatus" NOT NULL DEFAULT 'ACTIVE',
    "registeredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IM_imNumber_key" ON "public"."IM"("imNumber");

-- CreateIndex
CREATE INDEX "IM_imNumber_idx" ON "public"."IM"("imNumber");

-- CreateIndex
CREATE INDEX "IM_status_idx" ON "public"."IM"("status");

-- CreateIndex
CREATE INDEX "IM_registeredBy_idx" ON "public"."IM"("registeredBy");

-- CreateIndex
CREATE INDEX "IM_createdAt_idx" ON "public"."IM"("createdAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");

-- CreateIndex
CREATE INDEX "Account_provider_idx" ON "public"."Account"("provider");

-- CreateIndex
CREATE INDEX "Account_expires_at_idx" ON "public"."Account"("expires_at");

-- CreateIndex
CREATE INDEX "Permission_module_idx" ON "public"."Permission"("module");

-- CreateIndex
CREATE INDEX "Permission_modulePermission_idx" ON "public"."Permission"("modulePermission");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "public"."Session"("expires");

-- CreateIndex
CREATE INDEX "User_office_idx" ON "public"."User"("office");

-- CreateIndex
CREATE INDEX "User_group_idx" ON "public"."User"("group");

-- CreateIndex
CREATE INDEX "User_department_idx" ON "public"."User"("department");

-- CreateIndex
CREATE INDEX "User_profileCompleted_idx" ON "public"."User"("profileCompleted");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."IM" ADD CONSTRAINT "IM_registeredBy_fkey" FOREIGN KEY ("registeredBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
