import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Field } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";
import type { FeedbackDepartment } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useForm } from "@tanstack/react-form";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Building2, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";

export function FeedbackDepartments() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<FeedbackDepartment | null>(null);

  const client = useClientQueries(schema);

  const { data: departments = [], isLoading } =
    client.feedbackDepartment.useFindMany({
      orderBy: { orderIndex: "asc" },
    });

  const { mutate: createDepartment, isPending: isCreating } =
    client.feedbackDepartment.useCreate({
      onSuccess: () => {
        toast.success("Departamento criado com sucesso");
        setDialogOpen(false);
        form.reset();
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao criar departamento");
      },
    });

  const { mutate: updateDepartment, isPending: isUpdating } =
    client.feedbackDepartment.useUpdate({
      onSuccess: () => {
        toast.success("Departamento atualizado com sucesso");
        setDialogOpen(false);
        setEditingDepartment(null);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao atualizar departamento");
      },
    });

  const { mutate: deleteDepartment } = client.feedbackDepartment.useDelete({
    onSuccess: () => {
      toast.success("Departamento excluido com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir departamento");
    },
  });

  const form = useForm({
    defaultValues: {
      name: editingDepartment?.name ?? "",
      description: editingDepartment?.description ?? "",
      email: editingDepartment?.email ?? "",
      phone: editingDepartment?.phone ?? "",
      color: editingDepartment?.color ?? "#6366f1",
      defaultSlaHours: editingDepartment?.defaultSlaHours ?? 72,
      active: editingDepartment?.active ?? true,
    },
    onSubmit: async ({ value }) => {
      if (editingDepartment) {
        updateDepartment({
          where: { id: editingDepartment.id },
          data: {
            name: value.name,
            description: value.description || null,
            email: value.email || null,
            phone: value.phone || null,
            color: value.color,
            defaultSlaHours: value.defaultSlaHours,
            active: value.active,
          },
        });
      } else {
        createDepartment({
          data: {
            name: value.name,
            description: value.description || null,
            email: value.email || null,
            phone: value.phone || null,
            color: value.color,
            defaultSlaHours: value.defaultSlaHours,
            active: value.active,
            orderIndex: departments.length,
            organizationId: activeOrganization?.id,
          },
        });
      }
    },
  });

  const openCreateDialog = () => {
    setEditingDepartment(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (department: FeedbackDepartment) => {
    setEditingDepartment(department);
    form.setFieldValue("name", department.name);
    form.setFieldValue("description", department.description ?? "");
    form.setFieldValue("email", department.email ?? "");
    form.setFieldValue("phone", department.phone ?? "");
    form.setFieldValue("color", department.color);
    form.setFieldValue("defaultSlaHours", department.defaultSlaHours);
    form.setFieldValue("active", department.active);
    setDialogOpen(true);
  };

  const isPending = isCreating || isUpdating;

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">Departamentos</h2>
            <p className="text-muted-foreground">
              Gerencie os departamentos responsaveis pelos feedbacks.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Departamento
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : departments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                Nenhum departamento cadastrado
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Departamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <Card key={department.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: department.color }}
                      />
                      <CardTitle className="text-lg">
                        {department.name}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={department.active ? "default" : "secondary"}
                    >
                      {department.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  {department.description && (
                    <CardDescription>{department.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-muted-foreground text-sm">
                    {department.email && <p>Email: {department.email}</p>}
                    {department.phone && <p>Telefone: {department.phone}</p>}
                    <p>SLA Padrao: {department.defaultSlaHours}h</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => openEditDialog(department)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      className="text-destructive"
                      onClick={() => {
                        if (
                          confirm(
                            "Tem certeza que deseja excluir este departamento?"
                          )
                        ) {
                          deleteDepartment({ where: { id: department.id } });
                        }
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Editar Departamento" : "Novo Departamento"}
            </DialogTitle>
            <DialogDescription>
              {editingDepartment
                ? "Atualize as informacoes do departamento."
                : "Preencha os dados para criar um novo departamento."}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="name">
              {(field) => (
                <Field>
                  <Label>Nome *</Label>
                  <Input
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Nome do departamento"
                    value={field.state.value}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <Label>Descricao</Label>
                  <Textarea
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Descricao do departamento"
                    value={field.state.value}
                  />
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <Label>Email</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="email@exemplo.com"
                      type="email"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <Field>
                    <Label>Telefone</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="(00) 0000-0000"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="color">
                {(field) => (
                  <Field>
                    <Label>Cor</Label>
                    <div className="flex gap-2">
                      <Input
                        className="w-16"
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="color"
                        value={field.state.value}
                      />
                      <Input
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="#6366f1"
                        value={field.state.value}
                      />
                    </div>
                  </Field>
                )}
              </form.Field>

              <form.Field name="defaultSlaHours">
                {(field) => (
                  <Field>
                    <Label>SLA Padrao (horas)</Label>
                    <Input
                      min={1}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      type="number"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="active">
              {(field) => (
                <Field className="flex items-center justify-between">
                  <Label>Ativo</Label>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>

            <DialogFooter>
              <Button
                disabled={isPending}
                onClick={() => setDialogOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isPending} type="submit">
                {isPending
                  ? "Salvando..."
                  : editingDepartment
                    ? "Salvar"
                    : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
