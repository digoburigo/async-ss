import React from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";

import { authClient } from "~/clients/authClient";

export const Route = createRootRoute({
  component: RootComponent,
});

// https://tanstack.com/router/v1/docs/framework/react/devtools
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : React.lazy(() =>
      import("@tanstack/router-devtools").then((res) => ({
        default: res.TanStackRouterDevtools,
      })),
    );

function RootComponent() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {/* <Navbar session={session} /> */}
      {/* <Toaster /> */}
      <div className="p-2 md:p-4">
        <Outlet />
      </div>
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </>
  );
}
