import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

import { Indicators } from "~/features/indicators";

const indicatorsSearchSchema = z.object({
  tab: z
    .enum(["preboarding", "onboarding", "rotina", "offboarding"])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/_authenticated/indicators/")({
  validateSearch: indicatorsSearchSchema,
  component: Indicators,
});
