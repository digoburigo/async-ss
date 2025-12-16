import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/base-ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/base-ui/dropdown-menu";
import type { Mindmap } from "@acme/zen-v3/zenstack/models";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Edit2, Map, MoreVertical, Trash2 } from "lucide-react";

import { useMindmaps } from "./mindmaps-provider";

type MindmapCardProps = {
  mindmap: Mindmap;
};

export function MindmapCard({ mindmap }: MindmapCardProps) {
  const { setOpen, setCurrentMindmap } = useMindmaps();
  const nodes = Array.isArray(mindmap.nodes) ? mindmap.nodes : [];
  const nodeCount = nodes.length;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentMindmap(mindmap);
    setOpen("update-mindmap");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentMindmap(mindmap);
    setOpen("delete-mindmap");
  };

  return (
    <Link
      className="block"
      params={{ mindmapId: mindmap.id }}
      to="/mindmaps/$mindmapId"
    >
      <Card className="group relative cursor-pointer transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <CardTitle className="line-clamp-1">{mindmap.title}</CardTitle>
              {mindmap.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {mindmap.description}
                </CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  type="button"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span>
                {nodeCount} nó{nodeCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(mindmap.updatedAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
