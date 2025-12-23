import { createFileRoute } from "@tanstack/react-router";

import { FeedbackDepartments } from "~/features/feedback-settings/departments";

export const Route = createFileRoute("/_authenticated/feedback/departments")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return <FeedbackDepartments />;
}
