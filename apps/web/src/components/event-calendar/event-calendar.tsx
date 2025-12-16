import { cn } from "@acme/ui";
import { Button } from "@acme/ui/base-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@acme/ui/base-ui/dropdown-menu";
import { getRouteApi } from "@tanstack/react-router";
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { EventCalendar as EventCalendarType } from "@/zenstack/models";
import type { CalendarView } from "~/components/event-calendar";
import {
  AGENDA_DAYS_TO_SHOW,
  AgendaView,
  CalendarDndProvider,
  DayView,
  EVENT_GAP,
  EVENT_HEIGHT,
  EventDialog,
  MonthView,
  WEEK_CELLS_HEIGHT,
  WeekView,
} from "~/components/event-calendar";
import MaterialSymbolsEventAvailable from "~icons/material-symbols/event-available";
import type { EventCalendarCreate, EventCalendarUpdate } from "./types";

export interface EventCalendarProps {
  events?: EventCalendarType[];
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  view: CalendarView;
  setView: React.Dispatch<React.SetStateAction<CalendarView>>;
  onEventAdd?: (event: EventCalendarCreate) => void;
  onEventUpdate?: (event: EventCalendarUpdate) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
}

const VIEW_LABELS = {
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
};

const routeApi = getRouteApi("/_authenticated/calendar/");

export function EventCalendar({
  events = [],
  currentDate,
  setCurrentDate,
  view,
  setView,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
}: EventCalendarProps) {
  const navigate = routeApi.useNavigate();

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] =
    useState<Partial<EventCalendarType> | null>(null);

  const handleViewChange = (view: CalendarView) => {
    setView(view);
    navigate({
      search: (prev) => ({
        ...prev,
        view,
      }),
    });
  };

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          handleViewChange("month");
          break;
        case "s":
          handleViewChange("week");
          break;
        case "d":
          handleViewChange("day");
          break;
        case "a":
          handleViewChange("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEventDialogOpen, setView]);

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setCurrentDate(addDays(currentDate, -AGENDA_DAYS_TO_SHOW));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setCurrentDate(addDays(currentDate, AGENDA_DAYS_TO_SHOW));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventSelect = (event: EventCalendarType) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: Date) => {
    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder);
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }

    const newEvent: EventCalendarCreate = {
      title: "",
      start: startTime,
      end: addHours(startTime, 1),
      allDay: false,
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const handleEventSave = (
    event: EventCalendarCreate | EventCalendarUpdate
  ) => {
    if (event.id) {
      onEventUpdate?.(event as EventCalendarUpdate);
      // Show toast notification when an event is updated
      toast(`Evento "${event.title}" atualizado`, {
        description: format(new Date(event.start ?? new Date()), "dd/MM/yyyy"),
      });
    } else {
      onEventAdd?.(event as EventCalendarCreate);
      // Show toast notification when an event is added
      toast(`Evento "${event.title}" adicionado`, {
        description: format(new Date(event.start ?? new Date()), "dd/MM/yyyy"),
      });
    }
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    const deletedEvent = events.find((e) => e.id === eventId);
    onEventDelete?.(eventId);
    setIsEventDialogOpen(false);
    setSelectedEvent(null);

    // Show toast notification when an event is deleted
    if (deletedEvent) {
      toast(`Evento "${deletedEvent.title}" deletado`, {
        description: format(new Date(deletedEvent.start), "dd/MM/yyyy"),
      });
    }
  };

  const handleEventUpdate = (updatedEvent: EventCalendarUpdate) => {
    onEventUpdate?.(updatedEvent);

    // Show toast notification when an event is updated via drag and drop
    toast(`Evento "${updatedEvent.title}" movido`, {
      description: format(
        new Date(updatedEvent.start ?? new Date()),
        "dd/MM/yyyy"
      ),
    });
  };

  const viewTitle = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    }

    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      }
      return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }

    if (view === "day") {
      return (
        <>
          <span aria-hidden="true" className="min-[480px]:hidden">
            {format(currentDate, "MMM d, yyyy")}
          </span>
          <span aria-hidden="true" className="max-[479px]:hidden md:hidden">
            {format(currentDate, "MMMM d, yyyy")}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEE MMMM d, yyyy")}
          </span>
        </>
      );
    }

    if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AGENDA_DAYS_TO_SHOW - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy");
      }
      return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }

    return format(currentDate, "MMMM yyyy");
  }, [currentDate, view]);

  return (
    <div
      className="flex h-full flex-col rounded-lg border"
      style={
        {
          "--event-height": `${EVENT_HEIGHT}px`,
          "--event-gap": `${EVENT_GAP}px`,
          "--week-cells-height": `${WEEK_CELLS_HEIGHT}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div
          className={cn(
            "flex items-center justify-between p-2 sm:p-4",
            className
          )}
        >
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              className="aspect-square max-[479px]:p-0!"
              onClick={handleToday}
              variant="outline"
            >
              <MaterialSymbolsEventAvailable
                aria-hidden="true"
                className="size-4 min-[480px]:hidden"
              />
              <span className="max-[479px]:sr-only">Hoje</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button
                aria-label="Previous"
                onClick={handlePrevious}
                size="icon"
                variant="ghost"
              >
                <ChevronLeftIcon aria-hidden="true" size={16} />
              </Button>
              <Button
                aria-label="Next"
                onClick={handleNext}
                size="icon"
                variant="ghost"
              >
                <ChevronRightIcon aria-hidden="true" size={16} />
              </Button>
            </div>
            <h2 className="font-semibold text-sm sm:text-lg md:text-xl">
              {viewTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5 max-[479px]:h-8" variant="outline">
                  <span>
                    <span aria-hidden="true" className="min-[480px]:hidden">
                      {VIEW_LABELS[view].charAt(0).toUpperCase()}
                    </span>
                    <span className="max-[479px]:sr-only">
                      {VIEW_LABELS[view].charAt(0).toUpperCase() +
                        VIEW_LABELS[view].slice(1)}
                    </span>
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="-me-1 opacity-60"
                    size={16}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem
                  onClick={() => {
                    handleViewChange("month");
                  }}
                >
                  Mês <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleViewChange("week");
                  }}
                >
                  Semana <DropdownMenuShortcut>S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleViewChange("day");
                  }}
                >
                  Dia <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleViewChange("agenda");
                  }}
                >
                  Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              className="aspect-square max-[479px]:p-0!"
              onClick={() => {
                setSelectedEvent(null); // Ensure we're creating a new event
                setIsEventDialogOpen(true);
              }}
            >
              <PlusIcon
                aria-hidden="true"
                className="opacity-60 sm:-ms-1"
                size={16}
              />
              <span className="max-sm:sr-only">Novo evento</span>
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={events}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={events}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
          onDelete={handleEventDelete}
          onSave={handleEventSave}
        />
      </CalendarDndProvider>
    </div>
  );
}
