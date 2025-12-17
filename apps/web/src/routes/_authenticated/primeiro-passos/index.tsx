import { createFileRoute } from "@tanstack/react-router";

import { FirstSteps } from "~/features/first-steps";

export const Route = createFileRoute("/_authenticated/primeiro-passos/")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return <FirstSteps />;
}
