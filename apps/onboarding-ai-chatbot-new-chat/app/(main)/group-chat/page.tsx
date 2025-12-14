"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Users, X, Loader2, Bot } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface GroupMessage {
  id: string
  user_name: string
  message: string
  created_at: string
  user_id: string
  message_type?: "user" | "ai" | "system"
  parent_message_id?: string
}

export default function GroupChatPage() {
  const [message, setMessage] = useState("")
  const [showUsers, setShowUsers] = useState(false)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAiResponding, setIsAiResponding] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastLoadedCountRef = useRef(0)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUserId(user.id)
        setCurrentUserName(user.user_metadata?.name || user.email?.split("@")[0] || "Usuário")
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch("/api/chat-history/group?limit=50")
        const data = await response.json()
        if (data.messages) {
          // Only update if message count changed to prevent unnecessary re-renders
          if (data.messages.length !== lastLoadedCountRef.current) {
            setMessages(data.messages)
            lastLoadedCountRef.current = data.messages.length
            console.log("[v0] Loaded", data.messages.length, "group messages")
          }
        }
      } catch (error) {
        console.error("[v0] Error loading messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()

    const interval = setInterval(loadMessages, 5000) // Changed from 3000 to 5000ms
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isAiResponding || !currentUserId) return

    const messageText = message.trim()
    const isAiMention = messageText.startsWith("@")
    const actualMessage = isAiMention ? messageText.slice(1).trim() : messageText

    setMessage("")

    try {
      console.log("[v0] Sending message:", actualMessage)
      const response = await fetch("/api/chat-history/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: actualMessage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.message) {
          setMessages((prev) => [...prev, data.message])

          if (isAiMention) {
            setIsAiResponding(true)
            console.log("[v0] Requesting AI response")
            try {
              const aiResponse = await fetch("/api/group-chat-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: actualMessage,
                  parentMessageId: data.message.id,
                }),
              })

              if (aiResponse.ok) {
                const aiData = await aiResponse.json()
                if (aiData.message) {
                  setMessages((prev) => [...prev, aiData.message])
                  console.log("[v0] AI response received")
                }
              }
            } catch (error) {
              console.error("[v0] Error getting AI response:", error)
            } finally {
              setIsAiResponding(false)
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setIsAiResponding(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-full bg-background relative">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border bg-card px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-semibold truncate">Chat Geral - Farben</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Chat em grupo</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden flex-shrink-0 bg-transparent"
              onClick={() => setShowUsers(true)}
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <Card className="p-6 md:p-8 text-center">
                <Users className="h-10 w-10 md:h-12 md:w-12 text-primary mx-auto mb-4" />
                <h2 className="text-base md:text-lg font-semibold mb-2">Chat em Grupo</h2>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Converse com todos os funcionários da Farben em tempo real
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Digite <span className="font-mono bg-muted px-1 rounded">@</span> no início da mensagem para
                  perguntar ao assistente de IA
                </p>
              </Card>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-2 md:gap-3">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                    <AvatarFallback
                      className={
                        msg.message_type === "ai"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary text-xs md:text-sm"
                      }
                    >
                      {msg.message_type === "ai" ? (
                        <Bot className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        getInitials(msg.user_name)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-xs md:text-sm truncate">
                        {msg.user_name}
                        {msg.user_id === currentUserId && " (você)"}
                        {msg.message_type === "ai" && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">IA</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{formatTime(msg.created_at)}</span>
                    </div>
                    <Card
                      className={
                        msg.message_type === "ai" ? "p-2 md:p-3 bg-primary/5 border-primary/20" : "p-2 md:p-3 bg-card"
                      }
                    >
                      <p className="text-xs md:text-sm whitespace-pre-wrap">{msg.message}</p>
                    </Card>
                  </div>
                </div>
              ))
            )}
            {isAiResponding && (
              <div className="flex gap-2 md:gap-3">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4 md:h-5 md:w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-xs md:text-sm">Assistente Farben</span>
                  </div>
                  <Card className="p-2 md:p-3 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs md:text-sm text-muted-foreground">Pensando...</span>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-border bg-card p-3 md:p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {message.startsWith("@") && (
              <div className="mb-2 text-xs text-primary flex items-center gap-1">
                <Bot className="h-3 w-3" />
                <span>Pergunta para o assistente de IA</span>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem... (use @ para perguntar à IA)"
                className="flex-1 text-sm md:text-base"
                disabled={isAiResponding}
              />
              <Button type="submit" disabled={!message.trim() || isAiResponding} size="sm" className="md:size-default">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <aside className="hidden md:block w-64 border-l border-border bg-card p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Participantes
        </h3>
        <p className="text-sm text-muted-foreground">Você: {currentUserName}</p>
      </aside>

      {showUsers && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowUsers(false)} />
          <aside className="fixed right-0 top-0 bottom-0 w-64 bg-card border-l border-border z-50 md:hidden p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participantes
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowUsers(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Você: {currentUserName}</p>
          </aside>
        </>
      )}
    </div>
  )
}
