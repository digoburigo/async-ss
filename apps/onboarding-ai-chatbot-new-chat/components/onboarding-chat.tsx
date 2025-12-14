"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Sparkles,
  Package,
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

type EmployeeType = "vendedor" | "gerente_estoque" | null

interface ChatSession {
  id: string
  title: string
  employee_type: string
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

function SessionsTableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3 border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-20 hidden md:block" />
          <Skeleton className="h-5 w-24 hidden sm:block" />
          <Skeleton className="h-8 w-8 ml-auto" />
        </div>
      ))}
    </div>
  )
}

function RoleCard({
  title,
  description,
  icon: Icon,
  isPrimary,
  isCreating,
  onClick,
}: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isPrimary: boolean
  isCreating: boolean
  onClick: () => void
}) {
  return (
    <Card
      className="p-6 md:p-8 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary group"
      onClick={onClick}
    >
      <div className="space-y-3 md:space-y-4">
        <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          <Icon className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl font-bold">{title}</h3>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">{description}</p>
        </div>
        <Button
          className={isPrimary ? "w-full" : "w-full bg-transparent"}
          size="lg"
          variant={isPrimary ? "default" : "outline"}
          disabled={isCreating}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa - {title}
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

export function OnboardingChat() {
  const router = useRouter()
  const [allChatSessions, setAllChatSessions] = useState<ChatSession[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [creatingRole, setCreatingRole] = useState<EmployeeType>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeletingChat, setIsDeletingChat] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUserId(user.id)
      }
    }

    getUser()
  }, [])

  const loadAllChatSessions = useCallback(
    async (page = 1, retryCount = 0) => {
      if (!currentUserId) return

      setIsLoadingSessions(true)
      setLoadError(null)

      try {
        const response = await fetch(`/api/chat-sessions/onboarding?page=${page}&limit=10`)

        if (!response.ok) {
          throw new Error("Falha ao carregar conversas")
        }

        const data = await response.json()

        if (data.sessions) {
          setAllChatSessions(data.sessions)
          setPagination(data.pagination)
          setCurrentPage(page)
        }
      } catch (error) {
        if (retryCount < 2) {
          setTimeout(() => loadAllChatSessions(page, retryCount + 1), 1000 * (retryCount + 1))
          return
        }
        setLoadError("Não foi possível carregar as conversas. Clique para tentar novamente.")
      } finally {
        setIsLoadingSessions(false)
      }
    },
    [currentUserId],
  )

  useEffect(() => {
    if (currentUserId) {
      loadAllChatSessions(1)
    }
  }, [currentUserId, loadAllChatSessions])

  const startNewChatWithRole = async (role: EmployeeType) => {
    if (isCreatingChat || !currentUserId || !role) return

    setIsCreatingChat(true)
    setCreatingRole(role)

    try {
      const response = await fetch("/api/chat-sessions/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeType: role,
          title: "Nova Conversa",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chat")
      }

      if (data.session) {
        toast.success("Nova conversa iniciada!")
        // Navigate to the chat using route
        router.push(`/onboarding-chat/${data.session.id}`)
      }
    } catch (error) {
      toast.error("Erro ao criar conversa. Tente novamente.")
    } finally {
      setIsCreatingChat(false)
      setCreatingRole(null)
    }
  }

  const selectExistingChat = (session: ChatSession) => {
    router.push(`/onboarding-chat/${session.id}`)
  }

  const confirmDeleteChat = (chatSessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirmId(chatSessionId)
  }

  const deleteChat = async () => {
    if (!deleteConfirmId) return

    const chatSessionId = deleteConfirmId
    setIsDeletingChat(true)

    const previousSessions = allChatSessions
    const updatedSessions = allChatSessions.filter((s) => s.id !== chatSessionId)
    setAllChatSessions(updatedSessions)
    setDeleteConfirmId(null)

    try {
      const response = await fetch(`/api/chat-sessions/onboarding?chatSessionId=${chatSessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir conversa")
      }

      toast.success("Conversa excluída com sucesso!")
      // Reload to update pagination
      loadAllChatSessions(currentPage)
    } catch (error) {
      setAllChatSessions(previousSessions)
      toast.error("Erro ao excluir conversa")
    } finally {
      setIsDeletingChat(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatEmployeeType = (type: string) => {
    const types: Record<string, string> = {
      vendedor: "Vendedor",
      gerente_estoque: "Gerente de Estoque",
    }
    return types[type] || type
  }

  const DeleteConfirmDialog = () => (
    <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Todas as mensagens desta conversa serão permanentemente excluídas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingChat}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteChat}
            disabled={isDeletingChat}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeletingChat ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  // Loading state for auth
  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-3 md:p-4">
        <div className="w-full max-w-4xl space-y-6 md:space-y-8">
          <div className="text-center space-y-3 md:space-y-4">
            <Skeleton className="h-8 w-24 mx-auto" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <Card className="p-4 md:p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <SessionsTableSkeleton />
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-3 md:p-4">
      <DeleteConfirmDialog />
      <div className="w-full max-w-4xl space-y-6 md:space-y-8">
        {loadError && (
          <Alert variant="destructive" className="cursor-pointer" onClick={() => loadAllChatSessions(currentPage)}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              {loadError}
              <RefreshCw className="h-4 w-4" />
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex items-center justify-center mb-4 md:mb-6">
            <div className="text-xl md:text-2xl font-bold">Farben</div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-balance">Bem-vindo à Farben</h2>
          <p className="text-base md:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto px-2">
            Estamos felizes em tê-lo em nossa equipe! Selecione sua função para começar o processo de integração
            personalizado.
          </p>
        </div>

        {/* Sessions Table */}
        {isLoadingSessions ? (
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-5" />
            </div>
            <SessionsTableSkeleton />
          </Card>
        ) : allChatSessions.length > 0 ? (
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-semibold">Suas Conversas de Integração</h3>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Função</TableHead>
                    <TableHead className="hidden sm:table-cell">Última Atualização</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allChatSessions.map((session) => (
                    <TableRow
                      key={session.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => selectExistingChat(session)}
                    >
                      <TableCell className="font-medium">{session.title}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                          {formatEmployeeType(session.employee_type)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {formatDate(session.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => confirmDeleteChat(session.id, e)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {allChatSessions.length} de {pagination.total} conversas
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAllChatSessions(currentPage - 1)}
                    disabled={currentPage === 1 || isLoadingSessions}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadAllChatSessions(currentPage + 1)}
                    disabled={!pagination.hasMore || isLoadingSessions}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : null}

        {/* Ou comece uma nova integração */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">
            {allChatSessions.length > 0 ? "Ou comece uma nova integração" : "Comece sua integração"}
          </h3>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <RoleCard
            title="Vendedor"
            description="Aprenda sobre nossos produtos, técnicas de venda, atendimento ao cliente e como ajudar nossos clientes a escolher as melhores tintas."
            icon={Sparkles}
            isPrimary={true}
            isCreating={isCreatingChat && creatingRole === "vendedor"}
            onClick={() => startNewChatWithRole("vendedor")}
          />
          <RoleCard
            title="Gerente de Estoque"
            description="Domine nosso sistema de inventário, processos de recebimento, organização de produtos e controle de qualidade."
            icon={Package}
            isPrimary={false}
            isCreating={isCreatingChat && creatingRole === "gerente_estoque"}
            onClick={() => startNewChatWithRole("gerente_estoque")}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-xs md:text-sm text-muted-foreground">Farben © 2025</p>
      </div>
    </div>
  )
}
