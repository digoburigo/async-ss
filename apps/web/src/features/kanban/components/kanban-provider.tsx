import type {
  KanbanBoard,
  KanbanCard,
  KanbanColumn,
} from "@acme/zen-v3/zenstack/models";
import React, { useState } from "react";

import useDialogState from "~/hooks/use-dialog-state";

type KanbanDialogType =
  | "create-board"
  | "update-board"
  | "delete-board"
  | "create-column"
  | "update-column"
  | "delete-column"
  | "create-card"
  | "update-card"
  | "delete-card";

// Extended types for entities with relations
export type ColumnWithCards = KanbanColumn & {
  cards?: KanbanCard[];
};

export type BoardWithColumns = KanbanBoard & {
  columns: ColumnWithCards[];
};

type KanbanContextType = {
  open: KanbanDialogType | null;
  setOpen: (str: KanbanDialogType | null) => void;
  currentBoard: BoardWithColumns | null;
  setCurrentBoard: React.Dispatch<
    React.SetStateAction<BoardWithColumns | null>
  >;
  currentColumn: ColumnWithCards | null;
  setCurrentColumn: React.Dispatch<
    React.SetStateAction<ColumnWithCards | null>
  >;
  currentCard: KanbanCard | null;
  setCurrentCard: React.Dispatch<React.SetStateAction<KanbanCard | null>>;
};

const KanbanContext = React.createContext<KanbanContextType | null>(null);

export function KanbanProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<KanbanDialogType>(null);
  const [currentBoard, setCurrentBoard] = useState<BoardWithColumns | null>(
    null
  );
  const [currentColumn, setCurrentColumn] = useState<ColumnWithCards | null>(
    null
  );
  const [currentCard, setCurrentCard] = useState<KanbanCard | null>(null);

  return (
    <KanbanContext.Provider
      value={{
        open,
        setOpen,
        currentBoard,
        setCurrentBoard,
        currentColumn,
        setCurrentColumn,
        currentCard,
        setCurrentCard,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKanban = () => {
  const kanbanContext = React.useContext(KanbanContext);

  if (!kanbanContext) {
    throw new Error("useKanban has to be used within <KanbanProvider>");
  }

  return kanbanContext;
};
