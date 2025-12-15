"use client";

import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface ChatSession {
	id: string;
	title: string;
	employee_type: string;
	created_at: string;
	updated_at: string;
}

export function ChatView({ chatId }: { chatId: string }) {
	const router = useRouter();
	const [session, setSession] = useState<ChatSession | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [retryCount, setRetryCount] = useState(0);

	const loadSession = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				router.push("/auth/login");
				return;
			}

			console.log("[v0] Loading session directly by ID:", chatId);

			const response = await fetch(`/api/chat-sessions/onboarding/${chatId}`);
			const data = await response.json();

			if (!response.ok) {
				// If 404 and we haven't retried yet, wait a bit and retry (for newly created sessions)
				if (response.status === 404 && retryCount < 3) {
					console.log(
						"[v0] Session not found, retrying in 500ms... (attempt",
						retryCount + 1,
						")",
					);
					setTimeout(() => {
						setRetryCount((prev) => prev + 1);
					}, 500);
					return;
				}
				throw new Error(data.error || "Failed to load session");
			}

			if (!data.session) {
				setError("Conversa não encontrada");
				return;
			}

			console.log("[v0] Session loaded successfully:", data.session.id);
			setSession(data.session);
		} catch (err) {
			console.error("[v0] Error loading session:", err);
			setError("Erro ao carregar conversa");
		} finally {
			setIsLoading(false);
		}
	}, [chatId, router, retryCount]);

	useEffect(() => {
		loadSession();
	}, [loadSession]);

	const handleBack = () => {
		router.push("/onboarding-chat");
	};

	const handleTitleChange = (newTitle: string) => {
		if (session) {
			setSession({ ...session, title: newTitle });
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col bg-background">
				<header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
					<div className="container flex h-14 md:h-16 items-center gap-2 md:gap-4 px-3 md:px-4">
						<Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-md" />
						<div className="flex-1">
							<Skeleton className="h-5 w-32 mb-1" />
							<Skeleton className="h-4 w-20" />
						</div>
					</div>
				</header>
				<div className="flex-1 p-4">
					<div className="container max-w-4xl space-y-4">
						<Skeleton className="h-16 w-3/4" />
						<Skeleton className="h-16 w-1/2 ml-auto" />
						<Skeleton className="h-16 w-2/3" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !session) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Alert variant="destructive" className="max-w-md">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Erro</AlertTitle>
					<AlertDescription className="mt-2">
						{error || "Conversa não encontrada"}
						<Button
							variant="outline"
							size="sm"
							className="mt-4 w-full bg-transparent"
							onClick={handleBack}
						>
							Voltar para Conversas
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	return (
		<ChatInterface
			role={session.employee_type as "vendedor" | "gerente_estoque"}
			chatSessionId={session.id}
			title={session.title}
			onTitleChange={handleTitleChange}
			onBack={handleBack}
		/>
	);
}
