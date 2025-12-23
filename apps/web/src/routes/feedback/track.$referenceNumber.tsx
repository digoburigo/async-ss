import { createFileRoute } from "@tanstack/react-router";

import { PublicFeedbackTrack } from "~/features/public-feedback/track";

export const Route = createFileRoute("/feedback/track/$referenceNumber")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PublicFeedbackTrack />;
}
