import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type AuthSession =
  | ReturnType<typeof createAuthClient>["$Infer"]["Session"]
  | null;
