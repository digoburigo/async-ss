/*
  Warnings:

  - You are about to drop the column `endTime` on the `calendar_events` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `calendar_events` table. All the data in the column will be lost.
  - Added the required column `end` to the `calendar_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `calendar_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `kanban_cards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('MEETING', 'ONBOARDING', 'TRAINING', 'INTERVIEW', 'TASK', 'OTHER');

-- AlterTable
ALTER TABLE "calendar_events" DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventType" "CalendarEventType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "kanban_cards" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "deletedReason" TEXT,
ADD COLUMN     "updatedById" TEXT;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
