"use client";

import {
	ArrowLeft,
	Check,
	Edit2,
	Loader2,
	Send,
	Sparkles,
	X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

interface Conversation {
	id: string;
	title: string;
	created_at: string;
	updated_at: string;
}

export default function KnowledgeChatDetailPage() {
	const router = useRouter();
	const params = useParams();
	const conversationId = params.id as string;
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [isLoadingUser, setIsLoadingUser] = useState(true);
	const [isLoadingHistory, setIsLoadingHistory] = useState(true);
	const [conversation, setConversation] = useState<Conversation | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamingContent, setStreamingContent] = useState("");
	const [isResponseComplete, setIsResponseComplete] = useState(false);

	// Title editing state
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [isSavingTitle, setIsSavingTitle] = useState(false);

	// Refs for tracking state
	const savedMessageIdsRef = useRef<Set<string>>(new Set());
	const messageAddedRef = useRef(false);
	const hasLoadedRef = useRef(false);

	// Get current user
	useEffect(() => {
		async function getUser() {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (user) {
				setCurrentUserId(user.id);
			} else {
				router.push("/auth/login");
			}
			setIsLoadingUser(false);
		}
		getUser();
	}, [router]);

	// Load conversation and messages - only once
	useEffect(() => {
		if (!currentUserId || hasLoadedRef.current) return;

		async function loadData() {
			try {
				// Load conversation details
				const convResponse = await fetch(
					`/api/knowledge-conversations/${conversationId}`,
				);
				if (!convResponse.ok) {
					toast.error("Conversa não encontrada");
					router.push("/knowledge-chat");
					return;
				}
				const convData = await convResponse.json();

				if (convData.conversation) {
					setConversation(convData.conversation);
					setEditedTitle(convData.conversation.title);
				}

				// Load messages
				const msgResponse = await fetch(
					`/api/knowledge-conversations/${conversationId}/messages`,
				);
				if (msgResponse.ok) {
					const msgData = await msgResponse.json();

					if (msgData.messages && msgData.messages.length > 0) {
						const formattedMessages: Message[] = msgData.messages.map(
							(msg: any) => ({
								id: msg.id,
								role: msg.role,
								content: msg.content,
							}),
						);
						setMessages(formattedMessages);
						formattedMessages.forEach((msg) =>
							savedMessageIdsRef.current.add(msg.id),
						);
					}
				}

				hasLoadedRef.current = true;
			} catch (error) {
				console.error("Error loading data:", error);
				toast.error("Erro ao carregar conversa");
			} finally {
				setIsLoadingHistory(false);
			}
		}

		loadData();
	}, [currentUserId, conversationId, router]);

	// Scroll to bottom
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, streamingContent, scrollToBottom]);

	// Save message to database
	const saveMessageToDb = useCallback(
		async (
			role: "user" | "assistant",
			content: string,
		): Promise<string | null> => {
			try {
				const response = await fetch(
					`/api/knowledge-conversations/${conversationId}/messages`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ role, content }),
					},
				);

				if (response.ok) {
					const data = await response.json();
					return data.message?.id || null;
				}
				return null;
			} catch (error) {
				console.error("Error saving message:", error);
				return null;
			}
		},
		[conversationId],
	);

	// Send message
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const trimmedInput = inputValue.trim();
		if (!trimmedInput || isStreaming) return;

		// Create user message
		const userMessageId = `user-${Date.now()}`;
		const userMessage: Message = {
			id: userMessageId,
			role: "user",
			content: trimmedInput,
		};

		// Add to UI immediately
		setMessages((prev) => [...prev, userMessage]);
		setInputValue("");
		setIsStreaming(true);
		setStreamingContent("");
		setIsResponseComplete(false);
		messageAddedRef.current = false;

		// Save user message to DB
		const savedUserMsgId = await saveMessageToDb("user", trimmedInput);
		if (savedUserMsgId) {
			savedMessageIdsRef.current.add(savedUserMsgId);
		}

		// Prepare messages for API
		const messagesForApi = [...messages, userMessage].map((m) => ({
			role: m.role,
			content: m.content,
		}));

		try {
			const response = await fetch("/api/knowledge-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: messagesForApi }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("No response body");
			}

			const decoder = new TextDecoder();
			let fullContent = "";

			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				fullContent += chunk;
				setStreamingContent(fullContent);
			}

			setIsResponseComplete(true);
			messageAddedRef.current = true;

			// Add assistant message to UI
			const assistantMessageId = `assistant-${Date.now()}`;
			const assistantMessage: Message = {
				id: assistantMessageId,
				role: "assistant",
				content: fullContent,
			};

			setMessages((prev) => [...prev, assistantMessage]);

			setStreamingContent("");

			// Save assistant message to DB
			if (fullContent) {
				const savedAssistantMsgId = await saveMessageToDb(
					"assistant",
					fullContent,
				);
				if (savedAssistantMsgId) {
					savedMessageIdsRef.current.add(savedAssistantMsgId);
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Erro ao enviar mensagem. Tente novamente.");
		} finally {
			setIsStreaming(false);
			inputRef.current?.focus();
		}
	};

	// Send quick suggestion
	const sendSuggestion = (text: string) => {
		setInputValue(text);
		setTimeout(() => {
			const form = document.querySelector("form") as HTMLFormElement;
			if (form) {
				form.requestSubmit();
			}
		}, 0);
	};

	// Handle title edit
	const handleSaveTitle = async () => {
		if (!editedTitle.trim() || isSavingTitle) return;

		setIsSavingTitle(true);
		try {
			const response = await fetch(
				`/api/knowledge-conversations/${conversationId}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title: editedTitle }),
				},
			);

			if (response.ok) {
				setConversation((prev) =>
					prev ? { ...prev, title: editedTitle } : null,
				);
				setIsEditingTitle(false);
				toast.success("Título atualizado");
			} else {
				toast.error("Erro ao atualizar título");
			}
		} catch (error) {
			console.error("Error updating title:", error);
			toast.error("Erro ao atualizar título");
		} finally {
			setIsSavingTitle(false);
		}
	};

	const handleCancelEdit = () => {
		setIsEditingTitle(false);
		setEditedTitle(conversation?.title || "");
	};

	// Loading states
	if (isLoadingUser) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!currentUserId) {
		return null;
	}

	if (isLoadingHistory) {
		return (
			<div className="flex h-full items-center justify-center flex-col gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-sm text-muted-foreground">Carregando conversa...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<div className="border-b border-border bg-card px-6 py-4">
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/knowledge-chat")}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
						<Sparkles className="h-5 w-5 text-primary" />
					</div>
					<div className="flex-1">
						{isEditingTitle ? (
							<div className="flex items-center gap-2">
								<Input
									value={editedTitle}
									onChange={(e) => setEditedTitle(e.target.value)}
									className="h-8 text-lg font-semibold max-w-xs"
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSaveTitle();
										if (e.key === "Escape") handleCancelEdit();
									}}
								/>
								<Button
									size="icon"
									variant="ghost"
									onClick={handleSaveTitle}
									disabled={isSavingTitle}
								>
									<Check className="h-4 w-4 text-green-600" />
								</Button>
								<Button size="icon" variant="ghost" onClick={handleCancelEdit}>
									<X className="h-4 w-4 text-red-600" />
								</Button>
							</div>
						) : (
							<div
								className="flex items-center gap-2 cursor-pointer group"
								onClick={() => setIsEditingTitle(true)}
								title="Clique para editar o título"
							>
								<h1 className="text-xl font-semibold">
									{conversation?.title || "Conversa"}
								</h1>
								<Edit2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
							</div>
						)}
						<p className="text-sm text-muted-foreground">
							Tire suas dúvidas sobre a Farben
						</p>
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-6">
				<div className="max-w-3xl mx-auto space-y-4">
					{messages.length === 0 && !isStreaming ? (
						<Card className="p-8 text-center">
							<Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
							<h2 className="text-lg font-semibold mb-2">Como posso ajudar?</h2>
							<p className="text-sm text-muted-foreground mb-6">
								Pergunte sobre produtos, processos, políticas ou qualquer
								informação sobre a Farben
							</p>
							<div className="grid gap-2 text-left max-w-md mx-auto">
								<Button
									variant="outline"
									className="justify-start h-auto py-3 px-4 bg-transparent"
									onClick={() =>
										sendSuggestion(
											"Quais são os principais produtos da Farben?",
										)
									}
								>
									<span className="text-sm">
										Quais são os principais produtos da Farben?
									</span>
								</Button>
								<Button
									variant="outline"
									className="justify-start h-auto py-3 px-4 bg-transparent"
									onClick={() =>
										sendSuggestion("Como funciona o processo de vendas?")
									}
								>
									<span className="text-sm">
										Como funciona o processo de vendas?
									</span>
								</Button>
								<Button
									variant="outline"
									className="justify-start h-auto py-3 px-4 bg-transparent"
									onClick={() =>
										sendSuggestion("Quais tipos de tintas existem?")
									}
								>
									<span className="text-sm">
										Quais tipos de tintas existem?
									</span>
								</Button>
							</div>
						</Card>
					) : (
						<>
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
								>
									{message.role === "assistant" && (
										<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
											<Sparkles className="h-4 w-4 text-primary" />
										</div>
									)}
									<Card
										className={`p-4 max-w-[80%] ${
											message.role === "user"
												? "bg-primary text-primary-foreground"
												: "bg-card"
										}`}
									>
										{message.role === "assistant" ? (
											<div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:bg-muted prose-pre:p-3 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
												<ReactMarkdown>{message.content}</ReactMarkdown>
											</div>
										) : (
											<p className="text-sm whitespace-pre-wrap leading-relaxed">
												{message.content}
											</p>
										)}
									</Card>
								</div>
							))}

							{/* Streaming message */}
							{isStreaming && streamingContent && !messageAddedRef.current && (
								<div className="flex gap-3 justify-start">
									<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<Sparkles className="h-4 w-4 text-primary" />
									</div>
									<Card className="p-4 max-w-[80%] bg-card">
										<div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:bg-muted prose-pre:p-3 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
											<ReactMarkdown>{streamingContent}</ReactMarkdown>
										</div>
									</Card>
								</div>
							)}

							{/* Typing indicator */}
							{isStreaming && !streamingContent && !isResponseComplete && (
								<div className="flex gap-3 justify-start">
									<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<Sparkles className="h-4 w-4 text-primary" />
									</div>
									<Card className="p-4 bg-card">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-sm">Digitando...</span>
										</div>
									</Card>
								</div>
							)}

							<div ref={messagesEndRef} />
						</>
					)}
				</div>
			</div>

			{/* Input */}
			<div className="border-t border-border bg-card p-4">
				<form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
					<div className="flex gap-2">
						<Input
							ref={inputRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="Digite sua pergunta..."
							disabled={isStreaming}
							className="flex-1"
							autoComplete="off"
						/>
						<Button type="submit" disabled={isStreaming || !inputValue.trim()}>
							{isStreaming ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
