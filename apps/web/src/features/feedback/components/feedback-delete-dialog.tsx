import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

interface FeedbackDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: CitizenFeedback | null;
}

export function FeedbackDeleteDialog({
  open,
  onOpenChange,
  feedback,
}: FeedbackDeleteDialogProps) {
  const queryClient = useQueryClient();
  const client = useClientQueries(schema);

  const { mutate: deleteFeedback, isPending } =
    client.citizenFeedback.useDelete({
      onSuccess: () => {
        toast.success("Feedback excluido com sucesso");
        queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao excluir feedback");
      },
    });

  if (!feedback) return null;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Feedback</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o feedback{" "}
            <span className="font-medium font-mono">
              {feedback.referenceNumber}
            </span>
            ?
            <br />
            <span className="font-medium">{feedback.title}</span>
            <br />
            <br />
            Esta acao nao pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={() => deleteFeedback({ where: { id: feedback.id } })}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
