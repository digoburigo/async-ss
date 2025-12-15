import { createFileRoute } from "@tanstack/react-router";

import { Calendar } from "~/features/calendar";

export const Route = createFileRoute("/_authenticated/calendar/")({
	component: RouteComponent,
});

export default function RouteComponent() {
	return <Calendar />;
}
