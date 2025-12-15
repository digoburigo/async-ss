import { createFileRoute } from "@tanstack/react-router";

import { KanbanBoards } from "~/features/kanban";

export const Route = createFileRoute("/_authenticated/kanban/")({
	component: RouteComponent,
});

export default function RouteComponent() {
	return <KanbanBoards />;
}
