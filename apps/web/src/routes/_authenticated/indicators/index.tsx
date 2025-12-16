import { createFileRoute } from "@tanstack/react-router";

import { Indicators } from "~/features/indicators";

export const Route = createFileRoute("/_authenticated/indicators/")({
  component: Indicators,
});
