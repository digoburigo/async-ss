"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";

type EmployeeType = "vendedor" | "gerente_estoque" | null;

interface ChatSession {
  id: string;
  title: string;
  employee_type: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

function SessionsTableSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div className="flex items-center gap-4 border-b p-3" key={i}>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="hidden h-5 w-20 md:block" />
          <Skeleton className="hidden h-5 w-24 sm:block" />
          <Skeleton className="ml-auto h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

function RoleCard({
  title,
  description,
  icon: Icon,
  isPrimary,
  isCreating,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary: boolean;
  isCreating: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer border-2 p-6 transition-all hover:border-primary hover:shadow-lg md:p-8"
      onClick={onClick}
    >
      <div className="space-y-3 md:space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 transition-colors group-hover:bg-primary/30 md:h-16 md:w-16">
          <Icon className="h-6 w-6 text-primary-foreground md:h-8 md:w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-xl md:text-2xl">{title}</h3>
          <p className="text-pretty text-muted-foreground text-sm md:text-base">
            {description}
          </p>
        </div>
        <Button
          className={isPrimary ? "w-full" : "w-full bg-transparent"}
          disabled={isCreating}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          size="lg"
          variant={isPrimary ? "default" : "outline"}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conversa - {title}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

export function OnboardingChat() {
  const router = useRouter();
  const [allChatSessions, setAllChatSessions] = useState<ChatSession[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [creatingRole, setCreatingRole] = useState<EmployeeType>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
      }
    }

    getUser();
  }, []);

  const loadAllChatSessions = useCallback(
    async (page = 1, retryCount = 0) => {
      if (!currentUserId) return;

      setIsLoadingSessions(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/chat-sessions/onboarding?page=${page}&limit=10`
        );

        if (!response.ok) {
          throw new Error("Falha ao carregar conversas");
        }

        const data = await response.json();

        if (data.sessions) {
          setAllChatSessions(data.sessions);
          setPagination(data.pagination);
          setCurrentPage(page);
        }
      } catch (error) {
        if (retryCount < 2) {
          setTimeout(
            () => loadAllChatSessions(page, retryCount + 1),
            1000 * (retryCount + 1)
          );
          return;
        }
        setLoadError(
          "Não foi possível carregar as conversas. Clique para tentar novamente."
        );
      } finally {
        setIsLoadingSessions(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    if (currentUserId) {
      loadAllChatSessions(1);
    }
  }, [currentUserId, loadAllChatSessions]);

  const startNewChatWithRole = async (role: EmployeeType) => {
    if (isCreatingChat || !currentUserId || !role) return;

    setIsCreatingChat(true);
    setCreatingRole(role);

    try {
      const response = await fetch("/api/chat-sessions/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeType: role,
          title: "Nova Conversa",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chat");
      }

      if (data.session) {
        toast.success("Nova conversa iniciada!");
        // Navigate to the chat using route
        router.push(`/onboarding-chat/${data.session.id}`);
      }
    } catch (error) {
      toast.error("Erro ao criar conversa. Tente novamente.");
    } finally {
      setIsCreatingChat(false);
      setCreatingRole(null);
    }
  };

  const selectExistingChat = (session: ChatSession) => {
    router.push(`/onboarding-chat/${session.id}`);
  };

  const confirmDeleteChat = (chatSessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(chatSessionId);
  };

  const deleteChat = async () => {
    if (!deleteConfirmId) return;

    const chatSessionId = deleteConfirmId;
    setIsDeletingChat(true);

    const previousSessions = allChatSessions;
    const updatedSessions = allChatSessions.filter(
      (s) => s.id !== chatSessionId
    );
    setAllChatSessions(updatedSessions);
    setDeleteConfirmId(null);

    try {
      const response = await fetch(
        `/api/chat-sessions/onboarding?chatSessionId=${chatSessionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao excluir conversa");
      }

      toast.success("Conversa excluída com sucesso!");
      // Reload to update pagination
      loadAllChatSessions(currentPage);
    } catch (error) {
      setAllChatSessions(previousSessions);
      toast.error("Erro ao excluir conversa");
    } finally {
      setIsDeletingChat(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatEmployeeType = (type: string) => {
    const types: Record<string, string> = {
      vendedor: "Vendedor",
      gerente_estoque: "Gerente de Estoque",
    };
    return types[type] || type;
  };

  const DeleteConfirmDialog = () => (
    <AlertDialog
      onOpenChange={() => setDeleteConfirmId(null)}
      open={!!deleteConfirmId}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Todas as mensagens desta conversa
            serão permanentemente excluídas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeletingChat}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeletingChat}
            onClick={deleteChat}
          >
            {isDeletingChat ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Loading state for auth
  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-3 md:p-4">
        <div className="w-full max-w-4xl space-y-6 md:space-y-8">
          <div className="space-y-3 text-center md:space-y-4">
            <Skeleton className="mx-auto h-8 w-24" />
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto h-6 w-96" />
          </div>
          <Card className="p-4 md:p-6">
            <Skeleton className="mb-4 h-6 w-48" />
            <SessionsTableSkeleton />
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted p-3 md:p-4">
      <DeleteConfirmDialog />
      <div className="w-full max-w-4xl space-y-6 md:space-y-8">
        {loadError && (
          <Alert
            className="cursor-pointer"
            onClick={() => loadAllChatSessions(currentPage)}
            variant="destructive"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar</AlertTitle>
            <AlertDescription className="flex items-center gap-2">
              {loadError}
              <RefreshCw className="h-4 w-4" />
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="space-y-3 text-center md:space-y-4">
          <div className="mb-4 flex items-center justify-center md:mb-6">
            <div className="font-bold text-xl md:text-2xl">Farben</div>
          </div>
          <h2 className="text-balance font-bold text-2xl md:text-3xl">
            Bem-vindo à Farben
          </h2>
          <p className="mx-auto max-w-2xl text-pretty px-2 text-base text-muted-foreground md:text-lg">
            Estamos felizes em tê-lo em nossa equipe! Selecione sua função para
            começar o processo de integração personalizado.
          </p>
        </div>

        {/* Sessions Table */}
        {isLoadingSessions ? (
          <Card className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-5" />
            </div>
            <SessionsTableSkeleton />
          </Card>
        ) : allChatSessions.length > 0 ? (
          <Card className="p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg md:text-xl">
                Suas Conversas de Integração
              </h3>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Função
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Última Atualização
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allChatSessions.map((session) => (
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      key={session.id}
                      onClick={() => selectExistingChat(session)}
                    >
                      <TableCell className="font-medium">
                        {session.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
                          {formatEmployeeType(session.employee_type)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground text-sm sm:table-cell">
                        {formatDate(session.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          className="h-8 w-8"
                          onClick={(e) => confirmDeleteChat(session.id, e)}
                          size="icon"
                          variant="ghost"
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
              <div className="mt-4 flex items-center justify-between px-2">
                <p className="text-muted-foreground text-sm">
                  Mostrando {allChatSessions.length} de {pagination.total}{" "}
                  conversas
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={currentPage === 1 || isLoadingSessions}
                    onClick={() => loadAllChatSessions(currentPage - 1)}
                    size="sm"
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    disabled={!pagination.hasMore || isLoadingSessions}
                    onClick={() => loadAllChatSessions(currentPage + 1)}
                    size="sm"
                    variant="outline"
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
          <h3 className="mb-4 font-semibold text-lg">
            {allChatSessions.length > 0
              ? "Ou comece uma nova integração"
              : "Comece sua integração"}
          </h3>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <RoleCard
            description="Aprenda sobre nossos produtos, técnicas de venda, atendimento ao cliente e como ajudar nossos clientes a escolher as melhores tintas."
            icon={Sparkles}
            isCreating={isCreatingChat && creatingRole === "vendedor"}
            isPrimary={true}
            onClick={() => startNewChatWithRole("vendedor")}
            title="Vendedor"
          />
          <RoleCard
            description="Domine nosso sistema de inventário, processos de recebimento, organização de produtos e controle de qualidade."
            icon={Package}
            isCreating={isCreatingChat && creatingRole === "gerente_estoque"}
            isPrimary={false}
            onClick={() => startNewChatWithRole("gerente_estoque")}
            title="Gerente de Estoque"
          />
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs md:text-sm">
          Farben © 2025
        </p>
      </div>
    </div>
  );
}
