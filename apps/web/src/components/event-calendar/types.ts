import type {
  EventCalendarCreateScalarSchema,
  EventCalendarUpdateScalarSchema,
} from "@zenstackhq/runtime/zod/models";
import type { z } from "zod";
import type { CalendarEventType } from "@/zenstack/models";

export type CalendarView = "month" | "week" | "day" | "agenda";

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange";

// Re-export event type for convenience
export type EventCalendarType = CalendarEventType;

export type EventCalendarCreate = z.infer<
  typeof EventCalendarCreateScalarSchema
>;
export type EventCalendarUpdate = z.infer<
  typeof EventCalendarUpdateScalarSchema
>;
