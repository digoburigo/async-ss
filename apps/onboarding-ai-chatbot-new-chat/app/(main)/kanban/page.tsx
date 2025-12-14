"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, AlertCircle, Trash2, LayoutGrid, Calendar, MoreHorizontal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface KanbanBoard {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
}

export default function KanbanListPage() {
  const [boards, setBoards] = useState<KanbanBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "" })
  const { toast } = useToast()
  const router = useRouter()

  const loadBoards = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/kanban/boards")
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao carregar quadros")
        return
      }

      setBoards(data.boards || [])
    } catch (err) {
      console.error("Error loading boards:", err)
      setError("Erro ao carregar quadros. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBoards()
  }, [loadBoards])

  const handleCreateBoard = async () => {
    if (!formData.title.trim()) return

    setSaving(true)
    try {
      const response = await fetch("/api/kanban/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao criar quadro",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Quadro criado com sucesso!",
      })

      setShowCreateDialog(false)
      setFormData({ title: "", description: "" })

      // Navigate to the new board
      router.push(`/kanban/${data.board.id}`)
    } catch (err) {
      console.error("Error creating board:", err)
      toast({
        title: "Erro",
        description: "Erro ao criar quadro.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBoard = async (boardId: string, boardTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o quadro "${boardTitle}"? Esta ação não pode ser desfeita.`)) return

    try {
      const response = await fetch(`/api/kanban/boards/${boardId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao excluir quadro",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Quadro excluído!",
      })

      loadBoards()
    } catch (err) {
      console.error("Error deleting board:", err)
      toast({
        title: "Erro",
        description: "Erro ao excluir quadro.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando quadros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Meus Quadros Kanban</h1>
            <p className="text-muted-foreground mt-1">Gerencie seus projetos com quadros Kanban</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Quadro
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <LayoutGrid className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum quadro ainda</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Crie seu primeiro quadro Kanban para começar a organizar suas tarefas e projetos.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Quadro
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Card
                key={board.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/kanban/${board.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{board.title}</CardTitle>
                      {board.description && (
                        <CardDescription className="mt-1 line-clamp-2">{board.description}</CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteBoard(board.id, board.title)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(board.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Board Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Quadro Kanban</DialogTitle>
              <DialogDescription>
                Crie um novo quadro para organizar suas tarefas. O quadro já virá com 3 colunas padrão: A fazer, Fazendo
                e Finalizado.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Projeto Website"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo deste quadro..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateBoard} disabled={saving || !formData.title.trim()}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Criar Quadro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
