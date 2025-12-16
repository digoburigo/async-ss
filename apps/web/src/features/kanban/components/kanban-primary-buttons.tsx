import { Button } from "@acme/ui/button";
import { Plus } from "lucide-react";

import { useKanban } from "./kanban-provider";

export function KanbanPrimaryButtons() {
  const { setOpen } = useKanban();

  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => setOpen("create-board")}>
        <span>Criar Quadro</span> <Plus size={18} />
      </Button>
    </div>
  );
}
