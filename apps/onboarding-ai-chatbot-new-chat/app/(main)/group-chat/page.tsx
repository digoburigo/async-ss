"use client";

import { Bot, Loader2, Send, Users, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface GroupMessage {
  id: string;
  user_name: string;
  message: string;
  created_at: string;
  user_id: string;
  message_type?: "user" | "ai" | "system";
  parent_message_id?: string;
}

export default function GroupChatPage() {
  const [message, setMessage] = useState("");
  const [showUsers, setShowUsers] = useState(false);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastLoadedCountRef = useRef(0);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserName(
          user.user_metadata?.name || user.email?.split("@")[0] || "Usuário"
        );
      }
    }

    getUser();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch("/api/chat-history/group?limit=50");
        const data = await response.json();
        if (data.messages) {
          // Only update if message count changed to prevent unnecessary re-renders
          if (data.messages.length !== lastLoadedCountRef.current) {
            setMessages(data.messages);
            lastLoadedCountRef.current = data.messages.length;
            console.log("[v0] Loaded", data.messages.length, "group messages");
          }
        }
      } catch (error) {
        console.error("[v0] Error loading messages:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();

    const interval = setInterval(loadMessages, 5000); // Changed from 3000 to 5000ms
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isAiResponding || !currentUserId) return;

    const messageText = message.trim();
    const isAiMention = messageText.startsWith("@");
    const actualMessage = isAiMention
      ? messageText.slice(1).trim()
      : messageText;

    setMessage("");

    try {
      console.log("[v0] Sending message:", actualMessage);
      const response = await fetch("/api/chat-history/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: actualMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);

          if (isAiMention) {
            setIsAiResponding(true);
            console.log("[v0] Requesting AI response");
            try {
              const aiResponse = await fetch("/api/group-chat-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message: actualMessage,
                  parentMessageId: data.message.id,
                }),
              });

              if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                if (aiData.message) {
                  setMessages((prev) => [...prev, aiData.message]);
                  console.log("[v0] AI response received");
                }
              }
            } catch (error) {
              console.error("[v0] Error getting AI response:", error);
            } finally {
              setIsAiResponding(false);
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error);
      setIsAiResponding(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-border border-b bg-card px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 md:h-10 md:w-10">
                <Users className="h-4 w-4 text-primary md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-semibold text-base md:text-xl">
                  Chat Geral - Farben
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Chat em grupo
                </p>
              </div>
            </div>
            <Button
              className="flex-shrink-0 bg-transparent md:hidden"
              onClick={() => setShowUsers(true)}
              size="sm"
              variant="outline"
            >
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.length === 0 ? (
              <Card className="p-6 text-center md:p-8">
                <Users className="mx-auto mb-4 h-10 w-10 text-primary md:h-12 md:w-12" />
                <h2 className="mb-2 font-semibold text-base md:text-lg">
                  Chat em Grupo
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Converse com todos os funcionários da Farben em tempo real
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  💡 Digite{" "}
                  <span className="rounded bg-muted px-1 font-mono">@</span> no
                  início da mensagem para perguntar ao assistente de IA
                </p>
              </Card>
            ) : (
              messages.map((msg) => (
                <div className="flex gap-2 md:gap-3" key={msg.id}>
                  <Avatar className="h-8 w-8 flex-shrink-0 md:h-10 md:w-10">
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
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="truncate font-semibold text-xs md:text-sm">
                        {msg.user_name}
                        {msg.user_id === currentUserId && " (você)"}
                        {msg.message_type === "ai" && (
                          <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-primary text-xs">
                            IA
                          </span>
                        )}
                      </span>
                      <span className="flex-shrink-0 text-muted-foreground text-xs">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <Card
                      className={
                        msg.message_type === "ai"
                          ? "border-primary/20 bg-primary/5 p-2 md:p-3"
                          : "bg-card p-2 md:p-3"
                      }
                    >
                      <p className="whitespace-pre-wrap text-xs md:text-sm">
                        {msg.message}
                      </p>
                    </Card>
                  </div>
                </div>
              ))
            )}
            {isAiResponding && (
              <div className="flex gap-2 md:gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0 md:h-10 md:w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4 md:h-5 md:w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="font-semibold text-xs md:text-sm">
                      Assistente Farben
                    </span>
                  </div>
                  <Card className="border-primary/20 bg-primary/5 p-2 md:p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-muted-foreground text-xs md:text-sm">
                        Pensando...
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-border border-t bg-card p-3 md:p-4">
          <form className="mx-auto max-w-4xl" onSubmit={handleSubmit}>
            {message.startsWith("@") && (
              <div className="mb-2 flex items-center gap-1 text-primary text-xs">
                <Bot className="h-3 w-3" />
                <span>Pergunta para o assistente de IA</span>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                className="flex-1 text-sm md:text-base"
                disabled={isAiResponding}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem... (use @ para perguntar à IA)"
                value={message}
              />
              <Button
                className="md:size-default"
                disabled={!message.trim() || isAiResponding}
                size="sm"
                type="submit"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <aside className="hidden w-64 border-border border-l bg-card p-4 md:block">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Users className="h-4 w-4" />
          Participantes
        </h3>
        <p className="text-muted-foreground text-sm">Você: {currentUserName}</p>
      </aside>

      {showUsers && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setShowUsers(false)}
          />
          <aside className="fixed top-0 right-0 bottom-0 z-50 w-64 overflow-y-auto border-border border-l bg-card p-4 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold">
                <Users className="h-4 w-4" />
                Participantes
              </h3>
              <Button
                onClick={() => setShowUsers(false)}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Você: {currentUserName}
            </p>
          </aside>
        </>
      )}
    </div>
  );
}
