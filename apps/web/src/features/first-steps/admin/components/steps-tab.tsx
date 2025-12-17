import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import {
  Clock,
  Edit2,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { schema } from "@acme/zen-v3/zenstack/schema";

import { authClient } from "~/clients/auth-client";
import { useAdmin } from "./admin-provider";

export function StepsTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);
  const {
    setOpen,
    setCurrentStep,
    setCurrentJobType,
    selectedJobTypeId,
    setSelectedJobTypeId,
  } = useAdmin();

  // Fetch all job types for selector
  const { data: jobTypes = [] } = client.firstStepsJobType.useFindMany(
    {
      where: { active: true },
      orderBy: { orderIndex: "asc" },
    },
    {
      enabled: !!activeOrganization?.id,
    }
  );

  // Fetch steps for selected job type
  const { data: steps = [], isFetching } = client.firstStepsItem.useFindMany(
    {
      where: {
        jobTypeId: selectedJobTypeId || "",
      },
      orderBy: { orderIndex: "asc" },
    },
    {
      enabled: !!selectedJobTypeId,
    }
  );

  const handleCreate = () => {
    if (!selectedJobTypeId) return;
    const jobType = jobTypes.find((jt) => jt.id === selectedJobTypeId);
    if (jobType) {
      setCurrentJobType(jobType);
    }
    setCurrentStep(null);
    setOpen("create-step");
  };

  const handleEdit = (step: (typeof steps)[0]) => {
    const jobType = jobTypes.find((jt) => jt.id === selectedJobTypeId);
    if (jobType) {
      setCurrentJobType(jobType);
    }
    setCurrentStep(step);
    setOpen("update-step");
  };

  const handleDelete = (step: (typeof steps)[0]) => {
    setCurrentStep(step);
    setOpen("delete-step");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Passos</h3>
          <p className="text-muted-foreground text-sm">
            Configure os passos de onboarding para cada cargo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={setSelectedJobTypeId}
            value={selectedJobTypeId || ""}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione um cargo" />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((jobType) => (
                <SelectItem key={jobType.id} value={jobType.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: jobType.color }}
                    />
                    {jobType.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button disabled={!selectedJobTypeId} onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Passo
          </Button>
        </div>
      </div>

      {!selectedJobTypeId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h4 className="font-medium">Selecione um cargo</h4>
            <p className="text-muted-foreground mt-1 text-center text-sm">
              Escolha um cargo acima para visualizar e gerenciar seus passos.
            </p>
          </CardContent>
        </Card>
      ) : isFetching ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando passos...</p>
        </div>
      ) : steps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h4 className="font-medium">Nenhum passo cadastrado</h4>
            <p className="text-muted-foreground mt-1 text-center text-sm">
              Crie o primeiro passo para este cargo.
            </p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro passo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-base">{step.title}</CardTitle>
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!step.active ? (
                      <Badge variant="secondary">Inativo</Badge>
                    ) : null}
                    <Button
                      onClick={() => handleEdit(step)}
                      size="icon"
                      variant="ghost"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(step)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                  {step.estimatedMinutes ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.estimatedMinutes} min
                    </span>
                  ) : null}
                  {step.linkType !== "none" && step.linkUrl ? (
                    <span className="flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {step.linkLabel || "Link"}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
