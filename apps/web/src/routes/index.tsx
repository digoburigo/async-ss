import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "next-themes";

import { authClient } from "~/clients/authClient";
import { Test } from "~/components/test";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  console.log(`🚀 -> session:`, session?.session);
  const { resolvedTheme, setTheme } = useTheme();
  console.log(`🚀 -> resolvedTheme:`, resolvedTheme);

  return (
    <div className="mt-1">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <Test />
    </div>
  );
}
