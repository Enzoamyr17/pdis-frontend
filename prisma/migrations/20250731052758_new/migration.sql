-- CreateEnum
CREATE TYPE "public"."Office" AS ENUM ('PROJECT_DUO_GENERAL_ADMINISTRATION', 'PROJECT_DUO_GENERAL_OPERATIONS');

-- CreateEnum
CREATE TYPE "public"."Group" AS ENUM ('PGAS', 'PGOS');

-- CreateEnum
CREATE TYPE "public"."Department" AS ENUM ('ASSETS_AND_PROPERTY_MANAGEMENT', 'PEOPLE_MANAGEMENT', 'ACCOUNTS_PAYABLE', 'ACCOUNTS_RECEIVABLE', 'TREASURY', 'BUSINESS_UNIT_1', 'BUSINESS_UNIT_2', 'BUSINESS_DEVELOPMENT', 'DESIGN_AND_MULTIMEDIA', 'COPY_AND_DIGITAL');

-- CreateEnum
CREATE TYPE "public"."ModulePermission" AS ENUM ('REQUESTOR', 'APPROVER');

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "lastName" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "position" TEXT,
    "idNumber" TEXT,
    "employmentDate" TIMESTAMP(3),
    "office" "public"."Office",
    "group" "public"."Group",
    "department" "public"."Department",
    "contactNumber" TEXT,
    "pdEmail" TEXT,
    "personalEmail" TEXT,
    "birthdate" TIMESTAMP(3),
    "addressId" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Address" (
    "id" TEXT NOT NULL,
    "houseNo" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "subdivision" TEXT,
    "region" TEXT NOT NULL,
    "province" TEXT,
    "cityMunicipality" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "modulePermission" "public"."ModulePermission" NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_idNumber_key" ON "public"."User"("idNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_pdEmail_key" ON "public"."User"("pdEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_personalEmail_key" ON "public"."User"("personalEmail");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userId_module_key" ON "public"."Permission"("userId", "module");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
