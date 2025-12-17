-- CreateEnum
CREATE TYPE "FirstStepsLinkType" AS ENUM ('internal', 'external', 'none');

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "jobTypeId" TEXT;

-- CreateTable
CREATE TABLE "first_steps_job_types" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "first_steps_job_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_steps_items" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "jobTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "linkType" "FirstStepsLinkType" NOT NULL DEFAULT 'none',
    "linkUrl" TEXT,
    "linkLabel" TEXT,
    "linkOpenInNewTab" BOOLEAN NOT NULL DEFAULT false,
    "estimatedMinutes" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "first_steps_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_steps_progress" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "first_steps_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_steps_quizzes" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "jobTypeId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Quiz de Conhecimento',
    "description" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "first_steps_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_steps_quiz_questions" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "first_steps_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "first_steps_quiz_attempts" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "first_steps_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "first_steps_progress_userId_stepId_key" ON "first_steps_progress"("userId", "stepId");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "first_steps_job_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_job_types" ADD CONSTRAINT "first_steps_job_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_items" ADD CONSTRAINT "first_steps_items_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "first_steps_job_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_items" ADD CONSTRAINT "first_steps_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_progress" ADD CONSTRAINT "first_steps_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_progress" ADD CONSTRAINT "first_steps_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "first_steps_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_progress" ADD CONSTRAINT "first_steps_progress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quizzes" ADD CONSTRAINT "first_steps_quizzes_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "first_steps_job_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quizzes" ADD CONSTRAINT "first_steps_quizzes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quiz_questions" ADD CONSTRAINT "first_steps_quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "first_steps_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quiz_questions" ADD CONSTRAINT "first_steps_quiz_questions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quiz_attempts" ADD CONSTRAINT "first_steps_quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quiz_attempts" ADD CONSTRAINT "first_steps_quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "first_steps_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "first_steps_quiz_attempts" ADD CONSTRAINT "first_steps_quiz_attempts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
