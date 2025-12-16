"use client";

import { Loader2, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function KnowledgeChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/knowledge-conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/knowledge-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Conversa" }),
      });
      const data = await response.json();
      if (data.conversation) {
        router.push(`/knowledge-chat/${data.conversation.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir esta conversa?")) return;

    try {
      await fetch(`/api/knowledge-conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-border border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-xl">Base de Conhecimento</h1>
            <p className="text-muted-foreground text-sm">
              Minhas conversas com a IA
            </p>
          </div>
          <Button disabled={isCreating} onClick={createNewConversation}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {conversations.length === 0 ? (
          <Card className="mx-auto max-w-md p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-semibold text-lg">
              Nenhuma conversa ainda
            </h2>
            <p className="mb-6 text-muted-foreground text-sm">
              Crie sua primeira conversa para começar a fazer perguntas sobre a
              Farben
            </p>
            <Button disabled={isCreating} onClick={createNewConversation}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Conversa
            </Button>
          </Card>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-3">
            {conversations.map((conversation) => (
              <Card
                className="cursor-pointer p-4 transition-colors hover:bg-accent"
                key={conversation.id}
                onClick={() =>
                  router.push(`/knowledge-chat/${conversation.id}`)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium">
                        {conversation.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Atualizado em {formatDate(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    className="flex-shrink-0"
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
