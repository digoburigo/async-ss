import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/base-ui/dialog";
import type { CalendarEvent as EventCalendar } from "@acme/zen-v3/zenstack/models";

import { EventForm } from "./event-form";

interface EventDialogProps {
  event: Partial<EventCalendar> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<EventCalendar>) => void;
  onDelete: (eventId: string) => void;
}

export function EventDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventDialogProps) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {event?.id ? "Editar Evento" : "Criar Evento"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {event?.id
              ? "Edite os detalhes deste evento"
              : "Adicione um novo evento ao seu calendário"}
          </DialogDescription>
          <div className="overflow-y-auto px-6 py-4">
            <DialogDescription
              render={
                <EventForm
                  event={event}
                  onClose={onClose}
                  onDelete={onDelete}
                  onSave={onSave}
                />
              }
            />
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
