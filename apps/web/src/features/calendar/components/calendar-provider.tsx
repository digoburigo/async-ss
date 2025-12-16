import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import {
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/clients/auth-client";
import type { CalendarView } from "~/components/event-calendar";
import { EventCalendar } from "~/components/event-calendar";
import type {
  EventCalendarCreate,
  EventCalendar as EventCalendarType,
  EventCalendarUpdate,
} from "~/zenstack/models";

interface CalendarProviderProps {
  initialView?: CalendarView;
  initialDate?: Date;
}

export function CalendarProvider({
  initialView = "month",
  initialDate = new Date(),
}: CalendarProviderProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);

  const intervalDateBasedOnView = useMemo(() => {
    switch (view) {
      case "month":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        };
      case "week":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        };
      case "day":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
        };
      case "agenda":
        return {
          start: startOfDay(currentDate),
          end: endOfMonth(addMonths(currentDate, 1)),
        };
    }
  }, [currentDate, view]);

  const eventsFilter = useMemo(
    () => ({
      where: {
        start: {
          gte: intervalDateBasedOnView.start.toISOString(),
        },
        end: {
          lte: intervalDateBasedOnView.end.toISOString(),
        },
      },
      orderBy: {
        start: "asc",
      },
    }),
    [intervalDateBasedOnView]
  );

  const { data: events = [], isLoading } = client.calendarEvent.useFindMany(
    eventsFilter,
    {
      enabled: !!activeOrganization?.id,
    }
  );

  const { mutateAsync: createEvent } = client.calendarEvent.useCreate({
    onSuccess: () => {
      toast.success("Evento criado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao criar evento", {
        description: error.message,
      });
    },
  });

  const { mutateAsync: updateEvent } = client.calendarEvent.useUpdate({
    onSuccess: () => {
      toast.success("Evento atualizado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar evento", {
        description: error.message,
      });
    },
  });

  const { mutateAsync: deleteEvent } = client.calendarEvent.useDelete({
    onSuccess: () => {
      toast.success("Evento excluído com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao excluir evento", {
        description: error.message,
      });
    },
  });

  const handleEventAdd = async (event: EventCalendarCreate) => {
    try {
      await createEvent({
        data: {
          title: event.title,
          description: event.description,
          start:
            event.start instanceof Date
              ? event.start.toISOString()
              : event.start,
          end: event.end instanceof Date ? event.end.toISOString() : event.end,
          allDay: event.allDay ?? false,
          eventType: event.eventType ?? "OTHER",
          color: event.color ?? "#3b82f6",
        },
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleEventUpdate = async (event: EventCalendarUpdate) => {
    if (!event.id) return;

    try {
      await updateEvent({
        where: { id: event.id },
        data: {
          title: event.title,
          description: event.description,
          start:
            event.start instanceof Date
              ? event.start.toISOString()
              : event.start,
          end: event.end instanceof Date ? event.end.toISOString() : event.end,
          allDay: event.allDay,
          eventType: event.eventType,
          color: event.color,
        },
      });
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEvent({
        where: { id: eventId },
      });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Transform events to match EventCalendar component expectations
  const transformedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })) as EventCalendarType[],
    [events]
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Carregando eventos...</p>
      </div>
    );
  }

  return (
    <EventCalendar
      currentDate={currentDate}
      events={transformedEvents}
      onEventAdd={handleEventAdd}
      onEventDelete={handleEventDelete}
      onEventUpdate={handleEventUpdate}
      setCurrentDate={setCurrentDate}
      setView={setView}
      view={view}
    />
  );
}
