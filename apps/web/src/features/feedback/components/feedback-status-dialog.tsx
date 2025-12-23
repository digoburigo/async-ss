import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Field } from "@acme/ui/field";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { getStatusOption, statusOptions } from "../data/data";

interface FeedbackStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: CitizenFeedback | null;
}

export function FeedbackStatusDialog({
  open,
  onOpenChange,
  feedback,
}: FeedbackStatusDialogProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>(feedback?.status ?? "open");
  const [notes, setNotes] = useState("");

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async () => {
      if (!feedback) return;
      const { api } = await import("~/clients/api-client");
      const response = await (api.feedback as any)[":id"].status.post({
        params: { id: feedback.id },
        body: { status: status as any, notes: notes || undefined },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Status atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["citizenFeedback"] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
      onOpenChange(false);
      setNotes("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  if (!feedback) return null;

  const currentStatus = getStatusOption(feedback.status);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Status</DialogTitle>
          <DialogDescription>
            Altere o status do feedback{" "}
            <span className="font-mono">{feedback.referenceNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Status atual:</span>
            {currentStatus && (
              <Badge variant="outline">
                <span
                  className={`mr-1.5 h-2 w-2 rounded-full ${currentStatus.color}`}
                />
                {currentStatus.label}
              </Badge>
            )}
          </div>

          <Field>
            <Label>Novo Status</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <Label>Observacoes (opcional)</Label>
            <Textarea
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione uma observacao sobre a mudanca de status"
              rows={3}
              value={notes}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            disabled={isPending || status === feedback.status}
            onClick={() => updateStatus()}
          >
            {isPending ? "Atualizando..." : "Atualizar Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
