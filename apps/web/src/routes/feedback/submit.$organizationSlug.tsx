import { createFileRoute } from "@tanstack/react-router";

import { PublicFeedbackSubmit } from "~/features/public-feedback/submit";

export const Route = createFileRoute("/feedback/submit/$organizationSlug")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PublicFeedbackSubmit />;
}
