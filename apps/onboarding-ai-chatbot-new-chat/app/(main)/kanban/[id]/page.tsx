"use client";

import {
	AlertCircle,
	ArrowLeft,
	Edit,
	GripVertical,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface KanbanCard {
	id: string;
	column_id: string;
	title: string;
	description: string | null;
	position: number;
	color: string;
	due_date: string | null;
	created_at: string;
	updated_at: string;
}

interface KanbanColumn {
	id: string;
	board_id: string;
	title: string;
	position: number;
	created_at: string;
	cards: KanbanCard[];
}

interface KanbanBoard {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	created_at: string;
	updated_at: string;
}

const COLORS = [
	{ value: "#3b82f6", label: "Azul" },
	{ value: "#10b981", label: "Verde" },
	{ value: "#f59e0b", label: "Laranja" },
	{ value: "#ef4444", label: "Vermelho" },
	{ value: "#8b5cf6", label: "Roxo" },
	{ value: "#ec4899", label: "Rosa" },
];

export default function KanbanBoardPage() {
	const params = useParams();
	const boardId = params.id as string;

	const [board, setBoard] = useState<KanbanBoard | null>(null);
	const [columns, setColumns] = useState<KanbanColumn[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showCardDialog, setShowCardDialog] = useState(false);
	const [showColumnDialog, setShowColumnDialog] = useState(false);
	const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
	const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
	const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null);
	const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const [cardFormData, setCardFormData] = useState({
		title: "",
		description: "",
		color: "#3b82f6",
		dueDate: "",
	});
	const [columnFormData, setColumnFormData] = useState({
		title: "",
	});

	const loadBoard = useCallback(async () => {
		try {
			const response = await fetch(`/api/kanban/boards/${boardId}`);
			const data = await response.json();

			if (!response.ok) {
				if (response.status === 404) {
					setError("Quadro não encontrado");
					return;
				}
				setError(data.error || "Erro ao carregar quadro");
				return;
			}

			setBoard(data.board);
		} catch (err) {
			console.error("Error loading board:", err);
			setError("Erro ao carregar quadro.");
		}
	}, [boardId]);

	const loadColumns = useCallback(async () => {
		if (!boardId) return;

		try {
			const columnsResponse = await fetch(
				`/api/kanban/columns?boardId=${boardId}`,
			);
			const columnsData = await columnsResponse.json();

			if (!columnsResponse.ok) {
				setError(columnsData.error || "Erro ao carregar colunas");
				return;
			}

			const cardsResponse = await fetch(`/api/kanban/cards?boardId=${boardId}`);
			const cardsData = await cardsResponse.json();

			if (!cardsResponse.ok) {
				setError(cardsData.error || "Erro ao carregar cartões");
				return;
			}

			const columnsWithCards = (columnsData.columns || [])
				.sort((a: KanbanColumn, b: KanbanColumn) => a.position - b.position)
				.map((column: KanbanColumn) => ({
					...column,
					cards: (cardsData.cards || [])
						.filter((card: KanbanCard) => card.column_id === column.id)
						.sort((a: KanbanCard, b: KanbanCard) => a.position - b.position),
				}));

			setColumns(columnsWithCards);
		} catch (err) {
			console.error("Error loading columns:", err);
			setError("Erro ao carregar colunas.");
		}
	}, [boardId]);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			await loadBoard();
			await loadColumns();
			setLoading(false);
		};
		loadData();
	}, [loadBoard, loadColumns]);

	const handleCreateCard = (columnId: string) => {
		setEditingCard(null);
		setSelectedColumnId(columnId);
		setCardFormData({
			title: "",
			description: "",
			color: "#3b82f6",
			dueDate: "",
		});
		setShowCardDialog(true);
	};

	const handleEditCard = (card: KanbanCard) => {
		setEditingCard(card);
		setSelectedColumnId(card.column_id);
		setCardFormData({
			title: card.title,
			description: card.description || "",
			color: card.color,
			dueDate: card.due_date
				? new Date(card.due_date).toISOString().slice(0, 10)
				: "",
		});
		setShowCardDialog(true);
	};

	const handleSaveCard = async () => {
		if (!selectedColumnId || !cardFormData.title.trim()) return;

		setSaving(true);
		try {
			const url = "/api/kanban/cards";
			const method = editingCard ? "PATCH" : "POST";

			const body = editingCard
				? {
						id: editingCard.id,
						title: cardFormData.title,
						description: cardFormData.description || null,
						color: cardFormData.color,
						dueDate: cardFormData.dueDate || null,
					}
				: {
						columnId: selectedColumnId,
						title: cardFormData.title,
						description: cardFormData.description || null,
						color: cardFormData.color,
						dueDate: cardFormData.dueDate || null,
						position:
							columns.find((col) => col.id === selectedColumnId)?.cards
								.length || 0,
					};

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro",
					description: data.error || "Erro ao salvar cartão",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Sucesso",
				description: editingCard ? "Cartão atualizado!" : "Cartão criado!",
			});

			setShowCardDialog(false);
			loadColumns();
		} catch (err) {
			console.error("Error saving card:", err);
			toast({
				title: "Erro",
				description: "Erro ao salvar cartão.",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteCard = async (cardId: string) => {
		if (!confirm("Tem certeza que deseja excluir este cartão?")) return;

		try {
			const response = await fetch(`/api/kanban/cards?id=${cardId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro",
					description: data.error || "Erro ao excluir cartão",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Sucesso",
				description: "Cartão excluído!",
			});

			loadColumns();
		} catch (err) {
			console.error("Error deleting card:", err);
			toast({
				title: "Erro",
				description: "Erro ao excluir cartão.",
				variant: "destructive",
			});
		}
	};

	const handleDeleteColumn = async (columnId: string) => {
		const column = columns.find((c) => c.id === columnId);
		if (!column) return;

		if (column.cards.length > 0) {
			toast({
				title: "Não é possível excluir",
				description: "Mova ou exclua os cartões desta coluna primeiro.",
				variant: "destructive",
			});
			return;
		}

		if (!confirm(`Tem certeza que deseja excluir a coluna "${column.title}"?`))
			return;

		try {
			const response = await fetch(`/api/kanban/columns?id=${columnId}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro",
					description: data.error || "Erro ao excluir coluna",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Sucesso",
				description: "Coluna excluída!",
			});

			loadColumns();
		} catch (err) {
			console.error("Error deleting column:", err);
			toast({
				title: "Erro",
				description: "Erro ao excluir coluna.",
				variant: "destructive",
			});
		}
	};

	const handleCreateColumn = () => {
		setColumnFormData({ title: "" });
		setShowColumnDialog(true);
	};

	const handleSaveColumn = async () => {
		if (!boardId || !columnFormData.title.trim()) return;

		setSaving(true);
		try {
			const response = await fetch("/api/kanban/columns", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					boardId: boardId,
					title: columnFormData.title,
					position: columns.length,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro",
					description: data.error || "Erro ao criar coluna",
					variant: "destructive",
				});
				return;
			}

			toast({
				title: "Sucesso",
				description: "Coluna criada!",
			});

			setShowColumnDialog(false);
			loadColumns();
		} catch (err) {
			console.error("Error creating column:", err);
			toast({
				title: "Erro",
				description: "Erro ao criar coluna.",
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDragStart = (e: React.DragEvent, card: KanbanCard) => {
		setDraggedCard(card);
		e.dataTransfer.effectAllowed = "move";
		setTimeout(() => {
			const element = e.target as HTMLElement;
			element.style.opacity = "0.5";
		}, 0);
	};

	const handleDragEnd = (e: React.DragEvent) => {
		const element = e.target as HTMLElement;
		element.style.opacity = "1";
		setDraggedCard(null);
		setDragOverColumnId(null);
	};

	const handleDragOver = (e: React.DragEvent, columnId: string) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverColumnId(columnId);
	};

	const handleDragLeave = () => {
		setDragOverColumnId(null);
	};

	const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
		e.preventDefault();
		setDragOverColumnId(null);

		if (!draggedCard) return;

		if (draggedCard.column_id === targetColumnId) {
			setDraggedCard(null);
			return;
		}

		const sourceColumnId = draggedCard.column_id;
		const newPosition =
			columns.find((col) => col.id === targetColumnId)?.cards.length || 0;

		setColumns((prevColumns) =>
			prevColumns.map((col) => {
				if (col.id === sourceColumnId) {
					return {
						...col,
						cards: col.cards.filter((c) => c.id !== draggedCard.id),
					};
				}
				if (col.id === targetColumnId) {
					return {
						...col,
						cards: [
							...col.cards,
							{
								...draggedCard,
								column_id: targetColumnId,
								position: newPosition,
							},
						],
					};
				}
				return col;
			}),
		);

		setDraggedCard(null);

		try {
			const response = await fetch("/api/kanban/cards", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: draggedCard.id,
					columnId: targetColumnId,
					position: newPosition,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast({
					title: "Erro ao mover cartão",
					description: data.details || data.error || "Tente novamente",
					variant: "destructive",
				});
				loadColumns();
				return;
			}

			toast({
				title: "Cartão movido",
				description: "Cartão movido com sucesso!",
			});
		} catch (err) {
			console.error("Error moving card:", err);
			toast({
				title: "Erro",
				description: "Erro ao mover cartão. Recarregando...",
				variant: "destructive",
			});
			loadColumns();
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8 flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="text-muted-foreground">Carregando quadro...</p>
				</div>
			</div>
		);
	}

	if (error || !board) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
				<div className="max-w-2xl mx-auto">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Erro</AlertTitle>
						<AlertDescription className="flex flex-col gap-4">
							<span>{error || "Quadro não encontrado"}</span>
							<Button
								variant="outline"
								size="sm"
								asChild
								className="w-fit bg-transparent"
							>
								<Link href="/kanban">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Voltar para Quadros
								</Link>
							</Button>
						</AlertDescription>
					</Alert>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
			<div className="max-w-[1800px] mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild>
							<Link href="/kanban">
								<ArrowLeft className="h-5 w-5" />
							</Link>
						</Button>
						<div>
							<h1 className="text-3xl md:text-4xl font-bold">{board.title}</h1>
							{board.description && (
								<p className="text-muted-foreground mt-1">
									{board.description}
								</p>
							)}
						</div>
					</div>
					<Button onClick={handleCreateColumn} size="lg">
						<Plus className="h-5 w-5 mr-2" />
						Nova Coluna
					</Button>
				</div>

				{/* Kanban Board */}
				<div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
					{columns.map((column) => (
						<div
							key={column.id}
							className={cn(
								"flex-shrink-0 w-80 transition-all duration-200",
								dragOverColumnId === column.id && "scale-[1.02]",
							)}
							onDragOver={(e) => handleDragOver(e, column.id)}
							onDragLeave={handleDragLeave}
							onDrop={(e) => handleDrop(e, column.id)}
						>
							<Card
								className={cn(
									"p-4 flex flex-col transition-colors duration-200",
									dragOverColumnId === column.id &&
										"ring-2 ring-primary bg-primary/5",
								)}
							>
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center gap-2">
										<GripVertical className="h-4 w-4 text-muted-foreground" />
										<h3 className="font-semibold text-lg">{column.title}</h3>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
											{column.cards.length}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-muted-foreground hover:text-destructive"
											onClick={() => handleDeleteColumn(column.id)}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</div>

								<div className="space-y-3 flex-1 overflow-y-auto">
									{column.cards.map((card) => (
										<Card
											key={card.id}
											className={cn(
												"p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200",
												draggedCard?.id === card.id && "opacity-50 scale-95",
											)}
											draggable
											onDragStart={(e) => handleDragStart(e, card)}
											onDragEnd={handleDragEnd}
											style={{ borderLeft: `4px solid ${card.color}` }}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-sm mb-1 truncate">
														{card.title}
													</h4>
													{card.description && (
														<p className="text-xs text-muted-foreground line-clamp-2">
															{card.description}
														</p>
													)}
													{card.due_date && (
														<p className="text-xs text-muted-foreground mt-2">
															Prazo:{" "}
															{new Date(card.due_date).toLocaleDateString(
																"pt-BR",
															)}
														</p>
													)}
												</div>
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6"
														onClick={() => handleEditCard(card)}
													>
														<Edit className="h-3 w-3" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 text-destructive"
														onClick={() => handleDeleteCard(card.id)}
													>
														<Trash2 className="h-3 w-3" />
													</Button>
												</div>
											</div>
										</Card>
									))}

									{draggedCard &&
										dragOverColumnId === column.id &&
										draggedCard.column_id !== column.id && (
											<div className="border-2 border-dashed border-primary/50 rounded-lg p-4 text-center text-sm text-muted-foreground bg-primary/5">
												Solte aqui
											</div>
										)}
								</div>

								<Button
									variant="ghost"
									className="w-full mt-4"
									onClick={() => handleCreateCard(column.id)}
								>
									<Plus className="h-4 w-4 mr-2" />
									Adicionar Cartão
								</Button>
							</Card>
						</div>
					))}

					{columns.length === 0 && (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<p className="text-muted-foreground mb-4">
									Este quadro ainda não tem colunas
								</p>
								<Button onClick={handleCreateColumn}>
									<Plus className="h-4 w-4 mr-2" />
									Criar Primeira Coluna
								</Button>
							</div>
						</div>
					)}
				</div>

				{/* Card Dialog */}
				<Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingCard ? "Editar Cartão" : "Novo Cartão"}
							</DialogTitle>
							<DialogDescription>
								{editingCard
									? "Atualize as informações do cartão"
									: "Adicione um novo cartão à coluna"}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="cardTitle">Título</Label>
								<Input
									id="cardTitle"
									placeholder="Título do cartão"
									value={cardFormData.title}
									onChange={(e) =>
										setCardFormData((prev) => ({
											...prev,
											title: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cardDescription">Descrição</Label>
								<Textarea
									id="cardDescription"
									placeholder="Descrição do cartão"
									value={cardFormData.description}
									onChange={(e) =>
										setCardFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<Label>Cor</Label>
								<div className="flex gap-2">
									{COLORS.map((color) => (
										<button
											key={color.value}
											type="button"
											className={cn(
												"w-8 h-8 rounded-full border-2 transition-all",
												cardFormData.color === color.value
													? "border-foreground scale-110"
													: "border-transparent",
											)}
											style={{ backgroundColor: color.value }}
											onClick={() =>
												setCardFormData((prev) => ({
													...prev,
													color: color.value,
												}))
											}
											title={color.label}
										/>
									))}
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cardDueDate">Data de Prazo</Label>
								<Input
									id="cardDueDate"
									type="date"
									value={cardFormData.dueDate}
									onChange={(e) =>
										setCardFormData((prev) => ({
											...prev,
											dueDate: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowCardDialog(false)}
							>
								Cancelar
							</Button>
							<Button
								onClick={handleSaveCard}
								disabled={saving || !cardFormData.title.trim()}
							>
								{saving ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : null}
								{editingCard ? "Salvar" : "Criar"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Column Dialog */}
				<Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Nova Coluna</DialogTitle>
							<DialogDescription>
								Adicione uma nova coluna ao quadro
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="columnTitle">Título</Label>
								<Input
									id="columnTitle"
									placeholder="Ex: Em Revisão"
									value={columnFormData.title}
									onChange={(e) =>
										setColumnFormData((prev) => ({
											...prev,
											title: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setShowColumnDialog(false)}
							>
								Cancelar
							</Button>
							<Button
								onClick={handleSaveColumn}
								disabled={saving || !columnFormData.title.trim()}
							>
								{saving ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Plus className="h-4 w-4 mr-2" />
								)}
								Criar Coluna
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
