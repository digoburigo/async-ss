"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

const COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    all_day: false,
    color: "#3b82f6",
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await fetch(
        `/api/calendar?start=${startOfMonth.toISOString()}&end=${endOfMonth.toISOString()}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao carregar eventos");
        return;
      }

      setEvents(data.events || []);
    } catch (error) {
      console.error("[v0] Error loading events:", error);
      setError("Erro ao carregar eventos. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      start_time: new Date().toISOString().slice(0, 16),
      end_time: new Date(Date.now() + 3_600_000).toISOString().slice(0, 16),
      all_day: false,
      color: "#3b82f6",
    });
    setShowEventDialog(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      start_time: new Date(event.start_time).toISOString().slice(0, 16),
      end_time: new Date(event.end_time).toISOString().slice(0, 16),
      all_day: event.all_day,
      color: event.color,
    });
    setShowEventDialog(true);
  };

  const handleSaveEvent = async () => {
    try {
      const url = editingEvent ? "/api/calendar" : "/api/calendar";
      const method = editingEvent ? "PATCH" : "POST";

      const body = editingEvent
        ? { id: editingEvent.id, ...formData }
        : {
            ...formData,
            start_time: new Date(formData.start_time).toISOString(),
            end_time: new Date(formData.end_time).toISOString(),
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao salvar evento");
        return;
      }

      setShowEventDialog(false);
      loadEvents();
    } catch (error) {
      console.error("[v0] Error saving event:", error);
      setError("Erro ao salvar evento. Por favor, tente novamente.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    try {
      const response = await fetch(`/api/calendar?id=${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao excluir evento");
        return;
      }

      loadEvents();
    } catch (error) {
      console.error("[v0] Error deleting event:", error);
      setError("Erro ao excluir evento. Por favor, tente novamente.");
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl md:text-4xl">Calendário</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie seus eventos e compromissos
            </p>
          </div>
          <Button onClick={handleCreateEvent} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Novo Evento
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Calendar Navigation */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <Button onClick={previousMonth} size="icon" variant="outline">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-bold text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <Button onClick={nextMonth} size="icon" variant="outline">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Week Days Header */}
              <div className="mb-2 grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    className="py-2 text-center font-semibold text-muted-foreground text-sm"
                    key={day}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((date, index) => {
                  const dayEvents = getEventsForDay(date);
                  const isToday =
                    date &&
                    date.getDate() === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      className={cn(
                        "min-h-[100px] rounded-lg border p-2 transition-colors",
                        date
                          ? "cursor-pointer bg-card hover:bg-muted/50"
                          : "bg-muted/20",
                        isToday && "border-2 border-primary"
                      )}
                      key={index}
                      onClick={() => date && handleCreateEvent()}
                    >
                      {date && (
                        <>
                          <div
                            className={cn(
                              "mb-1 font-medium text-sm",
                              isToday && "text-primary"
                            )}
                          >
                            {date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                className="cursor-pointer truncate rounded p-1 text-xs hover:opacity-80"
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                }}
                                style={{
                                  backgroundColor: event.color + "20",
                                  color: event.color,
                                }}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-muted-foreground text-xs">
                                +{dayEvents.length - 2} mais
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        {/* Event Dialog */}
        <Dialog onOpenChange={setShowEventDialog} open={showEventDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Editar Evento" : "Novo Evento"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? "Atualize as informações do evento"
                  : "Crie um novo evento no calendário"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nome do evento"
                  value={formData.title}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detalhes do evento"
                  rows={3}
                  value={formData.description}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Início *</Label>
                  <Input
                    id="start_time"
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    type="datetime-local"
                    value={formData.start_time}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Fim *</Label>
                  <Input
                    id="end_time"
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    type="datetime-local"
                    value={formData.end_time}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        formData.color === color.value
                          ? "scale-110 border-foreground"
                          : "border-transparent"
                      )}
                      key={color.value}
                      onClick={() =>
                        setFormData({ ...formData, color: color.value })
                      }
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              {editingEvent && (
                <Button
                  onClick={() => {
                    handleDeleteEvent(editingEvent.id);
                    setShowEventDialog(false);
                  }}
                  variant="destructive"
                >
                  Excluir
                </Button>
              )}
              <Button
                onClick={() => setShowEventDialog(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={
                  !(formData.title && formData.start_time && formData.end_time)
                }
                onClick={handleSaveEvent}
              >
                {editingEvent ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
