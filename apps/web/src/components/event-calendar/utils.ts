import { isSameDay } from "date-fns";

import type { EventCalendar, EventCalendarType } from "@/zenstack/models";

/**
 * Get CSS classes for event colors
 */
export function getEventColorClasses(
	eventType: EventCalendarType | null,
): string {
	const currentEventType = eventType;

	switch (currentEventType) {
		case "MEETING":
			return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
		case "ONBOARDING":
			return "bg-emerald-200/50 hover:bg-emerald-200/40 text-emerald-950/80 dark:bg-emerald-400/25 dark:hover:bg-emerald-400/20 dark:text-emerald-200 shadow-emerald-700/8";
		case "TRAINING":
			return "bg-violet-200/50 hover:bg-violet-200/40 text-violet-950/80 dark:bg-violet-400/25 dark:hover:bg-violet-400/20 dark:text-violet-200 shadow-violet-700/8";
		case "INTERVIEW":
			return "bg-amber-200/50 hover:bg-amber-200/40 text-amber-950/80 dark:bg-amber-400/25 dark:hover:bg-amber-400/20 dark:text-amber-200 shadow-amber-700/8";
		case "TASK":
			return "bg-rose-200/50 hover:bg-rose-200/40 text-rose-950/80 dark:bg-rose-400/25 dark:hover:bg-rose-400/20 dark:text-rose-200 shadow-rose-700/8";
		case "OTHER":
			return "bg-orange-200/50 hover:bg-orange-200/40 text-orange-950/80 dark:bg-orange-400/25 dark:hover:bg-orange-400/20 dark:text-orange-200 shadow-orange-700/8";
		default:
			return "bg-sky-200/50 hover:bg-sky-200/40 text-sky-950/80 dark:bg-sky-400/25 dark:hover:bg-sky-400/20 dark:text-sky-200 shadow-sky-700/8";
	}
}

/**
 * Get CSS classes for border radius based on event position in multi-day events
 */
export function getBorderRadiusClasses(
	isFirstDay: boolean,
	isLastDay: boolean,
): string {
	if (isFirstDay && isLastDay) {
		return "rounded"; // Both ends rounded
	}
	if (isFirstDay) {
		return "rounded-l rounded-r-none"; // Only left end rounded
	}
	if (isLastDay) {
		return "rounded-r rounded-l-none"; // Only right end rounded
	}
	return "rounded-none"; // No rounded corners
}

/**
 * Check if an event is a multi-day event
 */
export function isMultiDayEvent(event: EventCalendar): boolean {
	const eventStart = new Date(event.start);
	const eventEnd = new Date(event.end);
	return event.allDay || eventStart.getDate() !== eventEnd.getDate();
}

/**
 * Filter events for a specific day
 */
export function getEventsForDay(
	events: EventCalendar[] | undefined,
	day: Date,
) {
	return events
		?.filter((event) => {
			const eventStart = new Date(event.start);
			return isSameDay(day, eventStart);
		})
		.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Sort events with multi-day events first, then by start time
 */
export function sortEvents(events: EventCalendar[]): EventCalendar[] {
	return [...events].sort((a, b) => {
		const aIsMultiDay = isMultiDayEvent(a);
		const bIsMultiDay = isMultiDayEvent(b);

		if (aIsMultiDay && !bIsMultiDay) return -1;
		if (!aIsMultiDay && bIsMultiDay) return 1;

		return new Date(a.start).getTime() - new Date(b.start).getTime();
	});
}

/**
 * Get multi-day events that span across a specific day (but don't start on that day)
 */
export function getSpanningEventsForDay(
	events: EventCalendar[] | undefined,
	day: Date,
) {
	return events?.filter((event) => {
		if (!isMultiDayEvent(event)) return false;

		const eventStart = new Date(event.start);
		const eventEnd = new Date(event.end);

		// Only include if it's not the start day but is either the end day or a middle day
		return (
			!isSameDay(day, eventStart) &&
			(isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
		);
	});
}

/**
 * Get all events visible on a specific day (starting, ending, or spanning)
 */
export function getAllEventsForDay(
	events: EventCalendar[] | undefined,
	day: Date,
) {
	return events?.filter((event) => {
		const eventStart = new Date(event.start);
		const eventEnd = new Date(event.end);
		return (
			isSameDay(day, eventStart) ||
			isSameDay(day, eventEnd) ||
			(day > eventStart && day < eventEnd)
		);
	});
}

/**
 * Get all events for a day (for agenda view)
 */
export function getAgendaEventsForDay(
	events: EventCalendar[] | undefined,
	day: Date,
) {
	return events
		?.filter((event) => {
			const eventStart = new Date(event.start);
			const eventEnd = new Date(event.end);
			return (
				isSameDay(day, eventStart) ||
				isSameDay(day, eventEnd) ||
				(day > eventStart && day < eventEnd)
			);
		})
		.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
