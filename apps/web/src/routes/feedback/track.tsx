import { createFileRoute } from "@tanstack/react-router";

import { PublicFeedbackTrack } from "~/features/public-feedback/track";

export const Route = createFileRoute("/feedback/track")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PublicFeedbackTrack />;
}
