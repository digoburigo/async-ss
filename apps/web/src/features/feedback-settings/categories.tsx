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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Switch } from "@acme/ui/switch";
import { Textarea } from "@acme/ui/textarea";
import type { FeedbackCategory } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useForm } from "@tanstack/react-form";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Edit, FolderOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";

export function FeedbackCategories() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FeedbackCategory | null>(null);

  const client = useClientQueries(schema);

  const { data: categories = [], isLoading } =
    client.feedbackCategory.useFindMany({
      orderBy: { orderIndex: "asc" },
      include: { department: true, subcategories: true },
    });

  const { data: departments = [] } = client.feedbackDepartment.useFindMany({
    where: { active: true },
    orderBy: { orderIndex: "asc" },
  });

  const { mutate: createCategory, isPending: isCreating } =
    client.feedbackCategory.useCreate({
      onSuccess: () => {
        toast.success("Categoria criada com sucesso");
        setDialogOpen(false);
        form.reset();
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao criar categoria");
      },
    });

  const { mutate: updateCategory, isPending: isUpdating } =
    client.feedbackCategory.useUpdate({
      onSuccess: () => {
        toast.success("Categoria atualizada com sucesso");
        setDialogOpen(false);
        setEditingCategory(null);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao atualizar categoria");
      },
    });

  const { mutate: deleteCategory } = client.feedbackCategory.useDelete({
    onSuccess: () => {
      toast.success("Categoria excluida com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir categoria");
    },
  });

  const form = useForm({
    defaultValues: {
      name: editingCategory?.name ?? "",
      description: editingCategory?.description ?? "",
      icon: editingCategory?.icon ?? "",
      color: editingCategory?.color ?? "#3b82f6",
      departmentId: editingCategory?.departmentId ?? "",
      active: editingCategory?.active ?? true,
    },
    onSubmit: async ({ value }) => {
      if (editingCategory) {
        updateCategory({
          where: { id: editingCategory.id },
          data: {
            name: value.name,
            description: value.description || null,
            icon: value.icon || null,
            color: value.color,
            departmentId: value.departmentId || null,
            active: value.active,
          },
        });
      } else {
        createCategory({
          data: {
            name: value.name,
            description: value.description || null,
            icon: value.icon || null,
            color: value.color,
            departmentId: value.departmentId || null,
            active: value.active,
            orderIndex: categories.length,
            organizationId: activeOrganization?.id,
          },
        });
      }
    },
  });

  const openCreateDialog = () => {
    setEditingCategory(null);
    form.reset();
    setDialogOpen(true);
  };

  const openEditDialog = (category: FeedbackCategory) => {
    setEditingCategory(category);
    form.setFieldValue("name", category.name);
    form.setFieldValue("description", category.description ?? "");
    form.setFieldValue("icon", category.icon ?? "");
    form.setFieldValue("color", category.color);
    form.setFieldValue("departmentId", category.departmentId ?? "");
    form.setFieldValue("active", category.active);
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
            <h2 className="font-bold text-2xl tracking-tight">Categorias</h2>
            <p className="text-muted-foreground">
              Gerencie as categorias de feedbacks.
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                Nenhuma categoria cadastrada
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  {category.description && (
                    <CardDescription>{category.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-muted-foreground text-sm">
                    {(category as any).department && (
                      <p>Departamento: {(category as any).department.name}</p>
                    )}
                    {(category as any).subcategories && (
                      <p>
                        Subcategorias: {(category as any).subcategories.length}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => openEditDialog(category)}
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
                            "Tem certeza que deseja excluir esta categoria?"
                          )
                        ) {
                          deleteCategory({ where: { id: category.id } });
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
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Atualize as informacoes da categoria."
                : "Preencha os dados para criar uma nova categoria."}
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
                    placeholder="Nome da categoria"
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
                    placeholder="Descricao da categoria"
                    value={field.state.value}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="departmentId">
              {(field) => (
                <Field>
                  <Label>Departamento Responsavel</Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="icon">
                {(field) => (
                  <Field>
                    <Label>Icone (Lucide)</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: Building2"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

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
                        placeholder="#3b82f6"
                        value={field.state.value}
                      />
                    </div>
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="active">
              {(field) => (
                <Field className="flex items-center justify-between">
                  <Label>Ativa</Label>
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
                  : editingCategory
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
