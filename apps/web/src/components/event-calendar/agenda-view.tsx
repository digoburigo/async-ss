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
  const days = useMemo(
    () =>
      Array.from({ length: AGENDA_DAYS_TO_SHOW }, (_, i) =>
        addDays(new Date(currentDate), i)
      ),
    [currentDate]
  );

  const handleEventClick = (event: EventCalendar, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  // Check if there are any days with events
  const hasEvents = days.some(
    (day) => (getAgendaEventsForDay(events ?? [], day)?.length ?? 0) > 0
  );

  return (
    <div className="h-full overflow-auto border-border/70 border-t">
      {hasEvents ? (
        days.map((day) => {
          const dayEvents = getAgendaEventsForDay(events ?? [], day);

          if (dayEvents?.length === 0) return null;

          return (
            <div key={day.toString()}>
              <div
                className="sticky top-0 z-10 border-border/70 border-b bg-background px-4 py-2"
                data-today={isToday(day) || undefined}
              >
                <span className="text-[10px] uppercase data-[today]:font-medium sm:text-xs">
                  {format(day, "d 'de' MMMM, EEEE")}
                </span>
              </div>
              <div className="space-y-2 px-4 py-4">
                {dayEvents?.map((event) => (
                  <EventItem
                    event={event}
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    view="agenda"
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex min-h-[70svh] flex-col items-center justify-center px-4 py-16 text-center">
          <MaterialSymbolsEventAvailable className="mb-2 size-8 text-muted-foreground/50" />
          <h3 className="font-medium text-lg">Nenhum evento encontrado</h3>
          <p className="text-muted-foreground">
            Não há eventos agendados para este período.
          </p>
        </div>
      )}
    </div>
  );
}
