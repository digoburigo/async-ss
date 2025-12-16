import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@acme/ui/sheet";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { BoardForm } from "./board-form";
import { CardForm } from "./card-form";
import { ColumnForm } from "./column-form";
import { useKanban } from "./kanban-provider";

export function KanbanDialogs() {
  const {
    open,
    setOpen,
    currentBoard,
    setCurrentBoard,
    currentColumn,
    setCurrentColumn,
    currentCard,
    setCurrentCard,
  } = useKanban();
  const client = useClientQueries(schema);
  const { data: session } = authClient.useSession();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  // Board mutations with optimistic updates
  const { mutate: createBoard, isPending: isCreatingBoard } =
    client.kanbanBoard.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Quadro criado com sucesso");
        setOpen(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateBoard, isPending: isUpdatingBoard } =
    client.kanbanBoard.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Quadro atualizado com sucesso");
        setOpen(null);
        setTimeout(() => {
          setCurrentBoard(null);
        }, 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutateAsync: deleteBoard } = client.kanbanBoard.useDelete({
    optimisticUpdate: true,
    onSuccess: () => {
      toast.success("Quadro excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Column mutations with optimistic updates
  const { mutate: createColumn, isPending: isCreatingColumn } =
    client.kanbanColumn.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Coluna criada com sucesso");
        setOpen(null);
        setTimeout(() => {
          setCurrentColumn(null);
        }, 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateColumn, isPending: isUpdatingColumn } =
    client.kanbanColumn.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Coluna atualizada com sucesso");
        setOpen(null);
        setTimeout(() => {
          setCurrentColumn(null);
        }, 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutateAsync: deleteColumn } = client.kanbanColumn.useDelete({
    optimisticUpdate: true,
    onSuccess: () => {
      toast.success("Coluna excluída com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Card mutations with optimistic updates
  const { mutate: createCard, isPending: isCreatingCard } =
    client.kanbanCard.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Card criado com sucesso");
        setOpen(null);
        setTimeout(() => {
          setCurrentCard(null);
        }, 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateCard, isPending: isUpdatingCard } =
    client.kanbanCard.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Card atualizado com sucesso");
        setOpen(null);
        setTimeout(() => {
          setCurrentCard(null);
        }, 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // Soft delete for cards - uses update to set deletedAt
  const { mutateAsync: softDeleteCard } = client.kanbanCard.useUpdate({
    optimisticUpdate: true,
    onSuccess: () => {
      toast.success("Card excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Board handlers
  const handleBoardSubmit = async (data: {
    title: string;
    description?: string;
  }) => {
    if (!(session?.user?.id && activeOrganization?.id)) {
      toast.error("Por favor, faça login e selecione uma organização");
      return;
    }

    if (currentBoard) {
      updateBoard({
        data: {
          title: data.title,
          description: data.description || null,
        },
        where: { id: currentBoard.id },
      });
    } else {
      createBoard({
        data: {
          title: data.title,
          description: data.description || null,
          userId: session.user.id,
        },
      });
    }
  };

  const handleDeleteBoard = async () => {
    if (!currentBoard) return;
    await deleteBoard({ where: { id: currentBoard.id } });
    setOpen(null);
    setTimeout(() => {
      setCurrentBoard(null);
    }, 500);
  };

  // Column handlers
  const handleColumnSubmit = async (data: { title: string }) => {
    if (!currentBoard) {
      toast.error("Quadro não encontrado");
      return;
    }

    // Get max position for new columns
    const maxPosition = currentBoard.columns
      ? Math.max(...currentBoard.columns.map((col) => col.position), -1) + 1
      : 0;

    if (currentColumn) {
      updateColumn({
        data: {
          title: data.title,
        },
        where: { id: currentColumn.id },
      });
    } else {
      createColumn({
        data: {
          title: data.title,
          boardId: currentBoard.id,
          position: maxPosition,
        },
      });
    }
  };

  const handleDeleteColumn = async () => {
    if (!currentColumn) return;
    await deleteColumn({ where: { id: currentColumn.id } });
    setOpen(null);
    setTimeout(() => {
      setCurrentColumn(null);
    }, 500);
  };

  // Card handlers
  const handleCardSubmit = async (data: {
    title: string;
    description?: string;
    color?: string;
    dueDate?: Date;
  }) => {
    if (!currentColumn) {
      toast.error("Coluna não encontrada");
      return;
    }

    // Get max position for new cards - handle empty/undefined cards array
    const cards = currentColumn.cards ?? [];
    const maxPosition =
      cards.length > 0
        ? Math.max(...cards.map((card) => card.position)) + 1
        : 0;

    if (currentCard) {
      updateCard({
        data: {
          title: data.title,
          description: data.description || null,
          color: data.color || "#3b82f6",
          dueDate: data.dueDate || null,
        },
        where: { id: currentCard.id },
      });
    } else {
      createCard({
        data: {
          title: data.title,
          description: data.description || null,
          color: data.color || "#3b82f6",
          dueDate: data.dueDate || null,
          columnId: currentColumn.id,
          position: maxPosition,
        },
      });
    }
  };

  const handleDeleteCard = async () => {
    if (!(currentCard && session?.user?.id)) return;
    // Soft delete - set deletedAt timestamp instead of actually deleting
    await softDeleteCard({
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
      where: { id: currentCard.id },
    });
    setOpen(null);
    setTimeout(() => {
      setCurrentCard(null);
    }, 500);
  };

  return (
    <>
      {/* Board Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            if (!currentBoard) {
              setTimeout(() => {
                setCurrentBoard(null);
              }, 500);
            }
          }
        }}
        open={open === "create-board" || open === "update-board"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{currentBoard ? "Editar" : "Criar"} Quadro</SheetTitle>
            <SheetDescription>
              {currentBoard
                ? "Atualize as informações do quadro."
                : "Adicione um novo quadro preenchendo as informações abaixo."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <BoardForm
              defaultValues={
                currentBoard
                  ? {
                      title: currentBoard.title,
                      description: currentBoard.description ?? undefined,
                    }
                  : undefined
              }
              isSubmitting={isCreatingBoard || isUpdatingBoard}
              onSubmit={handleBoardSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentBoard && (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir o quadro{" "}
              <strong>{currentBoard.title}</strong>. <br />
              Esta ação não pode ser desfeita e excluirá todas as colunas e
              cards associados.
            </>
          }
          destructive
          handleConfirm={handleDeleteBoard}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => {
                setCurrentBoard(null);
              }, 500);
            }
          }}
          open={open === "delete-board"}
          title={`Excluir quadro: ${currentBoard.title}?`}
        />
      )}

      {/* Column Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            setTimeout(() => {
              setCurrentColumn(null);
            }, 500);
          }
        }}
        open={open === "create-column" || open === "update-column"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{currentColumn ? "Editar" : "Criar"} Coluna</SheetTitle>
            <SheetDescription>
              {currentColumn
                ? "Atualize o nome da coluna."
                : "Adicione uma nova coluna ao quadro."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <ColumnForm
              defaultValues={
                currentColumn
                  ? {
                      title: currentColumn.title,
                    }
                  : undefined
              }
              isSubmitting={isCreatingColumn || isUpdatingColumn}
              onSubmit={handleColumnSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentColumn && (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir a coluna{" "}
              <strong>{currentColumn.title}</strong>. <br />
              Esta ação não pode ser desfeita e excluirá todos os cards
              associados.
            </>
          }
          destructive
          handleConfirm={handleDeleteColumn}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => {
                setCurrentColumn(null);
              }, 500);
            }
          }}
          open={open === "delete-column"}
          title={`Excluir coluna: ${currentColumn.title}?`}
        />
      )}

      {/* Card Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            setTimeout(() => {
              setCurrentCard(null);
            }, 500);
          }
        }}
        open={open === "create-card" || open === "update-card"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{currentCard ? "Editar" : "Criar"} Card</SheetTitle>
            <SheetDescription>
              {currentCard
                ? "Atualize as informações do card."
                : "Adicione um novo card à coluna."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <CardForm
              defaultValues={
                currentCard
                  ? {
                      title: currentCard.title,
                      description: currentCard.description ?? undefined,
                      color: currentCard.color ?? undefined,
                      dueDate: currentCard.dueDate
                        ? new Date(currentCard.dueDate)
                        : undefined,
                    }
                  : undefined
              }
              isSubmitting={isCreatingCard || isUpdatingCard}
              onSubmit={handleCardSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentCard && (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir o card{" "}
              <strong>{currentCard.title}</strong>. <br />O card será movido
              para a lixeira e não aparecerá mais no quadro.
            </>
          }
          destructive
          handleConfirm={handleDeleteCard}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => {
                setCurrentCard(null);
              }, 500);
            }
          }}
          open={open === "delete-card"}
          title={`Excluir card: ${currentCard.title}?`}
        />
      )}
    </>
  );
}
