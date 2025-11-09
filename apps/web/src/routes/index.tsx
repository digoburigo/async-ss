import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useTheme } from "next-themes";

import { Button as BaseButton } from "@acme/ui/base-ui/button";
import { Button } from "@acme/ui/button";

import { api } from "~/clients/api-client";
import { authClient } from "~/clients/auth-client";
import { Test } from "~/components/test";
import { UserAvatar } from "~/components/user-avatar";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!session?.session) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  console.log(`🚀 -> session:`, session?.session);
  const { resolvedTheme, setTheme } = useTheme();
  console.log(`🚀 -> resolvedTheme:`, resolvedTheme);

  // const { data: firstPostUpdatedAt } = useQuery({
  //   queryKey: ["posts"],
  //   queryFn: async () => {
  //     const { data, error } = await api.test.get();
  //     console.log(`🚀 -> data:`, data);

  //     if (error) {
  //       console.log(`🚀 -> error:`, error);
  //       throw error;
  //     }

  //     return data?.at(0)?.updatedAt;
  //   },
  // });

  return (
    <div className="mt-1">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <Test />

      <BaseButton size={"lg"}>Click me</BaseButton>
      <Button>Click me</Button>

      {session?.user ? <UserAvatar user={session?.user} /> : null}
      {/* {firstPostUpdatedAt
        ? formatDistanceToNow(firstPostUpdatedAt)
        : "No posts"} */}
    </div>
  );
}
