/*
  Warnings:

  - You are about to drop the column `access_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `access_token_expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `account_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `id_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `provider_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `account` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `inviter_id` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `invitation` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `member` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `organization` table. All the data in the column will be lost.
  - You are about to drop the column `active_organization_id` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `impersonated_by` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `ip_address` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `user_agent` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_by_id` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_reason` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `organization_id` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by_id` on the `todo` table. All the data in the column will be lost.
  - You are about to drop the column `ban_expires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `ban_reason` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `change_password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `display_username` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `verification` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `verification` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviterId` to the `invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `invitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailVerified` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'admin', 'secretary', 'patient', 'member');

-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_inviter_id_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "member" DROP CONSTRAINT "member_user_id_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_deleted_by_id_fkey";

-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "todo" DROP CONSTRAINT "todo_updated_by_id_fkey";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "access_token",
DROP COLUMN "access_token_expires_at",
DROP COLUMN "account_id",
DROP COLUMN "created_at",
DROP COLUMN "id_token",
DROP COLUMN "provider_id",
DROP COLUMN "refresh_token",
DROP COLUMN "refresh_token_expires_at",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idToken" TEXT,
ADD COLUMN     "providerId" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invitation" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "inviter_id",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "inviterId" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "member" DROP COLUMN "created_at",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "active_organization_id",
DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "impersonated_by",
DROP COLUMN "ip_address",
DROP COLUMN "updated_at",
DROP COLUMN "user_agent",
DROP COLUMN "user_id",
ADD COLUMN     "activeOrganizationId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "impersonatedBy" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "todo" DROP COLUMN "created_at",
DROP COLUMN "created_by_id",
DROP COLUMN "deleted_at",
DROP COLUMN "deleted_by_id",
DROP COLUMN "deleted_reason",
DROP COLUMN "due_date",
DROP COLUMN "organization_id",
DROP COLUMN "updated_at",
DROP COLUMN "updated_by_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT,
ADD COLUMN     "deletedReason" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "ban_expires",
DROP COLUMN "ban_reason",
DROP COLUMN "change_password",
DROP COLUMN "created_at",
DROP COLUMN "display_username",
DROP COLUMN "email_verified",
DROP COLUMN "updated_at",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "changePassword" BOOLEAN DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "displayUsername" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "verification" DROP COLUMN "created_at",
DROP COLUMN "expires_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "member_role";

-- DropEnum
DROP TYPE "user_role";

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
