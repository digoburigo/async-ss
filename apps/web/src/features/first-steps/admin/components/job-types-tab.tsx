import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Edit2, Plus, Trash2, Users } from "lucide-react";

import { authClient } from "~/clients/auth-client";
import { useAdmin } from "./admin-provider";

export function JobTypesTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);
  const { setOpen, setCurrentJobType } = useAdmin();

  const { data: jobTypes = [], isFetching } =
    client.firstStepsJobType.useFindMany(
      {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: {
            select: {
              members: true,
              steps: true,
            },
          },
        },
      },
      {
        enabled: !!activeOrganization?.id,
      }
    );

  const handleCreate = () => {
    setCurrentJobType(null);
    setOpen("create-job-type");
  };

  const handleEdit = (jobType: (typeof jobTypes)[0]) => {
    setCurrentJobType(jobType);
    setOpen("update-job-type");
  };

  const handleDelete = (jobType: (typeof jobTypes)[0]) => {
    setCurrentJobType(jobType);
    setOpen("delete-job-type");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando cargos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Cargos / Funções</h3>
          <p className="text-muted-foreground text-sm">
            Gerencie os tipos de cargo e suas configurações
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>

      {jobTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h4 className="font-medium">Nenhum cargo cadastrado</h4>
            <p className="mt-1 text-center text-muted-foreground text-sm">
              Crie o primeiro cargo para começar a configurar os primeiros
              passos.
            </p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro cargo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobTypes.map((jobType) => (
            <Card key={jobType.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: jobType.color }}
                    />
                    <CardTitle className="text-base">{jobType.name}</CardTitle>
                  </div>
                  {jobType.active ? null : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {jobType.description ? (
                  <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
                    {jobType.description}
                  </p>
                ) : null}
                <div className="mb-3 flex gap-4 text-muted-foreground text-sm">
                  <span>{jobType._count?.steps ?? 0} passos</span>
                  <span>{jobType._count?.members ?? 0} membros</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(jobType)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit2 className="mr-1 h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDelete(jobType)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="mr-1 h-3 w-3 text-destructive" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
