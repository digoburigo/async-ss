"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Clock, Repeat, Trash2 } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns"
import { ptBR } from "date-fns/locale"

interface CalendarEvent {
  id: string
  original_id?: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  all_day: boolean
  color: string
  rrule: string | null
  meeting_id: string | null
  is_recurring_instance?: boolean
}

const colorOptions = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6b7280", label: "Cinza" },
]

const recurrenceOptions = [
  { value: "none", label: "Não repetir" },
  { value: "FREQ=DAILY", label: "Diariamente" },
  { value: "FREQ=WEEKLY", label: "Semanalmente" },
  { value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", label: "Dias úteis" },
  { value: "FREQ=MONTHLY", label: "Mensalmente" },
  { value: "FREQ=YEARLY", label: "Anualmente" },
]

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    start_time: "09:00",
    end_date: "",
    end_time: "10:00",
    all_day: false,
    color: "#3b82f6",
    recurrence: "none",
    recurrence_count: 10,
  })

  // Calculate date range for the current view
  const viewRange = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return { start: calendarStart, end: calendarEnd }
  }, [currentDate])

  useEffect(() => {
    loadEvents()
  }, [viewRange])

  const loadEvents = async () => {
    try {
      const startStr = viewRange.start.toISOString()
      const endStr = viewRange.end.toISOString()

      const response = await fetch(`/api/calendar?start=${startStr}&end=${endStr}&expand=true`)
      if (!response.ok) throw new Error("Failed to fetch events")
      const data = await response.json()
      setEvents(data.events || [])
    } catch (error) {
      console.error("Error loading events:", error)
      toast.error("Erro ao carregar eventos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const startDateTime = formData.all_day
        ? `${formData.start_date}T00:00:00`
        : `${formData.start_date}T${formData.start_time}`
      const endDateTime = formData.all_day
        ? `${formData.end_date}T23:59:59`
        : `${formData.end_date}T${formData.end_time}`

      let rrule: string | null = null
      if (formData.recurrence !== "none") {
        rrule = `${formData.recurrence};COUNT=${formData.recurrence_count}`
      }

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          start_time: new Date(startDateTime).toISOString(),
          end_time: new Date(endDateTime).toISOString(),
          all_day: formData.all_day,
          color: formData.color,
          rrule,
        }),
      })

      if (!response.ok) throw new Error("Failed to create event")

      toast.success("Evento criado!")
      setIsNewEventDialogOpen(false)
      resetForm()
      loadEvents()
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Erro ao criar evento")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return

    try {
      // Use original_id if it's a recurring instance
      const idToDelete = selectedEvent?.original_id || eventId
      const response = await fetch(`/api/calendar?id=${idToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete event")

      toast.success("Evento excluído!")
      setIsEventDialogOpen(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Erro ao excluir evento")
    }
  }

  const resetForm = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    setFormData({
      title: "",
      description: "",
      start_date: today,
      start_time: "09:00",
      end_date: today,
      end_time: "10:00",
      all_day: false,
      color: "#3b82f6",
      recurrence: "none",
      recurrence_count: 10,
    })
  }

  const openNewEventDialog = (date?: Date) => {
    const dateStr = format(date || new Date(), "yyyy-MM-dd")
    setFormData({
      ...formData,
      start_date: dateStr,
      end_date: dateStr,
    })
    setIsNewEventDialogOpen(true)
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = parseISO(event.start_time)
      return isSameDay(eventDate, date)
    })
  }

  const getRecurrenceLabel = (rrule: string | null) => {
    if (!rrule) return null
    const parts = rrule.split(";")
    const rruleWithoutCount = parts.filter((p) => !p.startsWith("COUNT=")).join(";")
    const match = recurrenceOptions.find((opt) => opt.value === rruleWithoutCount)
    return match?.label || "Recorrente"
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = []
    let currentDay = viewRange.start
    while (currentDay <= viewRange.end) {
      days.push(currentDay)
      currentDay = addDays(currentDay, 1)
    }
    return days
  }, [viewRange])

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e compromissos</p>
        </div>

        <Button onClick={() => openNewEventDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</CardTitle>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div key={day} className="bg-muted-foreground/10 p-2 text-center text-sm font-medium">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day) => {
                const dayEvents = getEventsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-24 p-1 bg-background cursor-pointer hover:bg-muted/50 transition-colors ${
                      !isCurrentMonth ? "opacity-40" : ""
                    }`}
                    onClick={() => openNewEventDialog(day)}
                  >
                    <div
                      className={`text-sm font-medium p-1 rounded-full w-7 h-7 flex items-center justify-center ${
                        isToday ? "bg-primary text-primary-foreground" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color, color: "white" }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEvent(event)
                            setIsEventDialogOpen(true)
                          }}
                        >
                          {event.is_recurring_instance && <Repeat className="inline h-3 w-3 mr-1" />}
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-1">+{dayEvents.length - 3} mais</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedEvent?.color }} />
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>Detalhes do evento</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                {format(parseISO(selectedEvent.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </div>

              {!selectedEvent.all_day && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(parseISO(selectedEvent.start_time), "HH:mm")} -{" "}
                  {format(parseISO(selectedEvent.end_time), "HH:mm")}
                </div>
              )}

              {selectedEvent.rrule && (
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{getRecurrenceLabel(selectedEvent.rrule)}</Badge>
                </div>
              )}

              {selectedEvent.description && <p className="text-sm">{selectedEvent.description}</p>}

              {selectedEvent.meeting_id && <Badge variant="secondary">Reunião vinculada</Badge>}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {selectedEvent?.is_recurring_instance ? "Excluir todas ocorrências" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Event Dialog */}
      <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
            <DialogDescription>Crie um novo evento no calendário</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event_title">Título *</Label>
              <Input
                id="event_title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do evento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_description">Descrição</Label>
              <Textarea
                id="event_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes do evento..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="all_day"
                checked={formData.all_day}
                onCheckedChange={(checked) => setFormData({ ...formData, all_day: checked as boolean })}
              />
              <Label htmlFor="all_day" className="text-sm font-normal cursor-pointer">
                Dia inteiro
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data início *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              {!formData.all_day && (
                <div className="space-y-2">
                  <Label htmlFor="start_time">Hora início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">Data fim *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              {!formData.all_day && (
                <div className="space-y-2">
                  <Label htmlFor="end_time">Hora fim</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_color">Cor</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: formData.color }} />
                      {colorOptions.find((c) => c.value === formData.color)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: option.value }} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_recurrence">Recorrência</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value) => setFormData({ ...formData, recurrence: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a recorrência" />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.recurrence !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="recurrence_count">Número de ocorrências</Label>
                <Input
                  id="recurrence_count"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.recurrence_count}
                  onChange={(e) => setFormData({ ...formData, recurrence_count: Number.parseInt(e.target.value) })}
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewEventDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Criar Evento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
