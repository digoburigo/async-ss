import { addDays, format, isToday } from "date-fns";
import { useMemo } from "react";
import type { EventCalendar } from "@/zenstack/models";
import {
	AGENDA_DAYS_TO_SHOW,
	EventItem,
	getAgendaEventsForDay,
} from "~/components/event-calendar";
import MaterialSymbolsEventAvailable from "~icons/material-symbols/event-available";

interface AgendaViewProps {
	currentDate: Date;
	events?: EventCalendar[];
	onEventSelect: (event: EventCalendar) => void;
}

export function AgendaView({
	currentDate,
	events,
	onEventSelect,
}: AgendaViewProps) {
	// Show events for the next days based on constant
	const days = useMemo(() => {
		return Array.from({ length: AGENDA_DAYS_TO_SHOW }, (_, i) =>
			addDays(new Date(currentDate), i),
		);
	}, [currentDate]);

	const handleEventClick = (event: EventCalendar, e: React.MouseEvent) => {
		e.stopPropagation();
		onEventSelect(event);
	};

	// Check if there are any days with events
	const hasEvents = days.some(
		(day) => (getAgendaEventsForDay(events ?? [], day)?.length ?? 0) > 0,
	);

	return (
		<div className="border-border/70 border-t px-4">
			{!hasEvents ? (
				<div className="flex min-h-[70svh] flex-col items-center justify-center py-16 text-center">
					<MaterialSymbolsEventAvailable className="text-muted-foreground/50 mb-2 size-8" />
					<h3 className="text-lg font-medium">Nenhum evento encontrado</h3>
					<p className="text-muted-foreground">
						Não há eventos agendados para este período.
					</p>
				</div>
			) : (
				days.map((day) => {
					const dayEvents = getAgendaEventsForDay(events ?? [], day);

					if (dayEvents?.length === 0) return null;

					return (
						<div
							key={day.toString()}
							className="border-border/70 relative my-12 border-t"
						>
							<span
								className="bg-background absolute -top-3 left-0 flex h-6 items-center pe-4 text-[10px] uppercase data-today:font-medium sm:pe-4 sm:text-xs"
								data-today={isToday(day) || undefined}
							>
								{format(day, "d 'de' MMMM, EEEE")}
							</span>
							<div className="mt-6 space-y-2">
								{dayEvents?.map((event) => (
									<EventItem
										key={event.id}
										event={event}
										view="agenda"
										onClick={(e) => handleEventClick(event, e)}
									/>
								))}
							</div>
						</div>
					);
				})
			)}
		</div>
	);
}
