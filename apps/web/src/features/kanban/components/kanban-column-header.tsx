import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { MoreVertical, Plus, Trash2 } from "lucide-react";

import type { ColumnWithCards } from "./kanban-provider";
import { useKanban } from "./kanban-provider";

type KanbanColumnHeaderProps = {
  column: ColumnWithCards;
};

export function KanbanColumnHeader({ column }: KanbanColumnHeaderProps) {
  const { setOpen, setCurrentColumn } = useKanban();

  const handleAddCard = () => {
    setCurrentColumn(column);
    setOpen("create-card");
  };

  const handleEdit = () => {
    setCurrentColumn(column);
    setOpen("update-column");
  };

  const handleDelete = () => {
    setCurrentColumn(column);
    setOpen("delete-column");
  };

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <h3 className="font-semibold text-sm">{column.title}</h3>
      <div className="flex items-center gap-1">
        <Button
          className="h-7 w-7 p-0"
          onClick={handleAddCard}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="h-7 w-7 p-0"
              size="sm"
              type="button"
              variant="ghost"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>Renomear</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
