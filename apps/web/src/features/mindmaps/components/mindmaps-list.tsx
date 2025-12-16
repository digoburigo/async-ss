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
    }
  );

  const filteredMindmaps = mindmaps.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Map className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="font-semibold text-lg">Nenhum mapa mental ainda</p>
        <p className="mt-2 text-muted-foreground">
          Crie seu primeiro mapa mental para visualizar os fluxos de trabalho da
          empresa
        </p>
        <Button
          className="mt-4 gap-2"
          onClick={() => setOpen("create-mindmap")}
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
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar mapas mentais..."
            value={searchTerm}
          />
        </div>
        <Button className="gap-2" onClick={() => setOpen("create-mindmap")}>
          <Plus className="h-4 w-4" />
          Novo Mapa Mental
        </Button>
      </div>

      {filteredMindmaps.length === 0 && searchTerm ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16">
            <Map className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Nenhum mapa mental encontrado
            </h3>
            <p className="mb-4 max-w-sm text-center text-muted-foreground">
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
