import { cn } from "@acme/ui";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { differenceInMinutes, format, getMinutes, isPast } from "date-fns";
import { useMemo } from "react";
import type { EventCalendar } from "@/zenstack/models";

import {
  getBorderRadiusClasses,
  getEventColorClasses,
} from "~/components/event-calendar";

// Using date-fns format with custom formatting:
// 'h' - hours (1-12)
// 'a' - am/pm
// ':mm' - minutes with leading zero (only if the token 'mm' is present)
const formatTimeWithOptionalMinutes = (date: Date) =>
  format(date, getMinutes(date) === 0 ? "HH:mm" : "HH:mm").toLowerCase();

interface EventWrapperProps {
  event: EventCalendar;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: Date;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

// Shared wrapper component for event styling
function EventWrapper({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventWrapperProps) {
  // Always use the currentTime (if provided) to determine if the event is in the past
  const displayEnd = currentTime
    ? new Date(
        new Date(currentTime).getTime() +
          (new Date(event.end).getTime() - new Date(event.start).getTime())
      )
    : new Date(event.end);

  const isEventInPast = isPast(displayEnd);

  return (
    <button
      className={cn(
        "flex h-full w-full select-none overflow-hidden px-1 text-left font-medium outline-none backdrop-blur-md transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-dragging:cursor-grabbing data-past-event:line-through data-dragging:shadow-lg sm:px-2",
        getEventColorClasses(event.eventType),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        className
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  );
}

interface EventItemProps {
  event: EventCalendar;
  view: "month" | "week" | "day" | "agenda";
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  currentTime?: Date; // For updating time during drag
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
}

export function EventItem({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) {
  const eventType = event.eventType;

  // Use the provided currentTime (for dragging) or the event's actual time
  const displayStart = useMemo(
    () => currentTime || new Date(event.start),
    [currentTime, event.start]
  );

  const displayEnd = useMemo(
    () =>
      currentTime
        ? new Date(
            new Date(currentTime).getTime() +
              (new Date(event.end).getTime() - new Date(event.start).getTime())
          )
        : new Date(event.end),
    [currentTime, event.start, event.end]
  );

  // Calculate event duration in minutes
  const durationMinutes = useMemo(
    () => differenceInMinutes(displayEnd, displayStart),
    [displayStart, displayEnd]
  );

  const getEventTime = () => {
    if (event.allDay) return "Dia todo";

    // For short events (less than 45 minutes), only show start time
    if (durationMinutes < 45) {
      return formatTimeWithOptionalMinutes(displayStart);
    }

    // For longer events, show both start and end time
    return `${formatTimeWithOptionalMinutes(
      displayStart
    )} - ${formatTimeWithOptionalMinutes(displayEnd)}`;
  };

  if (view === "month") {
    return (
      <EventWrapper
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className
        )}
        currentTime={currentTime}
        dndAttributes={dndAttributes}
        dndListeners={dndListeners}
        event={event}
        isDragging={isDragging}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children || (
          <span className="truncate">
            {!event.allDay && (
              <span className="truncate font-normal text-[11px] opacity-70">
                {formatTimeWithOptionalMinutes(displayStart)}{" "}
              </span>
            )}
            {event.title}
          </span>
        )}
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        className={cn(
          "py-1",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className
        )}
        currentTime={currentTime}
        dndAttributes={dndAttributes}
        dndListeners={dndListeners}
        event={event}
        isDragging={isDragging}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {durationMinutes < 45 ? (
          <div className="truncate">
            {event.title}{" "}
            {showTime && (
              <span
                className={cn(
                  "opacity-70",
                  view === "week" ? "sm:text-[11px]" : "text-[11px]"
                )}
              >
                {formatTimeWithOptionalMinutes(displayStart)}
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="truncate font-medium">{event.title}</div>
            {showTime && (
              <div className="truncate font-normal text-[11px] opacity-70">
                {getEventTime()}
              </div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  // Agenda view - kept separate since it's significantly different
  return (
    <button
      className={cn(
        "flex w-full flex-col gap-1 rounded p-2 text-left outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-past-event:line-through data-past-event:opacity-90",
        getEventColorClasses(eventType),
        className
      )}
      data-past-event={isPast(new Date(event.end)) || undefined}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      <div className="font-medium text-sm">{event.title}</div>
      <div className="text-xs opacity-70">
        {event.allDay ? (
          <span>Dia todo</span>
        ) : (
          <span className="uppercase">
            {formatTimeWithOptionalMinutes(displayStart)} -{" "}
            {formatTimeWithOptionalMinutes(displayEnd)}
          </span>
        )}
      </div>
      {event.description && (
        <div className="my-1 text-xs opacity-90">{event.description}</div>
      )}
    </button>
  );
}
