import { authDb, db } from "@acme/zen-v3";

import { auth } from "./src/plugins/better-auth";

async function main() {
  console.log("🌱 Clearing database...");

  // Clear all tables in reverse dependency order
  await Promise.all([
    // Preboarding
    db.preboardingCandidateDocument.deleteMany(),
    db.preboardingCandidateQuestion.deleteMany(),
    db.preboardingInterview.deleteMany(),
    db.preboardingActivity.deleteMany(),
  ]);

  await db.preboardingCandidate.deleteMany();
  await db.preboardingJobPosition.deleteMany();
  await db.preboardingStage.deleteMany();

  // Offboarding
  await Promise.all([
    db.offboardingHandoverTask.deleteMany(),
    db.offboardingProgress.deleteMany(),
  ]);
  await db.offboardingProcess.deleteMany();
  await db.offboardingChecklistStep.deleteMany();

  // Tutorials
  await db.tutorialStepProgress.deleteMany();
  await db.tutorialStep.deleteMany();
  await db.tutorialSection.deleteMany();
  await db.tutorialSector.deleteMany();

  // Gamification
  await Promise.all([
    db.userAchievement.deleteMany(),
    db.userActionCount.deleteMany(),
    db.userScore.deleteMany(),
  ]);
  await db.achievement.deleteMany();

  // Sales
  await db.orderItem.deleteMany();
  await db.salesOrder.deleteMany();

  // Kanban
  await db.kanbanCard.deleteMany();
  await db.kanbanColumn.deleteMany();
  await db.kanbanBoard.deleteMany();

  // Calendar & Meetings
  await db.calendarEvent.deleteMany();
  await db.meeting.deleteMany();

  // Mindmaps
  await db.mindmap.deleteMany();

  // Checklists
  await db.onboardingChecklistProgress.deleteMany();
  await db.onboardingChecklistStep.deleteMany();

  // Chats
  await Promise.all([
    db.groupChatMessage.deleteMany(),
    db.knowledgeChat.deleteMany(),
    db.onboardingChat.deleteMany(),
  ]);

  // Onboarding
  await Promise.all([
    db.onboardingDocument.deleteMany(),
    db.onboardingProcess.deleteMany(),
  ]);

  // Business models
  await Promise.all([
    db.client.deleteMany(),
    db.product.deleteMany(),
    db.test.deleteMany(),
    db.todo.deleteMany(),
  ]);

  // Auth & Core
  await Promise.all([
    db.invitation.deleteMany(),
    db.member.deleteMany(),
    db.session.deleteMany(),
    db.account.deleteMany(),
    db.verification.deleteMany(),
  ]);

  await db.organization.deleteMany();
  await db.user.deleteMany();

  console.log("🌱 Seeding database...");

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log("🌱 Creating users...");

  const [adminUser, managerUser, memberUser] = await Promise.all([
    auth.api.signUpEmail({
      body: {
        email: "admin@example.com",
        password: "12345678",
        name: "Admin User",
      },
    }),
    auth.api.signUpEmail({
      body: {
        email: "manager@example.com",
        password: "12345678",
        name: "Manager User",
      },
    }),
    auth.api.signUpEmail({
      body: {
        email: "member@example.com",
        password: "12345678",
        name: "Member User",
      },
    }),
  ]);

  // ============================================
  // 2. CREATE ORGANIZATIONS
  // ============================================
  console.log("🌱 Creating organizations...");

  const [orgMain, orgSecondary] = await db.organization.createManyAndReturn({
    data: [
      {
        name: "Main Organization",
        slug: "main-org",
        metadata: JSON.stringify({
          address: "123 Main St",
          phone: "(11) 99999-9999",
          email: "contact@mainorg.com",
        }),
      },
      {
        name: "Secondary Organization",
        slug: "secondary-org",
        metadata: JSON.stringify({
          address: "456 Secondary Ave",
          phone: "(11) 88888-8888",
          email: "contact@secondaryorg.com",
        }),
      },
    ],
  });

  // ============================================
  // 3. CREATE MEMBERS & UPDATE USERS
  // ============================================
  console.log("🌱 Creating members...");

  await Promise.all([
    db.user.update({
      where: { id: adminUser.user.id },
      data: { role: "admin", emailVerified: true },
    }),
    db.user.update({
      where: { id: managerUser.user.id },
      data: { role: "user", emailVerified: true },
    }),
    db.user.update({
      where: { id: memberUser.user.id },
      data: { role: "user", emailVerified: true },
    }),
    db.member.createMany({
      data: [
        {
          userId: adminUser.user.id,
          organizationId: orgMain?.id ?? "",
          role: "owner",
        },
        {
          userId: managerUser.user.id,
          organizationId: orgMain?.id ?? "",
          role: "admin",
        },
        {
          userId: memberUser.user.id,
          organizationId: orgMain?.id ?? "",
          role: "member",
        },
        {
          userId: adminUser.user.id,
          organizationId: orgSecondary?.id ?? "",
          role: "admin",
        },
      ],
    }),
  ]);

  // ============================================
  // 4. SET AUTH CONTEXT
  // ============================================
  console.log("🌱 Setting auth context...");

  const userDb = authDb.$setAuth({
    userId: adminUser.user.id,
    organizationId: orgMain?.id ?? "",
    organizationRole: "owner",
    role: "admin",
  } as any);

  // ============================================
  // 5. CREATE BUSINESS MODELS
  // ============================================
  console.log("🌱 Creating business models...");

  // Todos
  const [todo1, todo2, todo3] = await Promise.all([
    userDb.todo.create({
      data: {
        title: "Review Q4 Reports",
        description: "Analyze and review the quarterly reports for Q4",
        priority: "high",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
    userDb.todo.create({
      data: {
        title: "Team Meeting Preparation",
        description: "Prepare agenda for weekly team meeting",
        priority: "medium",
        completed: true,
      },
    }),
    userDb.todo.create({
      data: {
        title: "Update Documentation",
        description: "Update API documentation with new endpoints",
        priority: "low",
      },
    }),
  ]);

  // Tests
  await Promise.all([
    userDb.test.create({ data: { name: "Integration Test Suite" } }),
    userDb.test.create({ data: { name: "Unit Test Suite" } }),
  ]);

  // Products
  const [product1, product2, product3] = await Promise.all([
    userDb.product.create({
      data: {
        code: "PROD001",
        name: "Premium Widget",
        category: "Electronics",
        unit: "un",
        costPrice: 50.0,
        salePrice: 99.99,
        minimumStock: 10,
        storageLocation: "Shelf A-1",
        active: true,
      },
    }),
    userDb.product.create({
      data: {
        code: "PROD002",
        name: "Standard Widget",
        category: "Electronics",
        unit: "un",
        costPrice: 25.0,
        salePrice: 49.99,
        minimumStock: 20,
        storageLocation: "Shelf A-2",
        active: true,
      },
    }),
    userDb.product.create({
      data: {
        code: "PROD003",
        name: "Budget Widget",
        category: "Electronics",
        unit: "un",
        costPrice: 10.0,
        salePrice: 24.99,
        minimumStock: 50,
        storageLocation: "Shelf B-1",
        active: true,
      },
    }),
  ]);

  // Clients
  await Promise.all([
    userDb.client.create({
      data: {
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "(11) 3333-3333",
        status: "active",
      },
    }),
    userDb.client.create({
      data: {
        name: "Tech Solutions Ltd",
        email: "info@techsolutions.com",
        phone: "(11) 4444-4444",
        status: "active",
      },
    }),
  ]);

  // ============================================
  // 6. ONBOARDING MODELS
  // ============================================
  console.log("🌱 Creating onboarding models...");

  // Onboarding Processes
  await Promise.all([
    userDb.onboardingProcess.create({
      data: {
        employeeType: "vendedor",
        title: "Welcome to Sales Team",
        content:
          "Welcome to our sales team! This guide will help you get started with our sales processes and tools.",
        orderIndex: 1,
      },
    }),
    userDb.onboardingProcess.create({
      data: {
        employeeType: "vendedor",
        title: "Product Training",
        content:
          "Learn about our products, pricing, and how to effectively present them to customers.",
        orderIndex: 2,
      },
    }),
    userDb.onboardingProcess.create({
      data: {
        employeeType: "gerente_estoque",
        title: "Inventory Management Basics",
        content:
          "Learn the fundamentals of inventory management and our warehouse systems.",
        orderIndex: 1,
      },
    }),
  ]);

  // Onboarding Documents
  await Promise.all([
    userDb.onboardingDocument.create({
      data: {
        employeeType: "vendedor",
        title: "Sales Handbook",
        fileUrl: "https://example.com/docs/sales-handbook.pdf",
        fileName: "sales-handbook.pdf",
        fileSize: 2_048_000,
      },
    }),
    userDb.onboardingDocument.create({
      data: {
        employeeType: "gerente_estoque",
        title: "Warehouse Operations Manual",
        fileUrl: "https://example.com/docs/warehouse-manual.pdf",
        fileName: "warehouse-manual.pdf",
        fileSize: 3_072_000,
      },
    }),
  ]);

  // ============================================
  // 7. CHAT MODELS
  // ============================================
  console.log("🌱 Creating chat models...");

  // Onboarding Chats
  await Promise.all([
    userDb.onboardingChat.create({
      data: {
        userId: adminUser.user.id,
        employeeType: "vendedor",
        role: "user",
        content: "How do I access the CRM system?",
      },
    }),
    userDb.onboardingChat.create({
      data: {
        userId: adminUser.user.id,
        employeeType: "vendedor",
        role: "assistant",
        content:
          "You can access the CRM system by logging into the company portal and clicking on the CRM link in the sidebar.",
      },
    }),
  ]);

  // Knowledge Chats
  await Promise.all([
    userDb.knowledgeChat.create({
      data: {
        userId: adminUser.user.id,
        role: "user",
        content: "What are our company policies on remote work?",
      },
    }),
    userDb.knowledgeChat.create({
      data: {
        userId: adminUser.user.id,
        role: "assistant",
        content:
          "Our remote work policy allows employees to work from home up to 3 days per week, subject to manager approval.",
      },
    }),
  ]);

  // Group Chat Messages
  const parentMessage = await userDb.groupChatMessage.create({
    data: {
      userId: adminUser.user.id,
      userName: "Admin User",
      message: "Good morning team! Any updates on the Q4 project?",
      messageType: "user",
    },
  });

  await userDb.groupChatMessage.create({
    data: {
      userId: managerUser.user.id,
      userName: "Manager User",
      message: "We are on track! Will share the report by EOD.",
      messageType: "user",
      parentMessageId: parentMessage.id,
    },
  });

  // ============================================
  // 8. CHECKLIST MODELS
  // ============================================
  console.log("🌱 Creating checklist models...");

  const [checklistStep1, checklistStep2, checklistStep3] = await Promise.all([
    userDb.onboardingChecklistStep.create({
      data: {
        employeeType: "vendedor",
        title: "Complete HR paperwork",
        description: "Fill out all required HR forms and submit them",
        orderIndex: 1,
      },
    }),
    userDb.onboardingChecklistStep.create({
      data: {
        employeeType: "vendedor",
        title: "Set up workstation",
        description: "Configure your computer and install required software",
        orderIndex: 2,
      },
    }),
    userDb.onboardingChecklistStep.create({
      data: {
        employeeType: "vendedor",
        title: "Complete product training",
        description: "Watch all product training videos and pass the quiz",
        orderIndex: 3,
      },
    }),
  ]);

  // Checklist Progress
  await Promise.all([
    userDb.onboardingChecklistProgress.create({
      data: {
        userId: memberUser.user.id,
        stepId: checklistStep1.id,
        completed: true,
        completedAt: new Date(),
      },
    }),
    userDb.onboardingChecklistProgress.create({
      data: {
        userId: memberUser.user.id,
        stepId: checklistStep2.id,
        completed: true,
        completedAt: new Date(),
      },
    }),
    userDb.onboardingChecklistProgress.create({
      data: {
        userId: memberUser.user.id,
        stepId: checklistStep3.id,
        completed: false,
      },
    }),
  ]);

  // ============================================
  // 9. KANBAN MODELS
  // ============================================
  console.log("🌱 Creating kanban models...");

  const kanbanBoard = await userDb.kanbanBoard.create({
    data: {
      userId: adminUser.user.id,
      title: "Project Tasks",
      description: "Main project task board",
    },
  });

  const [colTodo, colInProgress, colDone] = await Promise.all([
    userDb.kanbanColumn.create({
      data: {
        boardId: kanbanBoard.id,
        title: "To Do",
        position: 0,
      },
    }),
    userDb.kanbanColumn.create({
      data: {
        boardId: kanbanBoard.id,
        title: "In Progress",
        position: 1,
      },
    }),
    userDb.kanbanColumn.create({
      data: {
        boardId: kanbanBoard.id,
        title: "Done",
        position: 2,
      },
    }),
  ]);

  await Promise.all([
    userDb.kanbanCard.create({
      data: {
        columnId: colTodo.id,
        title: "Design new landing page",
        description: "Create mockups for the new marketing landing page",
        position: 0,
        color: "#ef4444",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    userDb.kanbanCard.create({
      data: {
        columnId: colTodo.id,
        title: "Write API documentation",
        description: "Document all REST endpoints",
        position: 1,
        color: "#f59e0b",
      },
    }),
    userDb.kanbanCard.create({
      data: {
        columnId: colInProgress.id,
        title: "Implement authentication",
        description: "Add OAuth2 support",
        position: 0,
        color: "#3b82f6",
      },
    }),
    userDb.kanbanCard.create({
      data: {
        columnId: colDone.id,
        title: "Database schema design",
        description: "Design and implement the initial database schema",
        position: 0,
        color: "#22c55e",
      },
    }),
  ]);

  // ============================================
  // 10. SALES MODELS
  // ============================================
  console.log("🌱 Creating sales models...");

  const salesOrder1 = await userDb.salesOrder.create({
    data: {
      userId: adminUser.user.id,
      orderNumber: "ORD-2024-001",
      customerName: "John Smith",
      customerPhone: "(11) 99999-1234",
      customerAddress: "789 Customer St",
      customerNeighborhood: "Downtown",
      customerCity: "Sao Paulo",
      customerState: "SP",
      customerZipcode: "01234-567",
      customerTaxId: "123.456.789-00",
      paymentTerm: "30 days",
      downPayment: 500.0,
      totalAmount: 2499.97,
      status: "completed",
    },
  });

  const salesOrder2 = await userDb.salesOrder.create({
    data: {
      userId: adminUser.user.id,
      orderNumber: "ORD-2024-002",
      customerName: "Maria Santos",
      customerPhone: "(11) 88888-5678",
      customerAddress: "456 Client Ave",
      customerCity: "Sao Paulo",
      customerState: "SP",
      paymentTerm: "15 days",
      totalAmount: 149.97,
      status: "pending",
    },
  });

  // Order Items
  await Promise.all([
    userDb.orderItem.create({
      data: {
        orderId: salesOrder1.id,
        productId: product1.id,
        productName: product1.name,
        quantity: 10,
        unitPrice: product1.salePrice ?? 0,
        totalPrice: (product1.salePrice ?? 0) * 10,
        position: 0,
      },
    }),
    userDb.orderItem.create({
      data: {
        orderId: salesOrder1.id,
        productId: product2.id,
        productName: product2.name,
        quantity: 20,
        unitPrice: product2.salePrice ?? 0,
        totalPrice: (product2.salePrice ?? 0) * 20,
        position: 1,
      },
    }),
    userDb.orderItem.create({
      data: {
        orderId: salesOrder1.id,
        productId: product3.id,
        productName: product3.name,
        quantity: 20,
        unitPrice: product3.salePrice ?? 0,
        totalPrice: (product3.salePrice ?? 0) * 20,
        position: 2,
      },
    }),
    userDb.orderItem.create({
      data: {
        orderId: salesOrder2.id,
        productId: product2.id,
        productName: product2.name,
        quantity: 3,
        unitPrice: product2.salePrice ?? 0,
        totalPrice: (product2.salePrice ?? 0) * 3,
        position: 0,
      },
    }),
  ]);

  // ============================================
  // 11. GAMIFICATION MODELS
  // ============================================
  console.log("🌱 Creating gamification models...");

  // Achievements
  const [achievement1, achievement2, achievement3, achievement4] =
    await Promise.all([
      userDb.achievement.create({
        data: {
          name: "First Sale",
          description: "Complete your first sale",
          points: 100,
          milestoneType: "sales",
          milestoneCount: 1,
          icon: "trophy",
        },
      }),
      userDb.achievement.create({
        data: {
          name: "Sales Champion",
          description: "Complete 50 sales",
          points: 500,
          milestoneType: "sales",
          milestoneCount: 50,
          icon: "star",
        },
      }),
      userDb.achievement.create({
        data: {
          name: "Event Master",
          description: "Attend 10 events",
          points: 200,
          milestoneType: "events",
          milestoneCount: 10,
          icon: "calendar",
        },
      }),
      userDb.achievement.create({
        data: {
          name: "Task Warrior",
          description: "Complete 100 kanban tasks",
          points: 300,
          milestoneType: "kanban_tasks",
          milestoneCount: 100,
          icon: "check-square",
        },
      }),
    ]);

  // User Scores
  await Promise.all([
    userDb.userScore.create({
      data: {
        userId: adminUser.user.id,
        totalPoints: 1500,
      },
    }),
    userDb.userScore.create({
      data: {
        userId: managerUser.user.id,
        totalPoints: 800,
      },
    }),
    userDb.userScore.create({
      data: {
        userId: memberUser.user.id,
        totalPoints: 350,
      },
    }),
  ]);

  // User Achievements
  await Promise.all([
    userDb.userAchievement.create({
      data: {
        userId: adminUser.user.id,
        achievementId: achievement1.id,
      },
    }),
    userDb.userAchievement.create({
      data: {
        userId: adminUser.user.id,
        achievementId: achievement2.id,
      },
    }),
    userDb.userAchievement.create({
      data: {
        userId: managerUser.user.id,
        achievementId: achievement1.id,
      },
    }),
  ]);

  // User Action Counts
  await Promise.all([
    userDb.userActionCount.create({
      data: {
        userId: adminUser.user.id,
        actionType: "sales",
        count: 75,
      },
    }),
    userDb.userActionCount.create({
      data: {
        userId: adminUser.user.id,
        actionType: "kanban_tasks",
        count: 150,
      },
    }),
    userDb.userActionCount.create({
      data: {
        userId: managerUser.user.id,
        actionType: "sales",
        count: 30,
      },
    }),
  ]);

  // ============================================
  // 12. TUTORIAL MODELS
  // ============================================
  console.log("🌱 Creating tutorial models...");

  const tutorialSector = await userDb.tutorialSector.create({
    data: {
      name: "Sales Training",
      description: "Complete sales training program",
      icon: "briefcase",
      orderIndex: 1,
      active: true,
    },
  });

  const tutorialSection = await userDb.tutorialSection.create({
    data: {
      sectorId: tutorialSector.id,
      name: "Getting Started",
      description: "Introduction to sales basics",
      orderIndex: 1,
      active: true,
    },
  });

  const [tutorialStep1, tutorialStep2] = await Promise.all([
    userDb.tutorialStep.create({
      data: {
        sectionId: tutorialSection.id,
        title: "Introduction to Sales",
        description: "Learn the fundamentals of sales",
        youtubeVideoUrl: "https://www.youtube.com/watch?v=example1",
        durationMinutes: 15,
        orderIndex: 1,
        active: true,
      },
    }),
    userDb.tutorialStep.create({
      data: {
        sectionId: tutorialSection.id,
        title: "Understanding Customer Needs",
        description: "How to identify and address customer needs",
        youtubeVideoUrl: "https://www.youtube.com/watch?v=example2",
        durationMinutes: 20,
        orderIndex: 2,
        active: true,
      },
    }),
  ]);

  // Tutorial Progress
  await Promise.all([
    userDb.tutorialStepProgress.create({
      data: {
        userId: memberUser.user.id,
        stepId: tutorialStep1.id,
        completed: true,
        completedAt: new Date(),
      },
    }),
    userDb.tutorialStepProgress.create({
      data: {
        userId: memberUser.user.id,
        stepId: tutorialStep2.id,
        completed: false,
      },
    }),
  ]);

  // ============================================
  // 13. MEETING MODELS
  // ============================================
  console.log("🌱 Creating meeting models...");

  const [meeting1, meeting2] = await Promise.all([
    userDb.meeting.create({
      data: {
        userId: adminUser.user.id,
        title: "Weekly Team Sync",
        description: "Weekly synchronization meeting with the team",
        meetingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        location: "Conference Room A",
        participants: [
          adminUser.user.email,
          managerUser.user.email,
          memberUser.user.email,
        ],
        notes: "Discuss Q4 goals and progress",
        status: "scheduled",
        rrule: "FREQ=WEEKLY;BYDAY=MO",
      },
    }),
    userDb.meeting.create({
      data: {
        userId: adminUser.user.id,
        title: "Client Presentation",
        description: "Present new product features to client",
        meetingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        durationMinutes: 90,
        location: "Virtual - Zoom",
        participants: [adminUser.user.email, "client@acme.com"],
        status: "scheduled",
      },
    }),
  ]);

  // ============================================
  // 14. CALENDAR MODELS
  // ============================================
  console.log("🌱 Creating calendar models...");

  await Promise.all([
    userDb.calendarEvent.create({
      data: {
        userId: adminUser.user.id,
        title: "Weekly Team Sync",
        description: "Weekly synchronization meeting with the team",
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        color: "#3b82f6",
        eventType: "MEETING",
        meetingId: meeting1.id,
        rrule: "FREQ=WEEKLY;BYDAY=MO",
      },
    }),
    userDb.calendarEvent.create({
      data: {
        userId: adminUser.user.id,
        title: "Client Presentation",
        description: "Present new product features to client",
        start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        color: "#ef4444",
        eventType: "MEETING",
        meetingId: meeting2.id,
      },
    }),
    userDb.calendarEvent.create({
      data: {
        userId: adminUser.user.id,
        title: "Company Holiday",
        description: "Office closed",
        start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        allDay: true,
        color: "#22c55e",
        eventType: "OTHER",
      },
    }),
  ]);

  // ============================================
  // 15. MINDMAP MODELS
  // ============================================
  console.log("🌱 Creating mindmap models...");

  await userDb.mindmap.create({
    data: {
      userId: adminUser.user.id,
      title: "Project Architecture",
      description: "System architecture overview",
      nodes: JSON.stringify([
        {
          id: "1",
          type: "default",
          position: { x: 0, y: 0 },
          data: { label: "Main System" },
        },
        {
          id: "2",
          type: "default",
          position: { x: -200, y: 100 },
          data: { label: "Frontend" },
        },
        {
          id: "3",
          type: "default",
          position: { x: 200, y: 100 },
          data: { label: "Backend" },
        },
        {
          id: "4",
          type: "default",
          position: { x: 200, y: 200 },
          data: { label: "Database" },
        },
      ]),
      edges: JSON.stringify([
        { id: "e1-2", source: "1", target: "2" },
        { id: "e1-3", source: "1", target: "3" },
        { id: "e3-4", source: "3", target: "4" },
      ]),
      viewport: JSON.stringify({ x: 0, y: 0, zoom: 1 }),
    },
  });

  // ============================================
  // 16. OFFBOARDING MODELS
  // ============================================
  console.log("🌱 Creating offboarding models...");

  // Offboarding Checklist Steps
  const [offStep1, offStep2, offStep3, offStep4] = await Promise.all([
    userDb.offboardingChecklistStep.create({
      data: {
        title: "Return company equipment",
        description: "Return laptop, phone, and access cards",
        category: "equipment",
        orderIndex: 1,
        requiresAdminApproval: true,
      },
    }),
    userDb.offboardingChecklistStep.create({
      data: {
        title: "Complete knowledge transfer",
        description: "Document all ongoing projects and share with team",
        category: "handover",
        orderIndex: 2,
        requiresAdminApproval: false,
      },
    }),
    userDb.offboardingChecklistStep.create({
      data: {
        title: "Revoke system access",
        description: "Remove access to all company systems and accounts",
        category: "access",
        orderIndex: 3,
        requiresAdminApproval: true,
      },
    }),
    userDb.offboardingChecklistStep.create({
      data: {
        title: "Exit interview",
        description: "Schedule and complete exit interview with HR",
        category: "administrative",
        orderIndex: 4,
        requiresAdminApproval: false,
      },
    }),
  ]);

  // Offboarding Process
  const offboardingProcess = await userDb.offboardingProcess.create({
    data: {
      userId: memberUser.user.id,
      initiatedById: adminUser.user.id,
      employeeName: "Member User",
      employeeEmail: memberUser.user.email,
      department: "Sales",
      lastWorkingDay: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reason: "resignation",
      status: "in_progress",
      notes: "Employee resignation - moving to another opportunity",
    },
  });

  // Offboarding Progress
  await Promise.all([
    userDb.offboardingProgress.create({
      data: {
        processId: offboardingProcess.id,
        stepId: offStep1.id,
        completed: false,
      },
    }),
    userDb.offboardingProgress.create({
      data: {
        processId: offboardingProcess.id,
        stepId: offStep2.id,
        completed: true,
        completedAt: new Date(),
        completedById: memberUser.user.id,
      },
    }),
    userDb.offboardingProgress.create({
      data: {
        processId: offboardingProcess.id,
        stepId: offStep3.id,
        completed: false,
      },
    }),
    userDb.offboardingProgress.create({
      data: {
        processId: offboardingProcess.id,
        stepId: offStep4.id,
        completed: false,
      },
    }),
  ]);

  // Offboarding Handover Tasks
  await Promise.all([
    userDb.offboardingHandoverTask.create({
      data: {
        processId: offboardingProcess.id,
        taskTitle: "Transfer client relationships",
        taskDescription:
          "Introduce replacement to key clients and transfer account ownership",
        assignedToId: managerUser.user.id,
        assignedToName: "Manager User",
        status: "in_progress",
        priority: "high",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    userDb.offboardingHandoverTask.create({
      data: {
        processId: offboardingProcess.id,
        taskTitle: "Document ongoing projects",
        taskDescription:
          "Create documentation for all active projects and their status",
        assignedToId: memberUser.user.id,
        assignedToName: "Member User",
        status: "completed",
        priority: "critical",
        completedAt: new Date(),
      },
    }),
  ]);

  // ============================================
  // 17. PREBOARDING MODELS
  // ============================================
  console.log("🌱 Creating preboarding models...");

  // Preboarding Stages
  const [stageApplied, stageScreening, stageInterview, stageOffer] =
    await Promise.all([
      userDb.preboardingStage.create({
        data: {
          name: "Applied",
          description: "Initial application received",
          color: "#6366f1",
          orderIndex: 1,
        },
      }),
      userDb.preboardingStage.create({
        data: {
          name: "Screening",
          description: "Resume screening and initial assessment",
          color: "#f59e0b",
          orderIndex: 2,
        },
      }),
      userDb.preboardingStage.create({
        data: {
          name: "Interview",
          description: "Interview process",
          color: "#3b82f6",
          orderIndex: 3,
        },
      }),
      userDb.preboardingStage.create({
        data: {
          name: "Offer",
          description: "Job offer extended",
          color: "#22c55e",
          orderIndex: 4,
        },
      }),
    ]);

  // Preboarding Job Positions
  const [jobPosition1, jobPosition2] = await Promise.all([
    userDb.preboardingJobPosition.create({
      data: {
        title: "Senior Software Engineer",
        department: "Engineering",
        description:
          "We are looking for an experienced software engineer to join our team.",
        requirements:
          "5+ years of experience with TypeScript, React, and Node.js",
        responsibilities:
          "Design and implement new features, mentor junior developers, code reviews",
        location: "Sao Paulo",
        workModel: "hibrido",
        employmentType: "clt",
        salaryMin: 15_000,
        salaryMax: 25_000,
        vacancies: 2,
        filledVacancies: 0,
        priority: "alta",
        status: "aberta",
        hiringManager: "Admin User",
        hiringManagerEmail: adminUser.user.email,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingJobPosition.create({
      data: {
        title: "Sales Representative",
        department: "Sales",
        description:
          "Join our growing sales team and help us expand our market.",
        requirements: "2+ years of B2B sales experience",
        responsibilities:
          "Prospect new clients, manage client relationships, achieve sales targets",
        location: "Sao Paulo",
        workModel: "presencial",
        employmentType: "clt",
        salaryMin: 5000,
        salaryMax: 8000,
        vacancies: 3,
        filledVacancies: 1,
        priority: "normal",
        status: "aberta",
        createdById: adminUser.user.id,
      },
    }),
  ]);

  // Preboarding Candidates
  const [candidate1, candidate2, candidate3] = await Promise.all([
    userDb.preboardingCandidate.create({
      data: {
        name: "Ana Silva",
        email: "ana.silva@email.com",
        phone: "(11) 97777-7777",
        position: "Senior Software Engineer",
        department: "Engineering",
        stageId: stageInterview.id,
        jobPositionId: jobPosition1.id,
        source: "LinkedIn",
        expectedSalary: 20_000,
        expectedStartDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        notes: "Strong technical background, passed initial screening",
        rating: 4,
        status: "active",
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingCandidate.create({
      data: {
        name: "Carlos Oliveira",
        email: "carlos.oliveira@email.com",
        phone: "(11) 96666-6666",
        position: "Senior Software Engineer",
        department: "Engineering",
        stageId: stageScreening.id,
        jobPositionId: jobPosition1.id,
        source: "Referral",
        expectedSalary: 18_000,
        notes: "Referred by current employee",
        rating: 3,
        status: "active",
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingCandidate.create({
      data: {
        name: "Julia Costa",
        email: "julia.costa@email.com",
        phone: "(11) 95555-5555",
        position: "Sales Representative",
        department: "Sales",
        stageId: stageOffer.id,
        jobPositionId: jobPosition2.id,
        source: "Job Board",
        expectedSalary: 7000,
        expectedStartDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        notes: "Excellent communication skills, offer extended",
        rating: 5,
        status: "active",
        createdById: adminUser.user.id,
      },
    }),
  ]);

  // Preboarding Activities
  await Promise.all([
    userDb.preboardingActivity.create({
      data: {
        candidateId: candidate1.id,
        activityType: "note",
        title: "Initial assessment",
        description: "Candidate shows strong potential for the role",
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingActivity.create({
      data: {
        candidateId: candidate1.id,
        activityType: "stage_change",
        title: "Moved to Interview stage",
        description: "Candidate passed screening and moved to interview stage",
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingActivity.create({
      data: {
        candidateId: candidate3.id,
        activityType: "stage_change",
        title: "Moved to Offer stage",
        description: "Candidate passed all interviews, preparing offer",
        createdById: adminUser.user.id,
      },
    }),
  ]);

  // Preboarding Interviews
  await Promise.all([
    userDb.preboardingInterview.create({
      data: {
        candidateId: candidate1.id,
        interviewerName: "Admin User",
        interviewerEmail: adminUser.user.email,
        interviewType: "technical",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        location: "Virtual",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        status: "scheduled",
      },
    }),
    userDb.preboardingInterview.create({
      data: {
        candidateId: candidate1.id,
        interviewerName: "Manager User",
        interviewerEmail: managerUser.user.email,
        interviewType: "behavioral",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        durationMinutes: 45,
        location: "Virtual",
        meetingLink: "https://meet.google.com/xyz-uvwx-yz",
        status: "scheduled",
      },
    }),
    userDb.preboardingInterview.create({
      data: {
        candidateId: candidate3.id,
        interviewerName: "Admin User",
        interviewerEmail: adminUser.user.email,
        interviewType: "in_person",
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        durationMinutes: 60,
        location: "Office - Conference Room B",
        feedback: "Excellent candidate, strong communication and sales skills",
        rating: 5,
        status: "completed",
      },
    }),
  ]);

  // Preboarding Candidate Questions
  await Promise.all([
    userDb.preboardingCandidateQuestion.create({
      data: {
        candidateId: candidate1.id,
        questionType: "hard_skills",
        question:
          "Describe your experience with TypeScript and when you would choose it over JavaScript.",
        expectedAnswer:
          "Should demonstrate understanding of type safety benefits, experience with complex TypeScript features",
        orderIndex: 1,
        isAiGenerated: true,
      },
    }),
    userDb.preboardingCandidateQuestion.create({
      data: {
        candidateId: candidate1.id,
        questionType: "hard_skills",
        question:
          "How would you design a scalable API for a high-traffic application?",
        expectedAnswer:
          "Should cover caching, load balancing, database optimization, and horizontal scaling",
        orderIndex: 2,
        isAiGenerated: true,
      },
    }),
    userDb.preboardingCandidateQuestion.create({
      data: {
        candidateId: candidate1.id,
        questionType: "soft_skills",
        question:
          "Tell me about a time you had to mentor a junior developer. What was your approach?",
        expectedAnswer:
          "Should demonstrate patience, communication skills, and structured mentoring approach",
        orderIndex: 3,
        isAiGenerated: true,
      },
    }),
  ]);

  // Preboarding Candidate Documents
  await Promise.all([
    userDb.preboardingCandidateDocument.create({
      data: {
        candidateId: candidate1.id,
        documentType: "resume",
        title: "Resume - Ana Silva",
        fileName: "ana_silva_resume.pdf",
        fileUrl: "https://example.com/docs/ana_silva_resume.pdf",
        fileSize: 512_000,
        mimeType: "application/pdf",
        aiAnalysis:
          "Strong technical background with 6 years of experience. Expertise in TypeScript, React, and Node.js. Previous experience at tech startups.",
        adherenceScore: 85.5,
        analyzedAt: new Date(),
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingCandidateDocument.create({
      data: {
        candidateId: candidate2.id,
        documentType: "resume",
        title: "Resume - Carlos Oliveira",
        fileName: "carlos_oliveira_resume.pdf",
        fileUrl: "https://example.com/docs/carlos_oliveira_resume.pdf",
        fileSize: 480_000,
        mimeType: "application/pdf",
        createdById: adminUser.user.id,
      },
    }),
    userDb.preboardingCandidateDocument.create({
      data: {
        candidateId: candidate3.id,
        documentType: "resume",
        title: "Resume - Julia Costa",
        fileName: "julia_costa_resume.pdf",
        fileUrl: "https://example.com/docs/julia_costa_resume.pdf",
        fileSize: 450_000,
        mimeType: "application/pdf",
        aiAnalysis:
          "3 years of B2B sales experience. Strong track record of exceeding targets. Excellent references.",
        adherenceScore: 92.0,
        analyzedAt: new Date(),
        createdById: adminUser.user.id,
      },
    }),
  ]);

  // ============================================
  // 18. INVITATIONS
  // ============================================
  console.log("🌱 Creating invitations...");

  await db.invitation.create({
    data: {
      organizationId: orgMain?.id ?? "",
      email: "newuser@example.com",
      role: "member",
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      inviterId: adminUser.user.id,
    },
  });

  console.log("🌱 Database seeded successfully!");
  console.log("\n📋 Summary:");
  console.log("  - 3 Users (admin, manager, member)");
  console.log("  - 2 Organizations");
  console.log("  - 4 Members");
  console.log("  - 3 Todos");
  console.log("  - 2 Tests");
  console.log("  - 3 Products");
  console.log("  - 2 Clients");
  console.log("  - 3 Onboarding Processes");
  console.log("  - 2 Onboarding Documents");
  console.log("  - 4 Chat Messages (Onboarding + Knowledge)");
  console.log("  - 2 Group Chat Messages");
  console.log("  - 3 Onboarding Checklist Steps + Progress");
  console.log("  - 1 Kanban Board with 3 Columns and 4 Cards");
  console.log("  - 2 Sales Orders with 4 Order Items");
  console.log("  - 4 Achievements");
  console.log("  - 3 User Scores");
  console.log("  - 3 User Achievements");
  console.log("  - 3 User Action Counts");
  console.log("  - 1 Tutorial Sector, 1 Section, 2 Steps");
  console.log("  - 2 Meetings");
  console.log("  - 3 Calendar Events");
  console.log("  - 1 Mindmap");
  console.log("  - 4 Offboarding Checklist Steps");
  console.log("  - 1 Offboarding Process with Progress and Handover Tasks");
  console.log("  - 4 Preboarding Stages");
  console.log("  - 2 Job Positions");
  console.log("  - 3 Candidates");
  console.log("  - 3 Activities");
  console.log("  - 3 Interviews");
  console.log("  - 3 Candidate Questions");
  console.log("  - 3 Candidate Documents");
  console.log("  - 1 Invitation");
}

main();
