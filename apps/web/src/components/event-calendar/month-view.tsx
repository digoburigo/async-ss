import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@acme/ui/base-ui/popover";
import type { CalendarEvent as EventCalendar } from "@acme/zen-v3/zenstack/models";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";

import {
  DraggableEvent,
  DroppableCell,
  EVENT_GAP,
  EVENT_HEIGHT,
  EventItem,
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
  sortEvents,
  useEventVisibility,
} from "~/components/event-calendar";

interface MonthViewProps {
  currentDate: Date;
  events?: EventCalendar[];
  onEventSelect: (event: EventCalendar) => void;
  onEventCreate: (startTime: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  onEventSelect,
  onEventCreate,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const date = addDays(startOfWeek(new Date()), i);
        return format(date, "EEE");
      }),
    []
  );

  const weeks = useMemo(() => {
    const result = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);
      if (week.length === 7 || i === days.length - 1) {
        result.push(week);
        week = [];
      }
    }

    return result;
  }, [days]);

  const handleEventClick = (event: EventCalendar, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventSelect(event);
  };

  const [isMounted, setIsMounted] = useState(false);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EVENT_HEIGHT,
    eventGap: EVENT_GAP,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-border/70 border-b">
        {weekdays.map((day) => (
          <div
            className="py-2 text-center text-muted-foreground/70 text-sm"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid flex-1 auto-rows-fr">
        {weeks.map((week, weekIndex) => (
          <div
            className="grid grid-cols-7 [&:last-child>*]:border-b-0"
            key={`week-${weekIndex}`}
          >
            {week.map((day, dayIndex) => {
              const currentDay = day ?? new Date();
              const dayEvents = getEventsForDay(events, currentDay);
              const spanningEvents = getSpanningEventsForDay(
                events,
                currentDay
              );
              const isCurrentMonth = isSameMonth(currentDay, currentDate);
              const cellId = `month-cell-${currentDay?.toISOString()}`;
              const allDayEvents = [
                ...(spanningEvents ?? []),
                ...(dayEvents ?? []),
              ];
              const allEvents = getAllEventsForDay(events, currentDay);

              const isReferenceCell = weekIndex === 0 && dayIndex === 0;
              const visibleCount = isMounted
                ? getVisibleEventCount(allDayEvents.length)
                : undefined;
              const hasMore =
                visibleCount !== undefined &&
                allDayEvents.length > visibleCount;
              const remainingCount = hasMore
                ? allDayEvents.length - visibleCount
                : 0;

              return (
                <div
                  className="group border-border/70 border-r border-b last:border-r-0 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70"
                  data-outside-cell={!isCurrentMonth || undefined}
                  data-today={isToday(currentDay) || undefined}
                  key={day?.toString()}
                >
                  <DroppableCell
                    date={currentDay}
                    id={cellId}
                    onClick={() => {
                      const startTime = new Date(currentDay);
                      startTime.setHours(9, 0, 0); // Default to 9:00 AM
                      onEventCreate(startTime);
                    }}
                  >
                    <div className="mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm group-data-today:bg-primary group-data-today:text-primary-foreground">
                      {format(currentDay, "d")}
                    </div>
                    <div
                      className="min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                      ref={isReferenceCell ? contentRef : null}
                    >
                      {sortEvents(allDayEvents).map((event, index) => {
                        const eventStart = new Date(event.start);
                        const eventEnd = new Date(event.end);
                        const isFirstDay = isSameDay(currentDay, eventStart);
                        const isLastDay = isSameDay(currentDay, eventEnd);

                        const isHidden =
                          isMounted && visibleCount && index >= visibleCount;

                        if (!visibleCount) return null;

                        if (!isFirstDay) {
                          return (
                            <div
                              aria-hidden={isHidden ? "true" : undefined}
                              className="aria-hidden:hidden"
                              key={`spanning-${event.id}-${currentDay
                                .toISOString()
                                .slice(0, 10)}`}
                            >
                              <EventItem
                                event={event}
                                isFirstDay={isFirstDay}
                                isLastDay={isLastDay}
                                onClick={(e) => handleEventClick(event, e)}
                                view="month"
                              >
                                <div aria-hidden={true} className="invisible">
                                  {!event.allDay && (
                                    <span>
                                      {format(
                                        new Date(event.start),
                                        "h:mm"
                                      )}{" "}
                                    </span>
                                  )}
                                  {event.title}
                                </div>
                              </EventItem>
                            </div>
                          );
                        }

                        return (
                          <div
                            aria-hidden={isHidden ? "true" : undefined}
                            className="aria-hidden:hidden"
                            key={event.id}
                          >
                            <DraggableEvent
                              event={event}
                              isFirstDay={isFirstDay}
                              isLastDay={isLastDay}
                              onClick={(e) => handleEventClick(event, e)}
                              view="month"
                            />
                          </div>
                        );
                      })}

                      {hasMore && (
                        <Popover modal>
                          <PopoverTrigger
                            render={
                              <button
                                className="mt-[var(--event-gap)] flex h-[var(--event-height)] w-full select-none items-center overflow-hidden px-1 text-left text-[10px] text-muted-foreground outline-none backdrop-blur-md transition hover:bg-muted/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:cursor-grabbing data-past-event:line-through data-dragging:shadow-lg sm:px-2 sm:text-xs"
                                onClick={(e) => e.stopPropagation()}
                                type="button"
                              >
                                <span>
                                  + {remainingCount}{" "}
                                  <span className="max-sm:sr-only">more</span>
                                </span>
                              </button>
                            }
                          />
                          <PopoverContent
                            align="center"
                            className="max-w-52 p-3"
                            style={
                              {
                                "--event-height": `${EVENT_HEIGHT}px`,
                              } as React.CSSProperties
                            }
                          >
                            <div className="space-y-2">
                              <div className="font-medium text-sm">
                                {format(currentDay, "EEE d")}
                              </div>
                              <div className="space-y-1">
                                {sortEvents(allEvents ?? []).map((event) => {
                                  const eventStart = new Date(event.start);
                                  const eventEnd = new Date(event.end);
                                  const isFirstDay = isSameDay(
                                    currentDay,
                                    eventStart
                                  );
                                  const isLastDay = isSameDay(
                                    currentDay,
                                    eventEnd
                                  );

                                  return (
                                    <EventItem
                                      event={event}
                                      isFirstDay={isFirstDay}
                                      isLastDay={isLastDay}
                                      key={event.id}
                                      onClick={(e) =>
                                        handleEventClick(event, e)
                                      }
                                      view="month"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </DroppableCell>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
