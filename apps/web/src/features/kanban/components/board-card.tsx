import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@acme/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import type { KanbanBoard } from "@acme/zen-v3/zenstack/models";
import { Link } from "@tanstack/react-router";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";

import { useKanban } from "./kanban-provider";

type BoardCardProps = {
	board: KanbanBoard;
};

export function BoardCard({ board }: BoardCardProps) {
	const { setOpen, setCurrentBoard } = useKanban();
	const columnCount = board.columns?.length ?? 0;
	const cardCount =
		board.columns?.reduce((sum, col) => sum + (col.cards?.length ?? 0), 0) ?? 0;

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setCurrentBoard(board);
		setOpen("update-board");
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		setCurrentBoard(board);
		setOpen("delete-board");
	};

	return (
		<Link
			to="/kanban/$boardId"
			params={{ boardId: board.id }}
			className="block"
		>
			<Card className="group relative cursor-pointer transition-shadow hover:shadow-md">
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<CardTitle className="line-clamp-1">{board.title}</CardTitle>
							{board.description && (
								<CardDescription className="mt-1 line-clamp-2">
									{board.description}
								</CardDescription>
							)}
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="opacity-0 transition-opacity group-hover:opacity-100"
									onClick={(e) => e.stopPropagation()}
								>
									<MoreVertical className="h-4 w-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleEdit}>
									<Edit2 className="mr-2 h-4 w-4" />
									Editar
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={handleDelete}
									className="text-destructive"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Excluir
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground flex items-center gap-4 text-sm">
						<span>
							{columnCount} coluna{columnCount !== 1 ? "s" : ""}
						</span>
						<span>
							{cardCount} card{cardCount !== 1 ? "s" : ""}
						</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
