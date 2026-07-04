/*
  Warnings:

  - You are about to drop the column `isActive` on the `JobPost` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'ANONYMOUS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "EmployerRole" AS ENUM ('ADMIN', 'RECRUITER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "JobPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "score" INTEGER;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "benefits" TEXT[],
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "techStack" TEXT[];

-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "isActive",
ADD COLUMN     "benefits" TEXT[],
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "goLiveAt" TIMESTAMP(3),
ADD COLUMN     "screeningQs" JSONB,
ADD COLUMN     "status" "JobPostStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employerRole" "EmployerRole",
ADD COLUMN     "preferredRoles" TEXT[],
ADD COLUMN     "targetSalary" INTEGER,
ADD COLUMN     "visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC';
