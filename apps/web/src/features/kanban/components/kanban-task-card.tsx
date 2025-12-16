import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import type { KanbanCard } from "@acme/zen-v3/zenstack/models";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import type { MouseEvent } from "react";

import type { ColumnWithCards } from "./kanban-provider";
import { useKanban } from "./kanban-provider";

type KanbanTaskCardProps = {
  card: KanbanCard;
  column?: ColumnWithCards;
};

export function KanbanTaskCard({ card, column }: KanbanTaskCardProps) {
  const { setOpen, setCurrentCard, setCurrentColumn } = useKanban();

  const handleDoubleClick = (e: MouseEvent) => {
    // Prevent drag from interfering with double-click
    e.stopPropagation();
    e.preventDefault();
    if (column) {
      setCurrentColumn(column);
    }
    setCurrentCard(card);
    setOpen("update-card");
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (column) {
      setCurrentColumn(column);
    }
    setCurrentCard(card);
    setOpen("update-card");
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (column) {
      setCurrentColumn(column);
    }
    setCurrentCard(card);
    setOpen("delete-card");
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      className="group relative z-0 rounded-md border bg-card p-3 shadow-xs transition-shadow hover:shadow-md"
      onDoubleClick={handleDoubleClick}
      style={{
        borderLeftColor: card.color || "#3b82f6",
        borderLeftWidth: "4px",
      }}
    >
      {/* Hover Actions - Absolutely positioned to avoid layout shifts */}
      <div className="absolute top-1.5 right-1.5 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          className="h-6 w-6 bg-background/80 backdrop-blur-sm"
          onClick={handleEdit}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          className="h-6 w-6 bg-background/80 text-destructive backdrop-blur-sm hover:text-destructive"
          onClick={handleDelete}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2 pr-12">
          <span className="line-clamp-2 font-medium text-sm">{card.title}</span>
          {card.dueDate && (
            <Badge
              className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[10px] tabular-nums"
              variant={isOverdue ? "destructive" : "secondary"}
            >
              {format(new Date(card.dueDate), "dd/MM", { locale: ptBR })}
            </Badge>
          )}
        </div>
        {card.description && (
          <p className="line-clamp-2 text-muted-foreground text-xs">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}
