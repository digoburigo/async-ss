import { FeedbackDeleteDialog } from "./feedback-delete-dialog";
import { FeedbackMutateDrawer } from "./feedback-mutate-drawer";
import { useFeedback } from "./feedback-provider";
import { FeedbackStatusDialog } from "./feedback-status-dialog";
import { FeedbackViewDialog } from "./feedback-view-dialog";

export function FeedbackDialogs() {
  const { open, setOpen, currentRow } = useFeedback();

  return (
    <>
      <FeedbackMutateDrawer
        currentRow={open === "update" ? currentRow : undefined}
        onOpenChange={(isOpen) => setOpen(isOpen ? "create" : null)}
        open={open === "create" || open === "update"}
      />

      <FeedbackViewDialog
        feedback={currentRow}
        onOpenChange={(isOpen) => setOpen(isOpen ? "view" : null)}
        open={open === "view"}
      />

      <FeedbackStatusDialog
        feedback={currentRow}
        onOpenChange={(isOpen) => setOpen(isOpen ? "status" : null)}
        open={open === "status"}
      />

      <FeedbackDeleteDialog
        feedback={currentRow}
        onOpenChange={(isOpen) => setOpen(isOpen ? "delete" : null)}
        open={open === "delete"}
      />
    </>
  );
}
