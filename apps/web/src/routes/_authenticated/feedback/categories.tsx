import { createFileRoute } from "@tanstack/react-router";

import { FeedbackCategories } from "~/features/feedback-settings/categories";

export const Route = createFileRoute("/_authenticated/feedback/categories")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return <FeedbackCategories />;
}
