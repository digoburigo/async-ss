import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Feedback } from "~/features/feedback";

const feedbackSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.enum([
        "open",
        "in_progress",
        "under_review",
        "resolved",
        "closed",
        "rejected",
      ])
    )
    .optional()
    .catch([]),
  priority: z
    .array(z.enum(["low", "medium", "high", "urgent", "critical"]))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/feedback/")({
  validateSearch: feedbackSearchSchema,
  component: RouteComponent,
});

export default function RouteComponent() {
  return <Feedback />;
}
