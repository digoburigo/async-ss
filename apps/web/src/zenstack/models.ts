// Re-export types from zen-v3 package
export type {
  CalendarEvent,
  CalendarEventType,
} from "@acme/zen-v3/zenstack/models";
export { CalendarEventType } from "@acme/zen-v3/zenstack/models";

// Type alias for compatibility with event-calendar components
export type EventCalendar = CalendarEvent;
export type { EventCalendarType } from "@acme/zen-v3/zenstack/models";

// Re-export create/update schema types from zod models
export type {
  EventCalendarCreateScalarSchema,
  EventCalendarUpdateScalarSchema,
} from "@zenstackhq/runtime/zod/models";
