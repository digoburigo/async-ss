"use client";

import {
  AlertCircle,
  ArrowLeft,
  Edit,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface KanbanCard {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  color: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface KanbanColumn {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
  cards: KanbanCard[];
}

interface KanbanBoard {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const COLORS = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Laranja" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
];

export default function KanbanBoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [cardFormData, setCardFormData] = useState({
    title: "",
    description: "",
    color: "#3b82f6",
    dueDate: "",
  });
  const [columnFormData, setColumnFormData] = useState({
    title: "",
  });

  const loadBoard = useCallback(async () => {
    try {
      const response = await fetch(`/api/kanban/boards/${boardId}`);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError("Quadro não encontrado");
          return;
        }
        setError(data.error || "Erro ao carregar quadro");
        return;
      }

      setBoard(data.board);
    } catch (err) {
      console.error("Error loading board:", err);
      setError("Erro ao carregar quadro.");
    }
  }, [boardId]);

  const loadColumns = useCallback(async () => {
    if (!boardId) return;

    try {
      const columnsResponse = await fetch(
        `/api/kanban/columns?boardId=${boardId}`
      );
      const columnsData = await columnsResponse.json();

      if (!columnsResponse.ok) {
        setError(columnsData.error || "Erro ao carregar colunas");
        return;
      }

      const cardsResponse = await fetch(`/api/kanban/cards?boardId=${boardId}`);
      const cardsData = await cardsResponse.json();

      if (!cardsResponse.ok) {
        setError(cardsData.error || "Erro ao carregar cartões");
        return;
      }

      const columnsWithCards = (columnsData.columns || [])
        .sort((a: KanbanColumn, b: KanbanColumn) => a.position - b.position)
        .map((column: KanbanColumn) => ({
          ...column,
          cards: (cardsData.cards || [])
            .filter((card: KanbanCard) => card.column_id === column.id)
            .sort((a: KanbanCard, b: KanbanCard) => a.position - b.position),
        }));

      setColumns(columnsWithCards);
    } catch (err) {
      console.error("Error loading columns:", err);
      setError("Erro ao carregar colunas.");
    }
  }, [boardId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadBoard();
      await loadColumns();
      setLoading(false);
    };
    loadData();
  }, [loadBoard, loadColumns]);

  const handleCreateCard = (columnId: string) => {
    setEditingCard(null);
    setSelectedColumnId(columnId);
    setCardFormData({
      title: "",
      description: "",
      color: "#3b82f6",
      dueDate: "",
    });
    setShowCardDialog(true);
  };

  const handleEditCard = (card: KanbanCard) => {
    setEditingCard(card);
    setSelectedColumnId(card.column_id);
    setCardFormData({
      title: card.title,
      description: card.description || "",
      color: card.color,
      dueDate: card.due_date
        ? new Date(card.due_date).toISOString().slice(0, 10)
        : "",
    });
    setShowCardDialog(true);
  };

  const handleSaveCard = async () => {
    if (!(selectedColumnId && cardFormData.title.trim())) return;

    setSaving(true);
    try {
      const url = "/api/kanban/cards";
      const method = editingCard ? "PATCH" : "POST";

      const body = editingCard
        ? {
            id: editingCard.id,
            title: cardFormData.title,
            description: cardFormData.description || null,
            color: cardFormData.color,
            dueDate: cardFormData.dueDate || null,
          }
        : {
            columnId: selectedColumnId,
            title: cardFormData.title,
            description: cardFormData.description || null,
            color: cardFormData.color,
            dueDate: cardFormData.dueDate || null,
            position:
              columns.find((col) => col.id === selectedColumnId)?.cards
                .length || 0,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao salvar cartão",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: editingCard ? "Cartão atualizado!" : "Cartão criado!",
      });

      setShowCardDialog(false);
      loadColumns();
    } catch (err) {
      console.error("Error saving card:", err);
      toast({
        title: "Erro",
        description: "Erro ao salvar cartão.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cartão?")) return;

    try {
      const response = await fetch(`/api/kanban/cards?id=${cardId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao excluir cartão",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Cartão excluído!",
      });

      loadColumns();
    } catch (err) {
      console.error("Error deleting card:", err);
      toast({
        title: "Erro",
        description: "Erro ao excluir cartão.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    if (column.cards.length > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Mova ou exclua os cartões desta coluna primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`))
      return;

    try {
      const response = await fetch(`/api/kanban/columns?id=${columnId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao excluir coluna",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Coluna excluída!",
      });

      loadColumns();
    } catch (err) {
      console.error("Error deleting column:", err);
      toast({
        title: "Erro",
        description: "Erro ao excluir coluna.",
        variant: "destructive",
      });
    }
  };

  const handleCreateColumn = () => {
    setColumnFormData({ title: "" });
    setShowColumnDialog(true);
  };

  const handleSaveColumn = async () => {
    if (!(boardId && columnFormData.title.trim())) return;

    setSaving(true);
    try {
      const response = await fetch("/api/kanban/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId,
          title: columnFormData.title,
          position: columns.length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao criar coluna",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Coluna criada!",
      });

      setShowColumnDialog(false);
      loadColumns();
    } catch (err) {
      console.error("Error creating column:", err);
      toast({
        title: "Erro",
        description: "Erro ao criar coluna.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, card: KanbanCard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.target as HTMLElement;
    element.style.opacity = "1";
    setDraggedCard(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumnId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumnId(null);

    if (!draggedCard) return;

    if (draggedCard.column_id === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    const sourceColumnId = draggedCard.column_id;
    const newPosition =
      columns.find((col) => col.id === targetColumnId)?.cards.length || 0;

    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.filter((c) => c.id !== draggedCard.id),
          };
        }
        if (col.id === targetColumnId) {
          return {
            ...col,
            cards: [
              ...col.cards,
              {
                ...draggedCard,
                column_id: targetColumnId,
                position: newPosition,
              },
            ],
          };
        }
        return col;
      })
    );

    setDraggedCard(null);

    try {
      const response = await fetch("/api/kanban/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draggedCard.id,
          columnId: targetColumnId,
          position: newPosition,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro ao mover cartão",
          description: data.details || data.error || "Tente novamente",
          variant: "destructive",
        });
        loadColumns();
        return;
      }

      toast({
        title: "Cartão movido",
        description: "Cartão movido com sucesso!",
      });
    } catch (err) {
      console.error("Error moving card:", err);
      toast({
        title: "Erro",
        description: "Erro ao mover cartão. Recarregando...",
        variant: "destructive",
      });
      loadColumns();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando quadro...</p>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <span>{error || "Quadro não encontrado"}</span>
              <Button
                asChild
                className="w-fit bg-transparent"
                size="sm"
                variant="outline"
              >
                <Link href="/kanban">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Quadros
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild size="icon" variant="ghost">
              <Link href="/kanban">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-bold text-3xl md:text-4xl">{board.title}</h1>
              {board.description && (
                <p className="mt-1 text-muted-foreground">
                  {board.description}
                </p>
              )}
            </div>
          </div>
          <Button onClick={handleCreateColumn} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nova Coluna
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="flex h-[calc(100vh-200px)] gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              className={cn(
                "w-80 flex-shrink-0 transition-all duration-200",
                dragOverColumnId === column.id && "scale-[1.02]"
              )}
              key={column.id}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <Card
                className={cn(
                  "flex flex-col p-4 transition-colors duration-200",
                  dragOverColumnId === column.id &&
                    "bg-primary/5 ring-2 ring-primary"
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-sm">
                      {column.cards.length}
                    </span>
                    <Button
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteColumn(column.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {column.cards.map((card) => (
                    <Card
                      className={cn(
                        "cursor-grab p-3 transition-all duration-200 hover:shadow-md active:cursor-grabbing",
                        draggedCard?.id === card.id && "scale-95 opacity-50"
                      )}
                      draggable
                      key={card.id}
                      onDragEnd={handleDragEnd}
                      onDragStart={(e) => handleDragStart(e, card)}
                      style={{ borderLeft: `4px solid ${card.color}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 truncate font-medium text-sm">
                            {card.title}
                          </h4>
                          {card.description && (
                            <p className="line-clamp-2 text-muted-foreground text-xs">
                              {card.description}
                            </p>
                          )}
                          {card.due_date && (
                            <p className="mt-2 text-muted-foreground text-xs">
                              Prazo:{" "}
                              {new Date(card.due_date).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            className="h-6 w-6"
                            onClick={() => handleEditCard(card)}
                            size="icon"
                            variant="ghost"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDeleteCard(card.id)}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {draggedCard &&
                    dragOverColumnId === column.id &&
                    draggedCard.column_id !== column.id && (
                      <div className="rounded-lg border-2 border-primary/50 border-dashed bg-primary/5 p-4 text-center text-muted-foreground text-sm">
                        Solte aqui
                      </div>
                    )}
                </div>

                <Button
                  className="mt-4 w-full"
                  onClick={() => handleCreateCard(column.id)}
                  variant="ghost"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cartão
                </Button>
              </Card>
            </div>
          ))}

          {columns.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">
                  Este quadro ainda não tem colunas
                </p>
                <Button onClick={handleCreateColumn}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Coluna
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Card Dialog */}
        <Dialog onOpenChange={setShowCardDialog} open={showCardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Editar Cartão" : "Novo Cartão"}
              </DialogTitle>
              <DialogDescription>
                {editingCard
                  ? "Atualize as informações do cartão"
                  : "Adicione um novo cartão à coluna"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cardTitle">Título</Label>
                <Input
                  id="cardTitle"
                  onChange={(e) =>
                    setCardFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Título do cartão"
                  value={cardFormData.title}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardDescription">Descrição</Label>
                <Textarea
                  id="cardDescription"
                  onChange={(e) =>
                    setCardFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Descrição do cartão"
                  rows={3}
                  value={cardFormData.description}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        cardFormData.color === color.value
                          ? "scale-110 border-foreground"
                          : "border-transparent"
                      )}
                      key={color.value}
                      onClick={() =>
                        setCardFormData((prev) => ({
                          ...prev,
                          color: color.value,
                        }))
                      }
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                      type="button"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardDueDate">Data de Prazo</Label>
                <Input
                  id="cardDueDate"
                  onChange={(e) =>
                    setCardFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  type="date"
                  value={cardFormData.dueDate}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowCardDialog(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={saving || !cardFormData.title.trim()}
                onClick={handleSaveCard}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingCard ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Column Dialog */}
        <Dialog onOpenChange={setShowColumnDialog} open={showColumnDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Coluna</DialogTitle>
              <DialogDescription>
                Adicione uma nova coluna ao quadro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="columnTitle">Título</Label>
                <Input
                  id="columnTitle"
                  onChange={(e) =>
                    setColumnFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Ex: Em Revisão"
                  value={columnFormData.title}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowColumnDialog(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                disabled={saving || !columnFormData.title.trim()}
                onClick={handleSaveColumn}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Criar Coluna
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
