"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type EmployeeType = "vendedor" | "gerente_estoque";

const ROLE_SUGGESTIONS: Record<EmployeeType, string[]> = {
  vendedor: [
    "Quais são as principais técnicas de vendas que devo usar?",
    "Como lidar com objeções de clientes?",
    "Quais produtos têm maior margem de lucro?",
    "Como fazer um bom atendimento ao cliente?",
  ],
  gerente_estoque: [
    "Como organizar o estoque de forma eficiente?",
    "Quais são os processos de entrada e saída de produtos?",
    "Como fazer o controle de inventário?",
    "Quais são as melhores práticas para evitar perdas?",
  ],
};

interface ChatInterfaceProps {
  role: EmployeeType;
  chatSessionId: string;
  title?: string;
  onTitleChange?: (newTitle: string) => void;
  onBack: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-[85%] p-3 md:max-w-[80%] md:p-4 ${isUser ? "bg-primary/50" : "bg-card"}`}
      >
        <div className="space-y-2">
          <Skeleton
            className={`h-4 w-48 ${isUser ? "bg-primary-foreground/20" : ""}`}
          />
          <Skeleton
            className={`h-4 w-32 ${isUser ? "bg-primary-foreground/20" : ""}`}
          />
        </div>
      </Card>
    </div>
  );
}

export function ChatInterface({
  role,
  chatSessionId,
  title,
  onTitleChange,
  onBack,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const savedMessageIdsRef = useRef<Set<string>>(new Set());
  const initialGreetingSentRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageAddedRef = useRef(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || "Nova Conversa");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true);

  useEffect(() => {
    if (title) {
      setEditedTitle(title);
    }
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const saveTitle = async () => {
    const trimmedTitle = editedTitle.trim();
    if (!trimmedTitle || trimmedTitle === title) {
      setIsEditingTitle(false);
      setEditedTitle(title || "Nova Conversa");
      return;
    }

    setIsSavingTitle(true);
    try {
      const response = await fetch("/api/chat-sessions/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatSessionId,
          title: trimmedTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save title");
      }

      onTitleChange?.(trimmedTitle);
      toast.success("Título atualizado com sucesso");
      setIsEditingTitle(false);
    } catch (error) {
      toast.error("Erro ao salvar título");
      setEditedTitle(title || "Nova Conversa");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle();
    } else if (e.key === "Escape") {
      setIsEditingTitle(false);
      setEditedTitle(title || "Nova Conversa");
    }
  };

  const cancelTitleEdit = () => {
    setIsEditingTitle(false);
    setEditedTitle(title || "Nova Conversa");
  };

  const saveMessage = useCallback(
    async (
      messageRole: "user" | "assistant",
      content: string
    ): Promise<string | null> =>
      saveMessageToDb(chatSessionId, messageRole, content),
    [chatSessionId]
  );

  const sendMessageToAI = useCallback(
    async (userMessage: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setStreamingContent("");
      messageAddedRef.current = false;

      const userMsgId = `user-${Date.now()}`;
      const newUserMessage: Message = {
        id: userMsgId,
        role: "user",
        content: userMessage,
      };
      setMessages((prev) => [...prev, newUserMessage]);

      const userSavedId = await saveMessage("user", userMessage);
      if (!userSavedId) {
        console.log("[v0] Failed to save user message to database");
      }

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            role,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }

        if (fullContent.trim()) {
          messageAddedRef.current = true;

          const assistantMsgId = `assistant-${Date.now()}`;
          const assistantMessage: Message = {
            id: assistantMsgId,
            role: "assistant",
            content: fullContent.trim(),
          };

          setStreamingContent("");
          setMessages((prev) => [...prev, assistantMessage]);

          const savedId = await saveMessage("assistant", fullContent.trim());
          if (!savedId) {
            console.log("[v0] Failed to save assistant message to database");
            toast.error(
              "Erro ao salvar resposta. Por favor, recarregue a página."
            );
          }
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [messages, role, saveMessage]
  );

  const loadHistory = useCallback(
    async (retryCount = 0) => {
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/chat-history/onboarding?chatSessionId=${chatSessionId}`
        );

        if (!response.ok) {
          throw new Error("Falha ao carregar histórico");
        }

        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          const formattedMessages: Message[] = data.messages.map(
            (msg: any) => ({
              id: msg.id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
            })
          );
          setMessages(formattedMessages);
          formattedMessages.forEach((msg) =>
            savedMessageIdsRef.current.add(msg.id)
          );
        }
      } catch (error) {
        if (retryCount < 2) {
          setTimeout(
            () => loadHistory(retryCount + 1),
            1000 * (retryCount + 1)
          );
          return;
        }
        setLoadError(
          "Não foi possível carregar o histórico. Clique para tentar novamente."
        );
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [chatSessionId]
  );

  useEffect(() => {
    savedMessageIdsRef.current.clear();
    initialGreetingSentRef.current = false;
    setIsLoadingHistory(true);
    setMessages([]);
    loadHistory();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [chatSessionId, loadHistory]);

  useEffect(() => {
    if (
      !isLoadingHistory &&
      messages.length === 0 &&
      !initialGreetingSentRef.current &&
      !loadError &&
      !isStreaming
    ) {
      initialGreetingSentRef.current = true;
      setTimeout(() => {
        sendMessageToAI("Olá! Estou pronto para começar meu treinamento.");
      }, 500);
    }
  }, [
    isLoadingHistory,
    messages.length,
    loadError,
    isStreaming,
    sendMessageToAI,
  ]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();

    if (trimmedInput && !isStreaming) {
      setInputValue("");
      await sendMessageToAI(trimmedInput);
      inputRef.current?.focus();
    }
  };

  const roleTitle = role === "vendedor" ? "Vendedor" : "Gerente de Estoque";

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  if (isLoadingHistory) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-14 items-center gap-2 px-3 md:h-16 md:gap-4 md:px-4">
            <Skeleton className="h-8 w-8 rounded-md md:h-10 md:w-10" />
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
              <Skeleton className="h-6 w-16" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-1 h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl space-y-4 px-3 py-4 md:space-y-6 md:px-4 md:py-8">
            <MessageSkeleton />
            <MessageSkeleton isUser />
            <MessageSkeleton />
          </div>
        </div>

        <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container max-w-4xl px-3 py-3 md:px-4 md:py-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-14 items-center gap-2 px-3 md:h-16 md:gap-4 md:px-4">
          <Button
            className="h-8 w-8 md:h-10 md:w-10"
            onClick={onBack}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
            <div className="truncate font-semibold text-sm md:text-base">
              Farben
            </div>
            <div className="min-w-0 flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <Input
                    className="h-7 px-2 font-semibold text-sm md:text-lg"
                    disabled={isSavingTitle}
                    maxLength={100}
                    onBlur={() => {
                      setTimeout(() => {
                        if (isEditingTitle && !isSavingTitle) {
                          cancelTitleEdit();
                        }
                      }, 150);
                    }}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    ref={titleInputRef}
                    value={editedTitle}
                  />
                  <Button
                    className="h-7 w-7 flex-shrink-0"
                    disabled={isSavingTitle}
                    onClick={saveTitle}
                    size="icon"
                    variant="ghost"
                  >
                    {isSavingTitle ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </Button>
                  <Button
                    className="h-7 w-7 flex-shrink-0"
                    disabled={isSavingTitle}
                    onClick={cancelTitleEdit}
                    size="icon"
                    variant="ghost"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div
                  className="group flex cursor-pointer items-center gap-1"
                  onClick={() => setIsEditingTitle(true)}
                  title="Clique para editar o título"
                >
                  <h1 className="truncate font-semibold text-sm transition-colors group-hover:text-primary md:text-lg">
                    {title || "Nova Conversa"}
                  </h1>
                  <Pencil className="h-3 w-3 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:h-4 md:w-4" />
                </div>
              )}
              <p className="truncate text-muted-foreground text-xs md:text-sm">
                {roleTitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl space-y-4 px-3 py-4 md:space-y-6 md:px-4 md:py-8">
          {loadError && (
            <Alert
              className="cursor-pointer"
              onClick={() => {
                setIsLoadingHistory(true);
                loadHistory();
              }}
              variant="destructive"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                {loadError}
                <RefreshCw className="h-4 w-4" />
              </AlertDescription>
            </Alert>
          )}

          {messages.map((message) => (
            <div
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              key={message.id}
            >
              <Card
                className={`max-w-[85%] p-3 md:max-w-[80%] md:p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                }`}
              >
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-pretty leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {message.role === "user" ? (
                    <p className="m-0 whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
                </div>
              </Card>
            </div>
          ))}

          {isStreaming && streamingContent && !messageAddedRef.current && (
            <div className="flex justify-start">
              <Card className="max-w-[85%] bg-card p-3 md:max-w-[80%] md:p-4">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-pretty leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </div>
              </Card>
            </div>
          )}

          {isStreaming && !streamingContent && !messageAddedRef.current && (
            <div className="flex justify-start">
              <Card className="bg-card p-3 md:p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs md:text-sm">Digitando...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container max-w-4xl px-3 py-3 md:px-4 md:py-4">
          {showSuggestions && !loadError && (
            <div className="mb-3">
              <button
                className="mb-2 flex w-full items-center justify-between gap-2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setSuggestionsExpanded(!suggestionsExpanded)}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    Sugestões para começar
                  </span>
                </div>
                {suggestionsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
              {suggestionsExpanded && (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {ROLE_SUGGESTIONS[role].map((suggestion, index) => (
                    <button
                      className="rounded-lg border bg-card p-2.5 text-left text-muted-foreground text-sm transition-colors hover:border-primary/50 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isStreaming}
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <Input
              autoComplete="off"
              className="h-10 flex-1 text-sm md:h-10 md:text-base"
              disabled={isStreaming}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Digite sua mensagem..."
              ref={inputRef}
              value={inputValue}
            />
            <Button
              className="h-10 w-10 flex-shrink-0"
              disabled={isStreaming || !inputValue.trim()}
              size="icon"
              type="submit"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

const saveMessageToDb = async (
  chatSessionId: string,
  messageRole: "user" | "assistant",
  content: string
): Promise<string | null> => {
  if (!content || content.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch("/api/chat-history/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatSessionId,
        role: messageRole,
        content: content.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    if (data.skipped) {
      return "skipped";
    }

    return data.messageId;
  } catch (error) {
    return null;
  }
};
