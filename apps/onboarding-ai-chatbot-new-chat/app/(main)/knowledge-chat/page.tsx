"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, MessageSquare, Trash2, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function KnowledgeChatListPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/knowledge-conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    setIsCreating(true)
    try {
      const response = await fetch("/api/knowledge-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Conversa" }),
      })
      const data = await response.json()
      if (data.conversation) {
        router.push(`/knowledge-chat/${data.conversation.id}`)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Tem certeza que deseja excluir esta conversa?")) return

    try {
      await fetch(`/api/knowledge-conversations/${id}`, { method: "DELETE" })
      setConversations((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting conversation:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Base de Conhecimento</h1>
            <p className="text-sm text-muted-foreground">Minhas conversas com a IA</p>
          </div>
          <Button onClick={createNewConversation} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {conversations.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Nenhuma conversa ainda</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Crie sua primeira conversa para começar a fazer perguntas sobre a Farben
            </p>
            <Button onClick={createNewConversation} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Conversa
            </Button>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-3">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => router.push(`/knowledge-chat/${conversation.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{conversation.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Atualizado em {formatDate(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => deleteConversation(conversation.id, e)}
                    className="flex-shrink-0"
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
  )
}
