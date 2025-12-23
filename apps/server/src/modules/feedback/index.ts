import { authDb, db } from "@acme/zen-v3";
import { Elysia, t } from "elysia";
import { sql } from "kysely";

import { betterAuth } from "../../plugins/better-auth";
import { getSessionUser } from "../zenstack";

// Helper to generate reference numbers
async function generateReferenceNumber(
  organizationId: string
): Promise<string> {
  const result = await db.$qb
    .selectFrom("CitizenFeedback")
    .select((eb) => eb.fn.count<number>("id").as("count"))
    .where("organizationId", "=", organizationId)
    .executeTakeFirst();

  const count = (result?.count ?? 0) + 1;
  const paddedNumber = count.toString().padStart(8, "0");
  return `FB-${paddedNumber}`;
}

export const feedbackController = new Elysia({ prefix: "/feedback" })
  .use(betterAuth)

  // Dashboard statistics endpoint
  .get(
    "/stats",
    async ({ request }) => {
      const user = await getSessionUser({ request });
      if (!user?.organizationId) {
        return {
          total: 0,
          open: 0,
          inProgress: 0,
          underReview: 0,
          resolved: 0,
          closed: 0,
          rejected: 0,
          slaBreached: 0,
          avgResolutionTime: null,
          byCategory: [],
          byDepartment: [],
          byPriority: [],
          recentActivity: [],
        };
      }

      const organizationId = user.organizationId;

      // Get counts by status
      const statusCounts = await db.$qb
        .selectFrom("CitizenFeedback")
        .select((eb) => [
          eb.fn.count<number>("id").as("total"),
          sql<number>`COUNT(*) FILTER (WHERE status = 'open')`.as("open"),
          sql<number>`COUNT(*) FILTER (WHERE status = 'in_progress')`.as(
            "inProgress"
          ),
          sql<number>`COUNT(*) FILTER (WHERE status = 'under_review')`.as(
            "underReview"
          ),
          sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')`.as(
            "resolved"
          ),
          sql<number>`COUNT(*) FILTER (WHERE status = 'closed')`.as("closed"),
          sql<number>`COUNT(*) FILTER (WHERE status = 'rejected')`.as(
            "rejected"
          ),
          sql<number>`COUNT(*) FILTER (WHERE "slaBreached" = true)`.as(
            "slaBreached"
          ),
        ])
        .where("organizationId", "=", organizationId)
        .executeTakeFirst();

      // Get average resolution time (in hours) for resolved/closed feedbacks
      const avgResolution = await db.$qb
        .selectFrom("CitizenFeedback")
        .select((eb) => [
          sql<number>`AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600)`.as(
            "avgHours"
          ),
        ])
        .where("organizationId", "=", organizationId)
        .where("resolvedAt", "is not", null)
        .executeTakeFirst();

      // Get counts by category
      const byCategory = await db.$qb
        .selectFrom("CitizenFeedback")
        .innerJoin(
          "FeedbackCategory",
          "FeedbackCategory.id",
          "CitizenFeedback.categoryId"
        )
        .select((eb) => [
          "FeedbackCategory.name as categoryName",
          "FeedbackCategory.color as categoryColor",
          eb.fn.count<number>("CitizenFeedback.id").as("count"),
        ])
        .where("CitizenFeedback.organizationId", "=", organizationId)
        .groupBy(["FeedbackCategory.name", "FeedbackCategory.color"])
        .execute();

      // Get counts by department
      const byDepartment = await db.$qb
        .selectFrom("CitizenFeedback")
        .innerJoin(
          "FeedbackDepartment",
          "FeedbackDepartment.id",
          "CitizenFeedback.departmentId"
        )
        .select((eb) => [
          "FeedbackDepartment.name as departmentName",
          "FeedbackDepartment.color as departmentColor",
          eb.fn.count<number>("CitizenFeedback.id").as("count"),
        ])
        .where("CitizenFeedback.organizationId", "=", organizationId)
        .groupBy(["FeedbackDepartment.name", "FeedbackDepartment.color"])
        .execute();

      // Get counts by priority
      const byPriority = await db.$qb
        .selectFrom("CitizenFeedback")
        .select((eb) => ["priority", eb.fn.count<number>("id").as("count")])
        .where("organizationId", "=", organizationId)
        .groupBy("priority")
        .execute();

      // Get recent activity (last 10 status changes)
      const recentActivity = await db.$qb
        .selectFrom("FeedbackStatusHistory")
        .innerJoin(
          "CitizenFeedback",
          "CitizenFeedback.id",
          "FeedbackStatusHistory.feedbackId"
        )
        .leftJoin("User", "User.id", "FeedbackStatusHistory.createdById")
        .select([
          "FeedbackStatusHistory.id",
          "FeedbackStatusHistory.fromStatus",
          "FeedbackStatusHistory.toStatus",
          "FeedbackStatusHistory.notes",
          "FeedbackStatusHistory.createdAt",
          "CitizenFeedback.title as feedbackTitle",
          "CitizenFeedback.referenceNumber",
          "User.name as userName",
        ])
        .where("FeedbackStatusHistory.organizationId", "=", organizationId)
        .orderBy("FeedbackStatusHistory.createdAt", "desc")
        .limit(10)
        .execute();

      return {
        total: statusCounts?.total ?? 0,
        open: statusCounts?.open ?? 0,
        inProgress: statusCounts?.inProgress ?? 0,
        underReview: statusCounts?.underReview ?? 0,
        resolved: statusCounts?.resolved ?? 0,
        closed: statusCounts?.closed ?? 0,
        rejected: statusCounts?.rejected ?? 0,
        slaBreached: statusCounts?.slaBreached ?? 0,
        avgResolutionTime: avgResolution?.avgHours ?? null,
        byCategory,
        byDepartment,
        byPriority,
        recentActivity,
      };
    },
    {
      auth: true,
    }
  )

  // Update feedback status with history tracking
  .post(
    "/:id/status",
    async ({ params, body, request }) => {
      const user = await getSessionUser({ request });
      if (!user?.organizationId) {
        throw new Error("Unauthorized");
      }

      const client = authDb.$setAuth(user as any);
      const { id } = params;
      const { status, notes } = body;

      // Get current feedback
      const feedback = await client.citizenFeedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        throw new Error("Feedback not found");
      }

      const fromStatus = feedback.status;

      // Update feedback status
      const updateData: Record<string, unknown> = {
        status,
        updatedById: user.userId,
      };

      // Set timestamps based on status
      if (status === "resolved") {
        updateData.resolvedAt = new Date();
      } else if (status === "closed") {
        updateData.closedAt = new Date();
        updateData.closedById = user.userId;
      }

      const updatedFeedback = await client.citizenFeedback.update({
        where: { id },
        data: updateData,
      });

      // Create status history entry
      await client.feedbackStatusHistory.create({
        data: {
          feedbackId: id,
          fromStatus,
          toStatus: status,
          notes,
          organizationId: user.organizationId,
        },
      });

      return updatedFeedback;
    },
    {
      auth: true,
      body: t.Object({
        status: t.Union([
          t.Literal("open"),
          t.Literal("in_progress"),
          t.Literal("under_review"),
          t.Literal("resolved"),
          t.Literal("closed"),
          t.Literal("rejected"),
        ]),
        notes: t.Optional(t.String()),
      }),
    }
  )

  // Anonymous feedback submission endpoint (public)
  .post(
    "/submit",
    async ({ body, request }) => {
      // Try to get the session user (optional - for anonymous authenticated users)
      let userId: string | null = null;
      try {
        const user = await getSessionUser({ request });
        userId = user?.userId ?? null;
      } catch {
        // No session - that's fine for public submissions
      }

      // For anonymous submissions, we need an organizationId in the request
      const {
        organizationId,
        title,
        description,
        categoryId,
        subcategoryId,
        address,
        neighborhood,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        locationDescription,
        citizenName,
        citizenEmail,
        citizenPhone,
        isAnonymous,
        source,
      } = body;

      if (!organizationId) {
        throw new Error("Organization ID is required");
      }

      if (!title || !description) {
        throw new Error("Title and description are required");
      }

      // Generate reference number
      const referenceNumber = await generateReferenceNumber(organizationId);

      // Get department from category if set
      let departmentId: string | null = null;
      let slaHours: number | null = null;
      let priority = "medium";

      if (categoryId) {
        const category = await db.$qb
          .selectFrom("FeedbackCategory")
          .select(["departmentId"])
          .where("id", "=", categoryId)
          .executeTakeFirst();
        departmentId = category?.departmentId ?? null;
      }

      if (subcategoryId) {
        const subcategory = await db.$qb
          .selectFrom("FeedbackSubcategory")
          .select(["defaultPriority"])
          .where("id", "=", subcategoryId)
          .executeTakeFirst();
        priority = (subcategory?.defaultPriority as string) ?? "medium";
      }

      if (departmentId) {
        const department = await db.$qb
          .selectFrom("FeedbackDepartment")
          .select(["defaultSlaHours"])
          .where("id", "=", departmentId)
          .executeTakeFirst();
        slaHours = department?.defaultSlaHours ?? null;
      }

      // Calculate due date based on SLA
      let dueDate: Date | null = null;
      if (slaHours) {
        dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + slaHours);
      }

      // Create the feedback - use explicit null for optional fields
      const feedback = await db.$qb
        .insertInto("CitizenFeedback")
        .values({
          id: sql`uuidv7()`,
          referenceNumber,
          title,
          description,
          categoryId: categoryId || null,
          subcategoryId: subcategoryId || null,
          departmentId,
          status: "open",
          priority: priority as any,
          source: source ?? "web",
          address: address || null,
          neighborhood: neighborhood || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          locationDescription: locationDescription || null,
          citizenName: isAnonymous ? null : (citizenName || null),
          citizenEmail: isAnonymous ? null : (citizenEmail || null),
          citizenPhone: isAnonymous ? null : (citizenPhone || null),
          isAnonymous: isAnonymous ?? false,
          dueDate: dueDate ? sql`${dueDate.toISOString()}::timestamp` : null,
          slaHours,
          slaBreached: false,
          tags: sql`'{}'::text[]`,
          organizationId,
          createdById: userId,
          createdAt: sql`now()`,
          updatedAt: sql`now()`,
        } as any)
        .returning(["id", "referenceNumber", "status", "createdAt"])
        .executeTakeFirst();

      if (!feedback) {
        throw new Error("Failed to create feedback");
      }

      // Create initial status history
      await db.$qb
        .insertInto("FeedbackStatusHistory")
        .values({
          id: sql`uuidv7()`,
          feedbackId: feedback.id,
          fromStatus: null,
          toStatus: "open",
          notes: "Feedback submitted",
          organizationId,
          createdAt: sql`now()`,
        } as any)
        .execute();

      return {
        success: true,
        referenceNumber: feedback.referenceNumber,
        id: feedback.id,
        message:
          "Your feedback has been submitted successfully. Use the reference number to track its status.",
      };
    },
    {
      body: t.Object({
        organizationId: t.String(),
        title: t.String(),
        description: t.String(),
        categoryId: t.Optional(t.String()),
        subcategoryId: t.Optional(t.String()),
        address: t.Optional(t.String()),
        neighborhood: t.Optional(t.String()),
        city: t.Optional(t.String()),
        state: t.Optional(t.String()),
        zipCode: t.Optional(t.String()),
        latitude: t.Optional(t.Number()),
        longitude: t.Optional(t.Number()),
        locationDescription: t.Optional(t.String()),
        citizenName: t.Optional(t.String()),
        citizenEmail: t.Optional(t.String()),
        citizenPhone: t.Optional(t.String()),
        isAnonymous: t.Optional(t.Boolean()),
        source: t.Optional(
          t.Union([
            t.Literal("web"),
            t.Literal("mobile"),
            t.Literal("phone"),
            t.Literal("email"),
            t.Literal("in_person"),
            t.Literal("social_media"),
          ])
        ),
      }),
    }
  )

  // Track feedback by reference number (public)
  .get("/track/:referenceNumber", async ({ params }) => {
    const { referenceNumber } = params;

    const feedback = await db.$qb
      .selectFrom("CitizenFeedback")
      .leftJoin(
        "FeedbackCategory",
        "FeedbackCategory.id",
        "CitizenFeedback.categoryId"
      )
      .leftJoin(
        "FeedbackDepartment",
        "FeedbackDepartment.id",
        "CitizenFeedback.departmentId"
      )
      .select([
        "CitizenFeedback.id",
        "CitizenFeedback.referenceNumber",
        "CitizenFeedback.title",
        "CitizenFeedback.description",
        "CitizenFeedback.status",
        "CitizenFeedback.priority",
        "CitizenFeedback.createdAt",
        "CitizenFeedback.resolvedAt",
        "CitizenFeedback.resolutionNotes",
        "CitizenFeedback.address",
        "CitizenFeedback.neighborhood",
        "FeedbackCategory.name as categoryName",
        "FeedbackDepartment.name as departmentName",
      ])
      .where("CitizenFeedback.referenceNumber", "=", referenceNumber)
      .executeTakeFirst();

    if (!feedback) {
      return { found: false, feedback: null, publicComments: [] };
    }

    // Get public comments
    const publicComments = await db.$qb
      .selectFrom("FeedbackComment")
      .select(["id", "content", "createdAt", "isFromCitizen"])
      .where("feedbackId", "=", feedback.id)
      .where("isInternal", "=", false)
      .orderBy("createdAt", "asc")
      .execute();

    return {
      found: true,
      feedback,
      publicComments,
    };
  })

  // Add citizen comment to feedback (public)
  .post(
    "/track/:referenceNumber/comment",
    async ({ params, body }) => {
      const { referenceNumber } = params;
      const { content, citizenName, citizenEmail } = body;

      // Find the feedback
      const feedback = await db.$qb
        .selectFrom("CitizenFeedback")
        .select(["id", "organizationId"])
        .where("referenceNumber", "=", referenceNumber)
        .executeTakeFirst();

      if (!feedback) {
        throw new Error("Feedback not found");
      }

      // Create the comment
      const comment = await db.$qb
        .insertInto("FeedbackComment")
        .values({
          id: sql`uuidv7()`,
          feedbackId: feedback.id,
          content,
          isInternal: false,
          isFromCitizen: true,
          organizationId: feedback.organizationId,
          createdAt: sql`now()`,
        } as any)
        .returning(["id", "content", "createdAt"])
        .executeTakeFirst();

      return {
        success: true,
        comment,
      };
    },
    {
      body: t.Object({
        content: t.String(),
        citizenName: t.Optional(t.String()),
        citizenEmail: t.Optional(t.String()),
      }),
    }
  )

  // Submit satisfaction rating (public)
  .post(
    "/track/:referenceNumber/rating",
    async ({ params, body }) => {
      const { referenceNumber } = params;
      const { rating, comment } = body;

      // Update the feedback with rating
      const result = await db.$qb
        .updateTable("CitizenFeedback")
        .set({
          satisfactionRating: rating,
          satisfactionComment: comment,
          updatedAt: sql`now()`,
        } as any)
        .where("referenceNumber", "=", referenceNumber)
        .where("status", "in", ["resolved", "closed"])
        .returning(["id", "satisfactionRating"])
        .executeTakeFirst();

      if (!result) {
        throw new Error("Feedback not found or not yet resolved");
      }

      return {
        success: true,
        message: "Thank you for your feedback!",
      };
    },
    {
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 5 }),
        comment: t.Optional(t.String()),
      }),
    }
  )

  // Get public categories for a city hall (public)
  .get("/public/categories/:organizationSlug", async ({ params }) => {
    const { organizationSlug } = params;

    // Get organization by slug
    const organization = await db.$qb
      .selectFrom("Organization")
      .select(["id", "name", "logo"])
      .where("slug", "=", organizationSlug)
      .executeTakeFirst();

    if (!organization) {
      return { found: false, organization: null, categories: [] };
    }

    // Get active categories with subcategories
    const categories = await db.$qb
      .selectFrom("FeedbackCategory")
      .select(["id", "name", "description", "icon", "color"])
      .where("organizationId", "=", organization.id)
      .where("active", "=", true)
      .orderBy("orderIndex", "asc")
      .execute();

    // Get subcategories for each category
    const categoriesWithSubcategories = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await db.$qb
          .selectFrom("FeedbackSubcategory")
          .select(["id", "name", "description", "icon"])
          .where("categoryId", "=", category.id)
          .where("active", "=", true)
          .orderBy("orderIndex", "asc")
          .execute();

        return {
          ...category,
          subcategories,
        };
      })
    );

    return {
      found: true,
      organization: {
        id: organization.id,
        name: organization.name,
        logo: organization.logo,
      },
      categories: categoriesWithSubcategories,
    };
  });
