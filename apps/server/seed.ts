import { auth } from "@repo/auth";
import { db, eq, reset, schema, todosCrud } from "@repo/db";
import { config } from "dotenv";

config({ path: "../apps/clinic/.env" });

const { member, organization, user } = schema;

function generateFakeScope({
  userId,
  organizationId,
  organizationRole,
  role,
}: {
  userId: string;
  organizationId: string;
  organizationRole: string | null;
  role: string;
}) {
  return {
    actor: {
      type: "user",
      properties: {
        userId,
        organizationId,
        organizationRole,
        role,
      },
    },
    scope: { organizationId },
  };
}

async function main() {
  await reset(db, schema);

  const [aUser, bUser] = await Promise.all([
    auth.api.signUpEmail({
      body: {
        email: "a@a.com",
        password: "12345678",
        name: "User A",
      },
    }),
    auth.api.signUpEmail({
      body: {
        email: "b@b.com",
        password: "12345678",
        name: "User B",
      },
    }),
  ]);

  const [orgAResult, orgBResult] = await Promise.all([
    db
      .insert(organization)
      .values({
        id: "1",
        name: "Org A",
        slug: "org-a",
        createdAt: new Date(),
      })
      .returning({ id: organization.id }),
    db
      .insert(organization)
      .values({
        id: "2",
        name: "Org B",
        slug: "org-b",
        createdAt: new Date(),
      })
      .returning({ id: organization.id }),
  ]);

  const orgAId = orgAResult[0]?.id ?? "";
  const orgBId = orgBResult[0]?.id ?? "";

  await Promise.all([
    db
      .update(user)
      .set({
        role: "admin",
        emailVerified: true,
      })
      .where(eq(user.id, aUser.user.id)),

    db
      .update(user)
      .set({
        role: "member",
        emailVerified: true,
      })
      .where(eq(user.id, bUser.user.id)),

    db.insert(member).values({
      id: "1",
      organizationId: orgAId,
      userId: aUser.user.id,
      role: "owner",
      createdAt: new Date(),
    }),

    db.insert(member).values({
      id: "2",
      organizationId: orgBId,
      userId: aUser.user.id,
      role: "owner",
      createdAt: new Date(),
    }),

    db.insert(member).values({
      id: "3",
      organizationId: orgAId,
      userId: bUser.user.id,
      role: "member",
      createdAt: new Date(),
    }),
  ]);

  const createTodoPermission = await db
    .insert(schema.permission)
    .values({
      operation: "create",
      resource: "todos",
      organizationId: orgAId,
      description: "Create todos",
    })
    .returning({ id: schema.permission.id });
  const createTodoPermissionId = createTodoPermission[0]?.id ?? "";

  const adminRole = await db
    .insert(schema.role)
    .values({
      name: "admin",
      description: "Admin role",
      organizationId: orgAId,
    })
    .returning({ id: schema.role.id });
  const adminRoleId = adminRole[0]?.id ?? "";

  await db.insert(schema.permissionsToRoles).values({
    roleId: adminRoleId,
    permissionId: createTodoPermissionId,
  });

  const listTodoPermission = await db
    .insert(schema.permission)
    .values({
      operation: "list",
      resource: "todos",
      organizationId: orgAId,
      description: "List todos",
    })
    .returning({ id: schema.permission.id });
  const listTodoPermissionId = listTodoPermission[0]?.id ?? "";

  const memberRole = await db
    .insert(schema.role)
    .values({
      name: "member",
      description: "Member role",
      organizationId: orgAId,
    })
    .returning({ id: schema.role.id });
  const memberRoleId = memberRole[0]?.id ?? "";

  await db.insert(schema.permissionsToRoles).values({
    roleId: adminRoleId,
    permissionId: listTodoPermissionId,
  });

  await db.insert(schema.permissionsToRoles).values({
    roleId: memberRoleId,
    permissionId: listTodoPermissionId,
  });

  await db.insert(schema.membersToRoles).values({
    roleId: memberRoleId,
    memberId: "3", // Member ID for bUser in orgA
  });

  const scope = generateFakeScope({
    userId: aUser.user.id,
    organizationId: orgAId,
    organizationRole: "owner",
    role: "admin",
  });

  const todo = await todosCrud.create(
    {
      title: "Todo 1",
      organizationId: orgAId,
      createdBy: aUser.user.id,
      updatedBy: aUser.user.id,
    },
    scope
  );

  console.log(todo);
}

main();
