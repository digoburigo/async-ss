/*
  Warnings:

  - Added the required column `createdById` to the `test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "test" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "deletedReason" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test" ADD CONSTRAINT "test_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
