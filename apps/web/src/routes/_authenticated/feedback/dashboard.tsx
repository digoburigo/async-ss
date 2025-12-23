import { createFileRoute } from "@tanstack/react-router";

import { FeedbackDashboard } from "~/features/feedback/dashboard";

export const Route = createFileRoute("/_authenticated/feedback/dashboard")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return <FeedbackDashboard />;
}
