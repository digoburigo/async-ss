import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";

import { authClient } from "~/clients/auth-client";
import { BoardCard } from "./board-card";

export function BoardsList() {
	const { data: activeOrganization } = authClient.useActiveOrganization();
	const client = useClientQueries(schema);

	const { data: boards = [], isFetching } = client.kanbanBoard.useFindMany(
		{
			include: {
				columns: {
					include: {
						cards: true,
					},
				},
			},
		},
		{
			enabled: !!activeOrganization?.id,
		},
	);

	if (isFetching) {
		return (
			<div className="flex flex-1 items-center justify-center py-8">
				<p>Carregando quadros...</p>
			</div>
		);
	}

	if (boards.length === 0) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
				<p className="text-lg font-semibold">Nenhum quadro encontrado</p>
				<p className="text-muted-foreground mt-2">
					Crie seu primeiro quadro para começar a organizar suas tarefas.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{boards.map((board) => (
				<BoardCard key={board.id} board={board} />
			))}
		</div>
	);
}
