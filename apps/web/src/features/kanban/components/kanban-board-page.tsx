import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanColumnHandle,
	KanbanItem,
	KanbanOverlay,
} from "@acme/ui/custom/kanban";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import type { KanbanCard as KanbanCardModel } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Link } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import {
	ArrowLeft,
	Edit2,
	GripVertical,
	MoreVertical,
	Plus,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { authClient } from "~/clients/auth-client";
import { KanbanDialogs } from "./kanban-dialogs";
import type { BoardWithColumns, ColumnWithCards } from "./kanban-provider";
import { useKanban } from "./kanban-provider";
import { KanbanTaskCard } from "./kanban-task-card";

type KanbanBoardPageProps = {
	boardId: string;
};

export function KanbanBoardPage({ boardId }: KanbanBoardPageProps) {
	const { data: activeOrganization } = authClient.useActiveOrganization();
	const client = useClientQueries(schema);
	const { setOpen, setCurrentColumn, setCurrentBoard } = useKanban();
	const [activeId, setActiveId] = useState<string | null>(null);
	// Local state for visual preview during drag (cards within columns)
	const [localColumns, setLocalColumns] = useState<
		Record<string, KanbanCardModel[]>
	>({});
	// Local state for column order (prevents flicker on column reorder)
	const [localColumnOrder, setLocalColumnOrder] = useState<string[]>([]);
	// Track original state before drag for server updates
	const dragStartStateRef = useRef<Record<string, KanbanCardModel[]> | null>(
		null,
	);
	const dragStartColumnOrderRef = useRef<string[] | null>(null);
	// Track if we're waiting for server to confirm drop (prevents flicker)
	const isDropPendingRef = useRef(false);

	const { data: boardData, isLoading } = client.kanbanBoard.useFindUnique(
		{
			where: { id: boardId },
			include: {
				columns: {
					include: {
						cards: true,
					},
					orderBy: {
						position: "asc",
					},
				},
			},
		},
		{
			enabled: !!activeOrganization?.id && !!boardId,
		},
	);

	// Cast to proper type with relations
	const board = boardData as BoardWithColumns | undefined;

	// Transform data into format expected by Kanban component
	const serverKanbanData = useMemo(() => {
		if (!board?.columns) return {};

		const data: Record<string, KanbanCardModel[]> = {};
		for (const column of board.columns) {
			data[column.id] = column.cards
				? [...column.cards].sort(
						(a: KanbanCardModel, b: KanbanCardModel) => a.position - b.position,
					)
				: [];
		}
		return data;
	}, [board]);

	// Get server column order
	const serverColumnOrder = useMemo(() => {
		if (!board?.columns) return [];
		return [...board.columns]
			.sort((a, b) => a.position - b.position)
			.map((col) => col.id);
	}, [board]);

	// Sync local state with server data when not dragging and no drop pending
	useEffect(() => {
		// Don't sync during drag or while waiting for server to confirm drop
		if (activeId || isDropPendingRef.current) return;
		setLocalColumns(serverKanbanData);
		setLocalColumnOrder(serverColumnOrder);
	}, [serverKanbanData, serverColumnOrder, activeId]);

	// Reset drop pending flag when server data changes (mutation completed)
	useEffect(() => {
		if (isDropPendingRef.current) {
			isDropPendingRef.current = false;
		}
	}, [serverKanbanData, serverColumnOrder]);

	// Mutations with optimistic updates
	const { mutate: updateColumnPosition } = client.kanbanColumn.useUpdate({
		optimisticUpdate: true,
		onError: (error) => {
			toast.error(`Erro ao atualizar posição da coluna: ${error.message}`);
		},
	});

	const { mutate: updateCardPosition } = client.kanbanCard.useUpdate({
		optimisticUpdate: true,
		onError: (error) => {
			toast.error(`Erro ao atualizar posição do card: ${error.message}`);
		},
	});

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
		// Capture the state at drag start for comparison on drop
		dragStartStateRef.current = serverKanbanData;
		dragStartColumnOrderRef.current = serverColumnOrder;
	};

	// Handle visual updates during drag (doesn't persist to server)
	const handleValueChange = (newColumns: Record<string, KanbanCardModel[]>) => {
		// Update card positions within columns
		setLocalColumns(newColumns);

		// Update column order if columns were reordered
		const newColumnIds = Object.keys(newColumns);
		if (
			newColumnIds.length > 0 &&
			newColumnIds.length === localColumnOrder.length
		) {
			// Check if this is a column reorder (same columns, different order in the record)
			const isColumnReorder = localColumnOrder.every((id) => id in newColumns);
			if (isColumnReorder) {
				// The Kanban component updates the Record order when columns are dragged
				// We need to extract the new order from the Record keys
				setLocalColumnOrder(newColumnIds);
			}
		}
	};

	// Only persist changes on drag end (when user releases)
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const originalState = dragStartStateRef.current;
		const originalColumnOrder = dragStartColumnOrderRef.current;

		// Reset refs
		setActiveId(null);
		dragStartStateRef.current = null;
		dragStartColumnOrderRef.current = null;

		if (!over || !board || !originalState || !originalColumnOrder) return;

		// Mark drop as pending to prevent flicker (sync will be skipped until server responds)
		isDropPendingRef.current = true;

		// Column reordering
		if (active.id in localColumns && over.id in localColumns) {
			const activeIndex = originalColumnOrder.indexOf(active.id as string);
			const overIndex = originalColumnOrder.indexOf(over.id as string);

			if (activeIndex === overIndex) {
				isDropPendingRef.current = false;
				return;
			}

			// Compute the new column order using arrayMove
			const newOrder = arrayMove(originalColumnOrder, activeIndex, overIndex);

			// Update local state immediately for visual feedback (prevents flicker)
			setLocalColumnOrder(newOrder);

			// Update positions for all columns based on new order
			for (let i = 0; i < newOrder.length; i++) {
				const columnId = newOrder[i];
				const column = board.columns.find((c) => c.id === columnId);
				if (column && column.position !== i) {
					updateColumnPosition({
						data: { position: i },
						where: { id: columnId },
					});
				}
			}
			return;
		}

		// Find where the card was originally and where it is now
		const originalColumnId = Object.keys(originalState).find((colId) =>
			originalState[colId]?.some((card) => card.id === active.id),
		);
		const newColumnId = Object.keys(localColumns).find((colId) =>
			localColumns[colId]?.some((card) => card.id === active.id),
		);

		if (!originalColumnId || !newColumnId) {
			isDropPendingRef.current = false;
			return;
		}

		const originalColumn = board.columns.find(
			(col) => col.id === originalColumnId,
		);
		if (!originalColumn) {
			isDropPendingRef.current = false;
			return;
		}

		const activeCard = originalColumn.cards?.find(
			(card) => card.id === active.id,
		);
		if (!activeCard) {
			isDropPendingRef.current = false;
			return;
		}

		// Get the new position from localColumns
		const newColumnCards = localColumns[newColumnId] ?? [];
		const newPosition = newColumnCards.findIndex(
			(card) => card.id === active.id,
		);

		if (newPosition === -1) {
			isDropPendingRef.current = false;
			return;
		}

		// Same column - reordering
		if (originalColumnId === newColumnId) {
			const originalCards = originalState[originalColumnId] ?? [];
			const originalPosition = originalCards.findIndex(
				(card) => card.id === active.id,
			);

			if (originalPosition === newPosition) {
				isDropPendingRef.current = false;
				return;
			}

			// Update positions for all cards in the column based on new order
			for (let i = 0; i < newColumnCards.length; i++) {
				const card = newColumnCards[i];
				if (card && card.position !== i) {
					updateCardPosition({
						data: { position: i },
						where: { id: card.id },
					});
				}
			}
		} else {
			// Different column - move card
			// Update moved card with new column and position
			updateCardPosition({
				data: {
					columnId: newColumnId,
					position: newPosition,
				},
				where: { id: activeCard.id },
			});

			// Update positions in source column
			const sourceCards = localColumns[originalColumnId] ?? [];
			for (let i = 0; i < sourceCards.length; i++) {
				const card = sourceCards[i];
				if (card && card.position !== i) {
					updateCardPosition({
						data: { position: i },
						where: { id: card.id },
					});
				}
			}

			// Update positions in target column
			for (let i = 0; i < newColumnCards.length; i++) {
				const card = newColumnCards[i];
				if (card && card.id !== activeCard.id && card.position !== i) {
					updateCardPosition({
						data: { position: i },
						where: { id: card.id },
					});
				}
			}
		}
	};

	const handleAddColumn = () => {
		if (!board) return;
		setCurrentBoard(board);
		setCurrentColumn(null);
		setOpen("create-column");
	};

	const handleAddCard = (column: ColumnWithCards) => {
		setCurrentColumn(column);
		setOpen("create-card");
	};

	const handleEditColumn = (column: ColumnWithCards, e?: React.MouseEvent) => {
		e?.stopPropagation();
		e?.preventDefault();
		setCurrentBoard(board);
		setCurrentColumn(column);
		setOpen("update-column");
	};

	const handleDeleteColumn = (
		column: ColumnWithCards,
		e?: React.MouseEvent,
	) => {
		e?.stopPropagation();
		e?.preventDefault();
		setCurrentBoard(board);
		setCurrentColumn(column);
		setOpen("delete-column");
	};

	// Only show loading on initial load, not on refetch
	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<p>Carregando quadro...</p>
			</div>
		);
	}

	if (!board) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold">Quadro não encontrado</h2>
					<p className="text-muted-foreground mt-2">
						O quadro que você está procurando não existe ou foi removido.
					</p>
					<Button asChild className="mt-4" variant="outline">
						<Link to="/kanban">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar para quadros
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<Button asChild variant="ghost" size="sm" className="mb-2">
						<Link to="/kanban">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar
						</Link>
					</Button>
					<h1 className="text-3xl font-bold tracking-tight">{board.title}</h1>
					{board.description && (
						<p className="text-muted-foreground mt-1">{board.description}</p>
					)}
				</div>
				<Button onClick={handleAddColumn}>
					<Plus className="mr-2 h-4 w-4" />
					Adicionar Coluna
				</Button>
			</div>

			<div className="flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden">
				<Kanban
					value={localColumns}
					onValueChange={handleValueChange}
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					getItemValue={(item) => item.id}
					orientation="horizontal"
				>
					<KanbanBoard className="h-full w-max gap-4">
						{localColumnOrder.length > 0
							? localColumnOrder.map((columnId) => {
									const column = board.columns.find((c) => c.id === columnId);
									if (!column) return null;
									const cards = localColumns[columnId] ?? [];
									return (
										<KanbanColumn
											key={column.id}
											value={column.id}
											className="w-[300px] min-w-[300px] p-2.5"
										>
											{/* Column Header */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span className="text-sm font-semibold">
														{column.title}
													</span>
													<Badge
														variant="secondary"
														className="pointer-events-none rounded-sm"
													>
														{cards.length}
													</Badge>
												</div>
												<div className="flex items-center gap-1">
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => handleAddCard(column)}
													>
														<Plus className="h-4 w-4" />
													</Button>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-7 w-7"
															>
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={(e) => handleEditColumn(column, e)}
															>
																<Edit2 className="mr-2 h-4 w-4" />
																Renomear
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={(e) => handleDeleteColumn(column, e)}
																className="text-destructive"
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Excluir
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
													<KanbanColumnHandle asChild>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7"
														>
															<GripVertical className="h-4 w-4" />
														</Button>
													</KanbanColumnHandle>
												</div>
											</div>

											{/* Cards Container */}
											<div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-2">
												{cards.map((card) => (
													<KanbanItem key={card.id} value={card.id} asHandle>
														<KanbanTaskCard card={card} column={column} />
													</KanbanItem>
												))}
											</div>
										</KanbanColumn>
									);
								})
							: null}
					</KanbanBoard>
					<KanbanOverlay>
						{({ value, variant }) =>
							variant === "column" ? (
								// Column overlay
								<div className="bg-primary/10 size-full rounded-md" />
							) : (
								// Card overlay - show actual card for better feedback
								(() => {
									const card = Object.values(localColumns)
										.flat()
										.find((c) => c.id === value);
									if (!card) {
										return (
											<div className="bg-primary/10 size-full rounded-md" />
										);
									}
									// Find the column that contains this card
									const cardColumn = board.columns.find((col) =>
										col.cards?.some((c) => c.id === card.id),
									);
									return <KanbanTaskCard card={card} column={cardColumn} />;
								})()
							)
						}
					</KanbanOverlay>
				</Kanban>
			</div>
			<KanbanDialogs />
		</div>
	);
}
