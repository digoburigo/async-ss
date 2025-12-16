import { createFileRoute } from "@tanstack/react-router";

import { Mindmaps } from "~/features/mindmaps";

export const Route = createFileRoute("/_authenticated/mindmaps/")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return <Mindmaps />;
}
