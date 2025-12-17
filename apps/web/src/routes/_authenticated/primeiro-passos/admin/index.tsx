import { createFileRoute } from "@tanstack/react-router";

import { FirstStepsAdmin } from "~/features/first-steps/admin";

export const Route = createFileRoute("/_authenticated/primeiro-passos/admin/")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return <FirstStepsAdmin />;
}
