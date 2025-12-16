import { createFileRoute } from "@tanstack/react-router";

import { Gamification } from "~/features/gamification";

export const Route = createFileRoute("/_authenticated/gamification/")({
  component: Gamification,
});
