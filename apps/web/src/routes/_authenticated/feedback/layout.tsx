import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/feedback")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return <Outlet />;
}
