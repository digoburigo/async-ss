"use client";

import {
	AlertCircle,
	CheckCircle2,
	Circle,
	Loader2,
	RefreshCw,
	Sparkles,
	Trophy,
	User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type EmployeeType = "seller" | "stock_manager" | null;

interface ChecklistStep {
	id: string;
	title: string;
	description: string;
	order_index: number;
	completed: boolean;
	completed_at: string | null;
}

interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
}

const quizQuestions: Record<"seller" | "stock_manager", QuizQuestion[]> = {
	seller: [
		{
			id: "q1",
			question: "Qual é o primeiro passo ao atender um cliente na Farben?",
			options: [
				"Mostrar os produtos mais caros",
				"Cumprimentar e perguntar sobre suas necessidades",
				"Oferecer descontos imediatamente",
				"Falar sobre promoções",
			],
			correctAnswer: 1,
			explanation:
				"O atendimento começa com uma saudação cordial e entendimento das necessidades do cliente para oferecer a melhor solução.",
		},
		{
			id: "q2",
			question: "Quais são os principais tipos de tinta que a Farben oferece?",
			options: [
				"Apenas tintas acrílicas",
				"Tintas acrílicas, látex, esmaltes e vernizes",
				"Somente tintas para madeira",
				"Apenas tintas industriais",
			],
			correctAnswer: 1,
			explanation:
				"A Farben oferece uma linha completa incluindo tintas acrílicas, látex, esmaltes e vernizes para diferentes aplicações.",
		},
		{
			id: "q3",
			question: "Como você deve lidar com uma reclamação de cliente?",
			options: [
				"Ignorar e encaminhar para o gerente",
				"Ouvir atentamente, demonstrar empatia e buscar uma solução",
				"Culpar o produto ou fabricante",
				"Oferecer desconto imediatamente",
			],
			correctAnswer: 1,
			explanation:
				"Reclamações devem ser tratadas com atenção, empatia e foco em encontrar uma solução que satisfaça o cliente.",
		},
		{
			id: "q4",
			question: "Qual informação é essencial ao recomendar uma tinta?",
			options: [
				"Apenas o preço",
				"Superfície a ser pintada, ambiente (interno/externo) e acabamento desejado",
				"Somente a cor preferida",
				"Apenas a marca",
			],
			correctAnswer: 1,
			explanation:
				"Para recomendar a tinta adequada, é crucial conhecer a superfície, o ambiente de aplicação e o acabamento que o cliente deseja.",
		},
	],
	stock_manager: [
		{
			id: "q1",
			question: "Qual é a temperatura ideal para armazenar tintas no estoque?",
			options: [
				"Abaixo de 0°C",
				"Entre 10°C e 30°C",
				"Acima de 40°C",
				"Não importa a temperatura",
			],
			correctAnswer: 1,
			explanation:
				"Tintas devem ser armazenadas entre 10°C e 30°C para manter suas propriedades e evitar deterioração.",
		},
		{
			id: "q2",
			question: "Qual método de rotação de estoque deve ser usado para tintas?",
			options: [
				"LIFO (Last In, First Out)",
				"FIFO (First In, First Out)",
				"Aleatório",
				"Por cor",
			],
			correctAnswer: 1,
			explanation:
				"O método FIFO garante que produtos mais antigos sejam vendidos primeiro, evitando vencimento e perda de qualidade.",
		},
		{
			id: "q3",
			question:
				"Qual é o procedimento correto ao receber uma nova remessa de produtos?",
			options: [
				"Guardar imediatamente sem verificar",
				"Conferir quantidade, qualidade e validade antes de armazenar",
				"Deixar na área de recebimento",
				"Misturar com estoque antigo sem registro",
			],
			correctAnswer: 1,
			explanation:
				"Todo recebimento deve ser conferido quanto a quantidade, qualidade e validade antes de ser integrado ao estoque.",
		},
		{
			id: "q4",
			question: "Qual equipamento de segurança é obrigatório no armazém?",
			options: [
				"Apenas luvas",
				"EPIs completos: capacete, luvas, calçado de segurança e colete",
				"Somente calçado fechado",
				"Nenhum equipamento é necessário",
			],
			correctAnswer: 1,
			explanation:
				"A segurança no armazém exige o uso completo de EPIs incluindo capacete, luvas, calçado de segurança e colete refletivo.",
		},
	],
};

function ChecklistSkeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3, 4, 5].map((i) => (
				<Card key={i} className="p-6">
					<div className="flex items-start gap-4">
						<Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
						<div className="flex-1 space-y-3">
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-16" />
							</div>
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-full" />
						</div>
						<Skeleton className="h-5 w-5" />
					</div>
				</Card>
			))}
		</div>
	);
}

function RoleSelectionSkeleton() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				<div className="text-center space-y-4">
					<Skeleton className="h-12 w-64 mx-auto" />
					<Skeleton className="h-6 w-96 mx-auto" />
				</div>
				<div className="grid md:grid-cols-2 gap-6">
					{[1, 2].map((i) => (
						<Card key={i} className="p-8">
							<div className="space-y-4">
								<Skeleton className="h-12 w-12 rounded-lg" />
								<Skeleton className="h-8 w-32" />
								<Skeleton className="h-16 w-full" />
								<Skeleton className="h-12 w-full" />
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}

export default function PrimeirosPassosPage() {
	const [selectedType, setSelectedType] = useState<EmployeeType>(null);
	const [steps, setSteps] = useState<ChecklistStep[]>([]);
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [togglingSteps, setTogglingSteps] = useState<Set<string>>(new Set());
	const [isPending, startTransition] = useTransition();

	// Quiz state
	const [showQuiz, setShowQuiz] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<
		Record<string, number>
	>({});
	const [quizSubmitted, setQuizSubmitted] = useState(false);
	const [quizScore, setQuizScore] = useState(0);

	const fetchUser = useCallback(async () => {
		try {
			const supabase = createBrowserClient();
			const {
				data: { user },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError) {
				if (authError.message?.includes("Missing Supabase")) {
					setError("Erro de configuração. Por favor, contate o administrador.");
				}
				setCurrentUserId(null);
				return;
			}

			if (user) {
				setCurrentUserId(user.id);
				setError(null);
			} else {
				setCurrentUserId(null);
			}
		} catch (err) {
			if (err instanceof Error && err.message.includes("Missing Supabase")) {
				setError("Erro de configuração. Por favor, contate o administrador.");
			} else {
				setCurrentUserId(null);
			}
		} finally {
			setInitialLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const loadChecklist = useCallback(
		async (retryCount = 0) => {
			if (!selectedType || !currentUserId) return;

			setLoading(true);
			setError(null);

			try {
				const response = await fetch(
					`/api/checklist?employeeType=${selectedType}`,
				);
				const data = await response.json();

				if (!response.ok) {
					throw new Error(
						data.details || data.error || "Erro ao carregar checklist",
					);
				}

				if (data.steps) {
					setSteps(data.steps);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Erro ao carregar checklist";

				// Retry up to 2 times on network errors
				if (retryCount < 2 && errorMessage.includes("fetch")) {
					setTimeout(
						() => loadChecklist(retryCount + 1),
						1000 * (retryCount + 1),
					);
					return;
				}

				setError(errorMessage);
				toast.error("Erro ao carregar checklist", {
					description: "Tente novamente em alguns instantes.",
					action: {
						label: "Tentar novamente",
						onClick: () => loadChecklist(0),
					},
				});
			} finally {
				setLoading(false);
			}
		},
		[selectedType, currentUserId],
	);

	useEffect(() => {
		if (selectedType && currentUserId) {
			loadChecklist();
		}
	}, [selectedType, currentUserId, loadChecklist]);

	const toggleStep = async (stepId: string, currentCompleted: boolean) => {
		if (togglingSteps.has(stepId)) return; // Prevent double-clicks

		const newCompleted = !currentCompleted;

		// Optimistic update
		setSteps((prev) =>
			prev.map((step) =>
				step.id === stepId
					? {
							...step,
							completed: newCompleted,
							completed_at: newCompleted ? new Date().toISOString() : null,
						}
					: step,
			),
		);

		setTogglingSteps((prev) => new Set(prev).add(stepId));

		try {
			const response = await fetch("/api/checklist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					stepId,
					completed: newCompleted,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				// Revert optimistic update on error
				setSteps((prev) =>
					prev.map((step) =>
						step.id === stepId
							? {
									...step,
									completed: currentCompleted,
									completed_at: currentCompleted ? step.completed_at : null,
								}
							: step,
					),
				);
				throw new Error(
					data.details || data.error || "Erro ao atualizar progresso",
				);
			}

			// Show success toast
			if (newCompleted) {
				toast.success("Passo concluído!", {
					description: "Continue assim para completar sua integração.",
					icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
				});
			}

			setError(null);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Erro ao atualizar progresso";
			toast.error("Erro ao salvar progresso", {
				description: errorMessage,
			});
		} finally {
			setTogglingSteps((prev) => {
				const newSet = new Set(prev);
				newSet.delete(stepId);
				return newSet;
			});
		}
	};

	// Quiz handlers
	const handleStartQuiz = () => {
		setShowQuiz(true);
		setCurrentQuestionIndex(0);
		setSelectedAnswers({});
		setQuizSubmitted(false);
		setQuizScore(0);
	};

	const handleAnswerSelect = (questionId: string, answerIndex: number) => {
		setSelectedAnswers((prev) => ({
			...prev,
			[questionId]: answerIndex,
		}));
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < questions.length - 1) {
			startTransition(() => {
				setCurrentQuestionIndex((prev) => prev + 1);
			});
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			startTransition(() => {
				setCurrentQuestionIndex((prev) => prev - 1);
			});
		}
	};

	const handleSubmitQuiz = () => {
		let score = 0;
		questions.forEach((q) => {
			if (selectedAnswers[q.id] === q.correctAnswer) {
				score++;
			}
		});
		setQuizScore(score);
		setQuizSubmitted(true);

		const percentage = Math.round((score / questions.length) * 100);
		if (percentage >= 70) {
			toast.success("Parabéns! Você passou no quiz!", {
				description: `Você acertou ${score} de ${questions.length} questões (${percentage}%)`,
				icon: <Trophy className="h-4 w-4 text-yellow-500" />,
			});
		} else {
			toast.info("Quase lá!", {
				description: `Você precisa de 70% para passar. Revise e tente novamente.`,
			});
		}
	};

	const handleRetakeQuiz = () => {
		setCurrentQuestionIndex(0);
		setSelectedAnswers({});
		setQuizSubmitted(false);
		setQuizScore(0);
	};

	// Computed values
	const completedCount = steps.filter((s) => s.completed).length;
	const totalCount = steps.length;
	const progress =
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	const questions = selectedType ? quizQuestions[selectedType] : [];
	const currentQuestion = questions[currentQuestionIndex];
	const allQuestionsAnswered = questions.every(
		(q) => selectedAnswers[q.id] !== undefined,
	);
	const quizPercentage =
		questions.length > 0 ? Math.round((quizScore / questions.length) * 100) : 0;

	if (initialLoading) {
		return <RoleSelectionSkeleton />;
	}

	// Not authenticated
	if (!currentUserId) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				{error ? (
					<Alert variant="destructive" className="max-w-md">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Erro de Configuração</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : (
					<Card className="max-w-md p-8 text-center space-y-4">
						<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
							<User className="h-8 w-8 text-primary" />
						</div>
						<div>
							<h2 className="text-2xl font-bold mb-2">
								Autenticação Necessária
							</h2>
							<p className="text-muted-foreground">
								Você precisa estar autenticado para acessar os Primeiros Passos.
							</p>
						</div>
						<Button asChild className="w-full">
							<Link href="/auth/login">Fazer Login</Link>
						</Button>
					</Card>
				)}
			</div>
		);
	}

	// Role selection screen
	if (!selectedType) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Header */}
					<div className="text-center space-y-4">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
							<Sparkles className="h-4 w-4" />
							Bem-vindo à Farben
						</div>
						<h1 className="text-4xl md:text-5xl font-bold text-balance">
							Primeiros Passos
						</h1>
						<p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
							Selecione seu tipo de função para começar sua jornada de
							integração personalizada.
						</p>
					</div>

					{/* Role Selection Cards */}
					<div className="grid md:grid-cols-2 gap-6">
						<Card
							className="p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary group"
							onClick={() => setSelectedType("seller")}
						>
							<div className="space-y-4">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
									<svg
										className="w-7 h-7 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-2xl font-bold mb-2">Vendedor</h3>
									<p className="text-muted-foreground leading-relaxed">
										Aprenda sobre nossos produtos, técnicas de venda,
										atendimento ao cliente e como ajudar nossos clientes a
										escolher as melhores tintas.
									</p>
								</div>
								<Button className="w-full group-hover:bg-primary/90" size="lg">
									Começar como Vendedor
								</Button>
							</div>
						</Card>

						<Card
							className="p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary group"
							onClick={() => setSelectedType("stock_manager")}
						>
							<div className="space-y-4">
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
									<svg
										className="w-7 h-7 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										/>
									</svg>
								</div>
								<div>
									<h3 className="text-2xl font-bold mb-2">
										Gerente de Estoque
									</h3>
									<p className="text-muted-foreground leading-relaxed">
										Domine nosso sistema de inventário, processos de
										recebimento, organização de produtos e controle de
										qualidade.
									</p>
								</div>
								<Button className="w-full group-hover:bg-primary/90" size="lg">
									Começar como Gerente
								</Button>
							</div>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	// Quiz in progress
	if (showQuiz && !quizSubmitted) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
				<div className="max-w-3xl mx-auto space-y-8">
					{/* Quiz Header */}
					<div className="flex items-center justify-between">
						<Button variant="ghost" onClick={() => setShowQuiz(false)}>
							← Voltar para Checklist
						</Button>
						<Badge variant="secondary">
							Questão {currentQuestionIndex + 1} de {questions.length}
						</Badge>
					</div>

					{/* Progress Bar */}
					<Progress
						value={((currentQuestionIndex + 1) / questions.length) * 100}
						className="h-2"
					/>

					{/* Question Card */}
					<Card className="p-8">
						<div className="space-y-6">
							<div>
								<Badge variant="outline" className="mb-4">
									Questão {currentQuestionIndex + 1}
								</Badge>
								<h2 className="text-2xl font-bold text-balance">
									{currentQuestion.question}
								</h2>
							</div>

							<RadioGroup
								value={selectedAnswers[currentQuestion.id]?.toString()}
								onValueChange={(value) =>
									handleAnswerSelect(currentQuestion.id, Number.parseInt(value))
								}
							>
								<div className="space-y-3">
									{currentQuestion.options.map((option, index) => (
										<div
											key={index}
											className={cn(
												"flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50",
												selectedAnswers[currentQuestion.id] === index &&
													"border-primary bg-primary/5",
											)}
											onClick={() =>
												handleAnswerSelect(currentQuestion.id, index)
											}
										>
											<RadioGroupItem
												value={index.toString()}
												id={`option-${index}`}
											/>
											<Label
												htmlFor={`option-${index}`}
												className="flex-1 cursor-pointer"
											>
												{option}
											</Label>
										</div>
									))}
								</div>
							</RadioGroup>
						</div>
					</Card>

					{/* Navigation Buttons */}
					<div className="flex items-center justify-between gap-4">
						<Button
							variant="outline"
							onClick={handlePreviousQuestion}
							disabled={currentQuestionIndex === 0 || isPending}
						>
							← Anterior
						</Button>

						<div className="text-sm text-muted-foreground">
							{Object.keys(selectedAnswers).length} de {questions.length}{" "}
							respondidas
						</div>

						{currentQuestionIndex < questions.length - 1 ? (
							<Button
								onClick={handleNextQuestion}
								disabled={
									selectedAnswers[currentQuestion.id] === undefined || isPending
								}
							>
								Próxima →
							</Button>
						) : (
							<Button
								onClick={handleSubmitQuiz}
								disabled={!allQuestionsAnswered}
								className="min-w-[120px]"
							>
								Finalizar Quiz
							</Button>
						)}
					</div>

					{/* Warning if not all answered */}
					{currentQuestionIndex === questions.length - 1 &&
						!allQuestionsAnswered && (
							<Card className="p-4 bg-amber-500/10 border-amber-500/50">
								<div className="flex items-start gap-3">
									<AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
									<div className="text-sm">
										<p className="font-medium text-amber-900 dark:text-amber-100">
											Você ainda tem questões não respondidas
										</p>
										<p className="text-amber-800 dark:text-amber-200 mt-1">
											Por favor, responda todas as questões antes de finalizar o
											quiz.
										</p>
									</div>
								</div>
							</Card>
						)}
				</div>
			</div>
		);
	}

	// Quiz results
	if (showQuiz && quizSubmitted) {
		const passed = quizPercentage >= 70;

		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
				<div className="max-w-3xl mx-auto space-y-8">
					{/* Results Header */}
					<Card
						className={cn(
							"p-8",
							passed
								? "bg-green-500/10 border-green-500/50"
								: "bg-amber-500/10 border-amber-500/50",
						)}
					>
						<div className="text-center space-y-4">
							<div
								className={cn(
									"w-20 h-20 rounded-full flex items-center justify-center mx-auto",
									passed ? "bg-green-500/20" : "bg-amber-500/20",
								)}
							>
								{passed ? (
									<Trophy className="h-10 w-10 text-green-600" />
								) : (
									<AlertCircle className="h-10 w-10 text-amber-600" />
								)}
							</div>
							<div>
								<h2 className="text-3xl font-bold mb-2">
									{passed ? "Parabéns!" : "Quase lá!"}
								</h2>
								<p className="text-lg text-muted-foreground">
									Você acertou {quizScore} de {questions.length} questões (
									{quizPercentage}%)
								</p>
							</div>
							{passed ? (
								<p className="text-muted-foreground max-w-md mx-auto">
									Excelente trabalho! Você demonstrou um ótimo entendimento dos
									primeiros passos na Farben.
								</p>
							) : (
								<p className="text-muted-foreground max-w-md mx-auto">
									Revise os itens marcados abaixo e tente novamente. Você
									precisa de pelo menos 70% para passar.
								</p>
							)}
						</div>
					</Card>

					{/* Question Review */}
					<div className="space-y-4">
						<h3 className="text-xl font-bold">Revisão das Questões</h3>
						{questions.map((question, index) => {
							const userAnswer = selectedAnswers[question.id];
							const isCorrect = userAnswer === question.correctAnswer;

							return (
								<Card
									key={question.id}
									className={cn(
										"p-6",
										isCorrect
											? "border-green-500/50 bg-green-500/5"
											: "border-red-500/50 bg-red-500/5",
									)}
								>
									<div className="space-y-4">
										<div className="flex items-start gap-3">
											{isCorrect ? (
												<CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
											) : (
												<AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
											)}
											<div className="flex-1 space-y-3">
												<div>
													<Badge variant="outline" className="mb-2">
														Questão {index + 1}
													</Badge>
													<h4 className="font-semibold text-lg">
														{question.question}
													</h4>
												</div>

												<div className="space-y-2">
													<div className="text-sm">
														<span className="font-medium">Sua resposta: </span>
														<span
															className={
																isCorrect ? "text-green-600" : "text-red-600"
															}
														>
															{question.options[userAnswer]}
														</span>
													</div>
													{!isCorrect && (
														<div className="text-sm">
															<span className="font-medium">
																Resposta correta:{" "}
															</span>
															<span className="text-green-600">
																{question.options[question.correctAnswer]}
															</span>
														</div>
													)}
												</div>

												<div className="p-3 bg-muted rounded-lg">
													<p className="text-sm text-muted-foreground">
														<span className="font-medium">Explicação: </span>
														{question.explanation}
													</p>
												</div>
											</div>
										</div>
									</div>
								</Card>
							);
						})}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center justify-center gap-4">
						<Button variant="outline" onClick={() => setShowQuiz(false)}>
							Voltar para Checklist
						</Button>
						{!passed && (
							<Button onClick={handleRetakeQuiz}>Tentar Novamente</Button>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Main checklist view
	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
			<div className="max-w-4xl mx-auto space-y-8">
				{/* Header with Back Button */}
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={() => setSelectedType(null)}>
						← Voltar
					</Button>
					<Badge variant="secondary" className="text-sm">
						{selectedType === "seller" ? "Vendedor" : "Gerente de Estoque"}
					</Badge>
				</div>

				{/* Progress Header */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h1 className="text-3xl md:text-4xl font-bold">
							Sua Lista de Integração
						</h1>
						<div className="text-right">
							<div className="text-3xl font-bold text-primary">{progress}%</div>
							<div className="text-sm text-muted-foreground">
								{completedCount} de {totalCount} completos
							</div>
						</div>
					</div>

					{/* Progress Bar */}
					<Progress value={progress} className="h-3" />
				</div>

				{/* Error Alert with Retry */}
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Erro</AlertTitle>
						<AlertDescription className="flex items-center justify-between">
							<span>{error}</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => loadChecklist(0)}
								className="ml-4"
							>
								<RefreshCw className="h-4 w-4 mr-2" />
								Tentar novamente
							</Button>
						</AlertDescription>
					</Alert>
				)}

				{/* Checklist */}
				{loading ? (
					<ChecklistSkeleton />
				) : (
					<div className="space-y-4">
						{steps.map((step, index) => {
							const isToggling = togglingSteps.has(step.id);

							return (
								<Card
									key={step.id}
									className={cn(
										"p-6 transition-all cursor-pointer hover:shadow-md",
										step.completed && "bg-muted/50 border-primary/50",
										isToggling && "opacity-70 pointer-events-none",
									)}
									onClick={() =>
										!isToggling && toggleStep(step.id, step.completed)
									}
								>
									<div className="flex items-start gap-4">
										<div className="flex-shrink-0 mt-1">
											{isToggling ? (
												<Loader2 className="h-6 w-6 animate-spin text-primary" />
											) : step.completed ? (
												<CheckCircle2 className="h-6 w-6 text-primary" />
											) : (
												<Circle className="h-6 w-6 text-muted-foreground" />
											)}
										</div>
										<div className="flex-1 space-y-2">
											<div className="flex items-start justify-between gap-4">
												<div>
													<div className="flex items-center gap-2">
														<Badge variant="outline" className="text-xs">
															Passo {index + 1}
														</Badge>
														{step.completed && (
															<Badge variant="secondary" className="text-xs">
																Concluído
															</Badge>
														)}
													</div>
													<h3
														className={cn(
															"text-lg font-semibold mt-2",
															step.completed &&
																"text-muted-foreground line-through",
														)}
													>
														{step.title}
													</h3>
												</div>
												<Checkbox
													checked={step.completed}
													disabled={isToggling}
													onCheckedChange={() =>
														!isToggling && toggleStep(step.id, step.completed)
													}
												/>
											</div>
											<p
												className={cn(
													"text-sm",
													step.completed
														? "text-muted-foreground"
														: "text-foreground",
												)}
											>
												{step.description}
											</p>
											{step.completed && step.completed_at && (
												<p className="text-xs text-muted-foreground">
													Concluído em{" "}
													{new Date(step.completed_at).toLocaleDateString(
														"pt-BR",
														{
															day: "2-digit",
															month: "long",
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														},
													)}
												</p>
											)}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				)}

				{/* Completion Message with Quiz Button */}
				{progress === 100 && (
					<Card className="p-8 bg-primary/5 border-primary">
						<div className="text-center space-y-4">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
								<CheckCircle2 className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-2xl font-bold">Parabéns!</h3>
							<p className="text-muted-foreground max-w-md mx-auto">
								Você completou todos os passos da sua integração. Agora teste
								seus conhecimentos com um quiz rápido!
							</p>
							<Button size="lg" onClick={handleStartQuiz} className="mt-4">
								<Trophy className="h-5 w-5 mr-2" />
								Iniciar Quiz de Conhecimento
							</Button>
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
