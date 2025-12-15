-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('vendedor', 'gerente_estoque');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('draft', 'pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "MilestoneType" AS ENUM ('sales', 'events', 'kanban_tasks', 'onboarding');

-- CreateEnum
CREATE TYPE "GroupChatMessageType" AS ENUM ('user', 'ai', 'system');

-- CreateEnum
CREATE TYPE "OffboardingCategory" AS ENUM ('handover', 'documentation', 'administrative', 'equipment', 'access');

-- CreateEnum
CREATE TYPE "OffboardingStatus" AS ENUM ('in_progress', 'pending_approval', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "OffboardingReason" AS ENUM ('resignation', 'termination', 'retirement', 'transfer');

-- CreateEnum
CREATE TYPE "HandoverTaskStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "HandoverTaskPriority" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('active', 'hired', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('note', 'stage_change', 'interview', 'email', 'call', 'document', 'other');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('phone', 'video', 'in_person', 'technical', 'behavioral');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE "WorkModel" AS ENUM ('presencial', 'remoto', 'hibrido');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('clt', 'pj', 'estagio', 'temporario');

-- CreateEnum
CREATE TYPE "JobPositionPriority" AS ENUM ('baixa', 'normal', 'alta', 'urgente');

-- CreateEnum
CREATE TYPE "JobPositionStatus" AS ENUM ('aberta', 'pausada', 'fechada', 'cancelada');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('hard_skills', 'soft_skills');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "onboarding_processes" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "employeeType" "EmployeeType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "onboarding_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_documents" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "employeeType" "EmployeeType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "onboarding_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_chats" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "employeeType" "EmployeeType" NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "onboarding_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chats" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "knowledge_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_chat_messages" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" "GroupChatMessageType" NOT NULL DEFAULT 'user',
    "parentMessageId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "group_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_checklist_steps" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "employeeType" "EmployeeType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "onboarding_checklist_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_checklist_progress" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "onboarding_checklist_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "rrule" TEXT,
    "meetingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_boards" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "kanban_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_columns" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "boardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanban_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_cards" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "columnId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_orders" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerAddress" TEXT,
    "customerNeighborhood" TEXT,
    "customerCity" TEXT,
    "customerState" TEXT,
    "customerZipcode" TEXT,
    "customerTaxId" TEXT,
    "customerStateRegistration" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentTerm" TEXT,
    "checkValue" DOUBLE PRECISION,
    "downPayment" DOUBLE PRECISION,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "OrderStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_scores" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "user_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "milestoneType" "MilestoneType" NOT NULL,
    "milestoneCount" INTEGER NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_action_counts" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "actionType" "MilestoneType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "lastActionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "user_action_counts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorial_sectors" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "tutorial_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorial_sections" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "sectorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorial_steps" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeVideoUrl" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorial_step_progress" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "tutorial_step_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "participants" TEXT[],
    "notes" TEXT,
    "transcript" TEXT,
    "rrule" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mindmaps" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "nodes" JSONB NOT NULL DEFAULT '[]',
    "edges" JSONB NOT NULL DEFAULT '[]',
    "viewport" JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "zoom": 1}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "mindmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offboarding_checklist_steps" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "OffboardingCategory" NOT NULL DEFAULT 'handover',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "requiresAdminApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "offboarding_checklist_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offboarding_processes" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "userId" TEXT NOT NULL,
    "initiatedById" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "employeeEmail" TEXT NOT NULL,
    "department" TEXT,
    "lastWorkingDay" TIMESTAMP(3),
    "reason" "OffboardingReason",
    "status" "OffboardingStatus" NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "organizationId" TEXT,

    CONSTRAINT "offboarding_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offboarding_progress" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "processId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completedById" TEXT,
    "adminApproved" BOOLEAN NOT NULL DEFAULT false,
    "adminApprovedAt" TIMESTAMP(3),
    "adminApprovedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "offboarding_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offboarding_handover_tasks" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "processId" TEXT NOT NULL,
    "taskTitle" TEXT NOT NULL,
    "taskDescription" TEXT,
    "assignedToId" TEXT,
    "assignedToName" TEXT,
    "status" "HandoverTaskStatus" NOT NULL DEFAULT 'pending',
    "priority" "HandoverTaskPriority" NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "offboarding_handover_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_stages" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_job_positions" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "title" TEXT NOT NULL,
    "department" TEXT,
    "description" TEXT,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "location" TEXT,
    "workModel" "WorkModel" NOT NULL DEFAULT 'presencial',
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'clt',
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "filledVacancies" INTEGER NOT NULL DEFAULT 0,
    "priority" "JobPositionPriority" NOT NULL DEFAULT 'normal',
    "status" "JobPositionStatus" NOT NULL DEFAULT 'aberta',
    "hiringManager" TEXT,
    "hiringManagerEmail" TEXT,
    "deadline" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_job_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_candidates" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT,
    "stageId" TEXT,
    "jobPositionId" TEXT,
    "source" TEXT,
    "resumeUrl" TEXT,
    "expectedSalary" DOUBLE PRECISION,
    "expectedStartDate" TIMESTAMP(3),
    "notes" TEXT,
    "rating" INTEGER,
    "status" "CandidateStatus" NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_activities" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "candidateId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_interviews" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "candidateId" TEXT NOT NULL,
    "interviewerName" TEXT NOT NULL,
    "interviewerEmail" TEXT,
    "interviewType" "InterviewType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "location" TEXT,
    "meetingLink" TEXT,
    "notes" TEXT,
    "feedback" TEXT,
    "rating" INTEGER,
    "status" "InterviewStatus" NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_candidate_questions" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "candidateId" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "question" TEXT NOT NULL,
    "expectedAnswer" TEXT,
    "answer" TEXT,
    "rating" INTEGER,
    "notes" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_candidate_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preboarding_candidate_documents" (
    "id" TEXT NOT NULL DEFAULT uuidv7(),
    "candidateId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "aiAnalysis" TEXT,
    "adherenceScore" DOUBLE PRECISION,
    "analyzedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "preboarding_candidate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_checklist_progress_userId_stepId_key" ON "onboarding_checklist_progress"("userId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_orderNumber_key" ON "sales_orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_scores_userId_key" ON "user_scores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "user_action_counts_userId_actionType_key" ON "user_action_counts"("userId", "actionType");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_step_progress_userId_stepId_key" ON "tutorial_step_progress"("userId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "offboarding_progress_processId_stepId_key" ON "offboarding_progress"("processId", "stepId");

-- AddForeignKey
ALTER TABLE "onboarding_processes" ADD CONSTRAINT "onboarding_processes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_documents" ADD CONSTRAINT "onboarding_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_chats" ADD CONSTRAINT "onboarding_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_chats" ADD CONSTRAINT "onboarding_chats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chats" ADD CONSTRAINT "knowledge_chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chats" ADD CONSTRAINT "knowledge_chats_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_chat_messages" ADD CONSTRAINT "group_chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_chat_messages" ADD CONSTRAINT "group_chat_messages_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "group_chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_chat_messages" ADD CONSTRAINT "group_chat_messages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_checklist_steps" ADD CONSTRAINT "onboarding_checklist_steps_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_checklist_progress" ADD CONSTRAINT "onboarding_checklist_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_checklist_progress" ADD CONSTRAINT "onboarding_checklist_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "onboarding_checklist_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_checklist_progress" ADD CONSTRAINT "onboarding_checklist_progress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_columns" ADD CONSTRAINT "kanban_columns_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "kanban_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "kanban_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sales_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scores" ADD CONSTRAINT "user_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_scores" ADD CONSTRAINT "user_scores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_action_counts" ADD CONSTRAINT "user_action_counts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_action_counts" ADD CONSTRAINT "user_action_counts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_sectors" ADD CONSTRAINT "tutorial_sectors_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_sections" ADD CONSTRAINT "tutorial_sections_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "tutorial_sectors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_steps" ADD CONSTRAINT "tutorial_steps_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "tutorial_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_step_progress" ADD CONSTRAINT "tutorial_step_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_step_progress" ADD CONSTRAINT "tutorial_step_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "tutorial_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_step_progress" ADD CONSTRAINT "tutorial_step_progress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmaps" ADD CONSTRAINT "mindmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindmaps" ADD CONSTRAINT "mindmaps_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_checklist_steps" ADD CONSTRAINT "offboarding_checklist_steps_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_processes" ADD CONSTRAINT "offboarding_processes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_processes" ADD CONSTRAINT "offboarding_processes_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_processes" ADD CONSTRAINT "offboarding_processes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_progress" ADD CONSTRAINT "offboarding_progress_processId_fkey" FOREIGN KEY ("processId") REFERENCES "offboarding_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_progress" ADD CONSTRAINT "offboarding_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "offboarding_checklist_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_progress" ADD CONSTRAINT "offboarding_progress_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_progress" ADD CONSTRAINT "offboarding_progress_adminApprovedById_fkey" FOREIGN KEY ("adminApprovedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_progress" ADD CONSTRAINT "offboarding_progress_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_handover_tasks" ADD CONSTRAINT "offboarding_handover_tasks_processId_fkey" FOREIGN KEY ("processId") REFERENCES "offboarding_processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_handover_tasks" ADD CONSTRAINT "offboarding_handover_tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_handover_tasks" ADD CONSTRAINT "offboarding_handover_tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_stages" ADD CONSTRAINT "preboarding_stages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_job_positions" ADD CONSTRAINT "preboarding_job_positions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_job_positions" ADD CONSTRAINT "preboarding_job_positions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidates" ADD CONSTRAINT "preboarding_candidates_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "preboarding_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidates" ADD CONSTRAINT "preboarding_candidates_jobPositionId_fkey" FOREIGN KEY ("jobPositionId") REFERENCES "preboarding_job_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidates" ADD CONSTRAINT "preboarding_candidates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidates" ADD CONSTRAINT "preboarding_candidates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_activities" ADD CONSTRAINT "preboarding_activities_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "preboarding_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_activities" ADD CONSTRAINT "preboarding_activities_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_activities" ADD CONSTRAINT "preboarding_activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_interviews" ADD CONSTRAINT "preboarding_interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "preboarding_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_interviews" ADD CONSTRAINT "preboarding_interviews_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidate_questions" ADD CONSTRAINT "preboarding_candidate_questions_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "preboarding_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidate_questions" ADD CONSTRAINT "preboarding_candidate_questions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidate_documents" ADD CONSTRAINT "preboarding_candidate_documents_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "preboarding_candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidate_documents" ADD CONSTRAINT "preboarding_candidate_documents_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preboarding_candidate_documents" ADD CONSTRAINT "preboarding_candidate_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
