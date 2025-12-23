import { Button } from "@acme/ui/button";
import { Plus } from "lucide-react";

import { useFeedback } from "./feedback-provider";

export function FeedbackPrimaryButtons() {
  const { setOpen } = useFeedback();

  return (
    <div className="flex gap-2">
      <Button onClick={() => setOpen("create")}>
        <Plus className="mr-2 h-4 w-4" />
        Novo Feedback
      </Button>
    </div>
  );
}
