"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  Edit2,
  Map,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MindMap {
  id: string;
  title: string;
  description: string;
  nodes: unknown[];
  edges: unknown[];
  created_at: string;
  updated_at: string;
}

export default function MindMapsPage() {
  const router = useRouter();
  const [mindmaps, setMindmaps] = useState<MindMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMindmaps();
  }, []);

  const fetchMindmaps = async () => {
    try {
      const response = await fetch("/api/mindmaps");
      if (!response.ok) throw new Error("Failed to fetch mindmaps");
      const data = await response.json();
      setMindmaps(data);
    } catch (error) {
      console.error("Error fetching mindmaps:", error);
      toast.error("Erro ao carregar mapas mentais");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/mindmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create mindmap");

      const data = await response.json();
      toast.success("Mapa mental criado com sucesso!");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      router.push(`/mapas-mentais/${data.id}`);
    } catch (error) {
      console.error("Error creating mindmap:", error);
      toast.error("Erro ao criar mapa mental");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/mindmaps/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete mindmap");

      setMindmaps((prev) => prev.filter((m) => m.id !== deleteId));
      toast.success("Mapa mental excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting mindmap:", error);
      toast.error("Erro ao excluir mapa mental");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const filteredMindmaps = mindmaps.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-bold text-3xl">Mapas Mentais</h1>
          <p className="mt-1 text-muted-foreground">
            Visualize e organize os fluxos de trabalho da empresa
          </p>
        </div>
        <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Mapa Mental
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Mapa Mental</DialogTitle>
              <DialogDescription>
                Crie um novo mapa mental para visualizar fluxos de trabalho
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Fluxo de Onboarding"
                  value={newTitle}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descreva o propósito deste mapa mental..."
                  rows={3}
                  value={newDescription}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCreateOpen(false)} variant="outline">
                Cancelar
              </Button>
              <Button disabled={isCreating} onClick={handleCreate}>
                {isCreating ? "Criando..." : "Criar Mapa Mental"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar mapas mentais..."
            value={searchTerm}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card className="animate-pulse" key={i}>
              <CardHeader>
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMindmaps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Map className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              {searchTerm
                ? "Nenhum mapa mental encontrado"
                : "Nenhum mapa mental ainda"}
            </h3>
            <p className="mb-4 max-w-sm text-center text-muted-foreground">
              {searchTerm
                ? "Tente buscar por outro termo"
                : "Crie seu primeiro mapa mental para visualizar os fluxos de trabalho da empresa"}
            </p>
            {!searchTerm && (
              <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Criar Mapa Mental
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMindmaps.map((mindmap) => (
            <Card
              className="group cursor-pointer transition-shadow hover:shadow-md"
              key={mindmap.id}
              onClick={() => router.push(`/mapas-mentais/${mindmap.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-lg">
                      {mindmap.title}
                    </CardTitle>
                    {mindmap.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {mindmap.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/mapas-mentais/${mindmap.id}`);
                        }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(mindmap.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <Map className="h-4 w-4" />
                    <span>{mindmap.nodes?.length || 0} nós</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(mindmap.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog onOpenChange={() => setDeleteId(null)} open={!!deleteId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir mapa mental?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O mapa mental será
              permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
