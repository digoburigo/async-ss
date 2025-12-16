import { showTimerToast } from "@acme/ui/custom/timer-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useTRPC } from "@/lib/trpc-client";

import type { CalendarView } from "~/components/event-calendar";
import { EventCalendar } from "~/components/event-calendar";

export function CalendarWrapper({
  initialView,
}: {
  initialView: CalendarView;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
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
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate),
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
          gte: intervalDateBasedOnView.start,
        },
        end: {
          lte: intervalDateBasedOnView.end,
        },
      },
    }),
    [intervalDateBasedOnView]
  );

  const { data: events } = useQuery(
    trpc.eventCalendar.findMany.queryOptions(eventsFilter)
  );

  const { mutate: createEvent } = useMutation(
    trpc.eventCalendar.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.eventCalendar.findMany.queryKey(eventsFilter),
        });
      },
    })
  );

  const { mutate: updateEvent } = useMutation(
    trpc.eventCalendar.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.eventCalendar.findMany.queryKey(eventsFilter),
        });
      },
    })
  );

  const { mutateAsync: deleteEvent } = useMutation(
    trpc.eventCalendar.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.eventCalendar.findMany.queryKey(eventsFilter),
        });
      },
    })
  );

  return (
    <EventCalendar
      currentDate={currentDate}
      events={events}
      onEventAdd={(event) => createEvent({ data: event })}
      onEventDelete={async (id) => {
        await deleteEvent({ where: { id } });
        showTimerToast({
          content: "Evento removido",
        });
      }}
      onEventUpdate={(event) => {
        const { id, ...data } = event;
        updateEvent({ data, where: { id } });
      }}
      setCurrentDate={setCurrentDate}
      setView={setView}
      view={view}
    />
  );
}
