import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authClient } from "~/clients/auth-client";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    console.log(`🚀 -> session:`, session?.session);
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Outlet />
    </div>
  );
}
