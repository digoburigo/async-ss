import { Button } from "@acme/ui/base-ui/button";
import { Card } from "@acme/ui/base-ui/card";
import { Input } from "@acme/ui/base-ui/input";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Map, Plus, Search } from "lucide-react";
import { useState } from "react";

import { authClient } from "~/clients/auth-client";
import { MindmapCard } from "./mindmap-card";
import { useMindmaps } from "./mindmaps-provider";

export function MindmapsList() {
	const { data: activeOrganization } = authClient.useActiveOrganization();
	const client = useClientQueries(schema);
	const { setOpen } = useMindmaps();
	const [searchTerm, setSearchTerm] = useState("");

	const { data: mindmaps = [], isFetching } = client.mindmap.useFindMany(
		{},
		{
			enabled: !!activeOrganization?.id,
		},
	);

	const filteredMindmaps = mindmaps.filter(
		(m) =>
			m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			m.description?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	if (isFetching) {
		return (
			<div className="flex flex-1 items-center justify-center py-8">
				<p>Carregando mapas mentais...</p>
			</div>
		);
	}

	if (filteredMindmaps.length === 0 && !searchTerm) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
				<Map className="h-12 w-12 text-muted-foreground mb-4" />
				<p className="text-lg font-semibold">Nenhum mapa mental ainda</p>
				<p className="text-muted-foreground mt-2">
					Crie seu primeiro mapa mental para visualizar os fluxos de trabalho da
					empresa
				</p>
				<Button
					onClick={() => setOpen("create-mindmap")}
					className="mt-4 gap-2"
				>
					<Plus className="h-4 w-4" />
					Criar Mapa Mental
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative max-w-md flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar mapas mentais..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Button onClick={() => setOpen("create-mindmap")} className="gap-2">
					<Plus className="h-4 w-4" />
					Novo Mapa Mental
				</Button>
			</div>

			{filteredMindmaps.length === 0 && searchTerm ? (
				<Card className="border-dashed">
					<div className="flex flex-col items-center justify-center py-16">
						<Map className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Nenhum mapa mental encontrado
						</h3>
						<p className="text-muted-foreground text-center mb-4 max-w-sm">
							Tente buscar por outro termo
						</p>
					</div>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{filteredMindmaps.map((mindmap) => (
						<MindmapCard key={mindmap.id} mindmap={mindmap} />
					))}
				</div>
			)}
		</div>
	);
}
