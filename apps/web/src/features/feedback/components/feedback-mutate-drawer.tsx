import { Button } from "@acme/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@acme/ui/sheet";
import { Textarea } from "@acme/ui/textarea";
import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "~/clients/auth-client";
import { priorityOptions, sourceOptions, statusOptions } from "../data/data";

interface FeedbackMutateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: CitizenFeedback | null;
}

const feedbackSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  description: z.string().min(1, "Descricao e obrigatoria"),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  departmentId: z.string().optional(),
  priority: z.string().default("medium"),
  status: z.string().default("open"),
  source: z.string().default("web"),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  citizenName: z.string().optional(),
  citizenEmail: z.string().email().optional().or(z.literal("")),
  citizenPhone: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  internalNotes: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export function FeedbackMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: FeedbackMutateDrawerProps) {
  const isUpdate = !!currentRow;
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const queryClient = useQueryClient();

  const client = useClientQueries(schema);

  const { data: categories = [] } = client.feedbackCategory.useFindMany({
    where: { active: true },
    orderBy: { orderIndex: "asc" },
  });

  const { data: departments = [] } = client.feedbackDepartment.useFindMany({
    where: { active: true },
    orderBy: { orderIndex: "asc" },
  });

  const { mutate: createFeedback, isPending: isCreating } =
    client.citizenFeedback.useCreate({
      onSuccess: () => {
        toast.success("Feedback criado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
        onOpenChange(false);
        form.reset();
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao criar feedback");
      },
    });

  const { mutate: updateFeedback, isPending: isUpdating } =
    client.citizenFeedback.useUpdate({
      onSuccess: () => {
        toast.success("Feedback atualizado com sucesso");
        queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
        onOpenChange(false);
      },
      onError: (error: Error) => {
        toast.error(error.message || "Erro ao atualizar feedback");
      },
    });

  const form = useForm({
    defaultValues: {
      title: currentRow?.title ?? "",
      description: currentRow?.description ?? "",
      categoryId: currentRow?.categoryId ?? "",
      subcategoryId: currentRow?.subcategoryId ?? "",
      departmentId: currentRow?.departmentId ?? "",
      priority: currentRow?.priority ?? "medium",
      status: currentRow?.status ?? "open",
      source: currentRow?.source ?? "web",
      address: currentRow?.address ?? "",
      neighborhood: currentRow?.neighborhood ?? "",
      city: currentRow?.city ?? "",
      state: currentRow?.state ?? "",
      zipCode: currentRow?.zipCode ?? "",
      citizenName: currentRow?.citizenName ?? "",
      citizenEmail: currentRow?.citizenEmail ?? "",
      citizenPhone: currentRow?.citizenPhone ?? "",
      isAnonymous: currentRow?.isAnonymous ?? false,
      internalNotes: currentRow?.internalNotes ?? "",
    } as FeedbackFormValues,
    onSubmit: async ({ value }) => {
      if (isUpdate) {
        updateFeedback({
          where: { id: currentRow.id },
          data: {
            title: value.title,
            description: value.description,
            categoryId: value.categoryId || null,
            subcategoryId: value.subcategoryId || null,
            departmentId: value.departmentId || null,
            priority: value.priority as any,
            status: value.status as any,
            source: value.source as any,
            address: value.address || null,
            neighborhood: value.neighborhood || null,
            city: value.city || null,
            state: value.state || null,
            zipCode: value.zipCode || null,
            citizenName: value.citizenName || null,
            citizenEmail: value.citizenEmail || null,
            citizenPhone: value.citizenPhone || null,
            isAnonymous: value.isAnonymous,
            internalNotes: value.internalNotes || null,
          },
        });
      } else {
        createFeedback({
          data: {
            title: value.title,
            description: value.description,
            categoryId: value.categoryId || null,
            subcategoryId: value.subcategoryId || null,
            departmentId: value.departmentId || null,
            priority: value.priority as any,
            status: value.status as any,
            source: value.source as any,
            address: value.address || null,
            neighborhood: value.neighborhood || null,
            city: value.city || null,
            state: value.state || null,
            zipCode: value.zipCode || null,
            citizenName: value.citizenName || null,
            citizenEmail: value.citizenEmail || null,
            citizenPhone: value.citizenPhone || null,
            isAnonymous: value.isAnonymous,
            internalNotes: value.internalNotes || null,
            organizationId: activeOrganization?.id,
          },
        });
      }
    },
  });

  const isPending = isCreating || isUpdating;

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {isUpdate ? "Editar Feedback" : "Novo Feedback"}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Atualize as informacoes do feedback."
              : "Preencha os dados para criar um novo feedback."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="title">
            {(field) => (
              <Field>
                <Label htmlFor={field.name}>Titulo *</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Titulo do feedback"
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <Field>
                <Label htmlFor={field.name}>Descricao *</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Descreva o problema ou sugestao"
                  rows={4}
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="categoryId">
              {(field) => (
                <Field>
                  <Label>Categoria</Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="departmentId">
              {(field) => (
                <Field>
                  <Label>Departamento</Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <form.Field name="priority">
              {(field) => (
                <Field>
                  <Label>Prioridade</Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="status">
              {(field) => (
                <Field>
                  <Label>Status</Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="source">
              {(field) => (
                <Field>
                  <Label>Origem</Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-2 font-medium">Localizacao</h4>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="address">
                {(field) => (
                  <Field className="col-span-2">
                    <Label>Endereco</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Rua, numero"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="neighborhood">
                {(field) => (
                  <Field>
                    <Label>Bairro</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Bairro"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="city">
                {(field) => (
                  <Field>
                    <Label>Cidade</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Cidade"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-2 font-medium">Dados do Cidadao</h4>
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="citizenName">
                {(field) => (
                  <Field>
                    <Label>Nome</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nome do cidadao"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="citizenPhone">
                {(field) => (
                  <Field>
                    <Label>Telefone</Label>
                    <Input
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="(00) 00000-0000"
                      value={field.state.value}
                    />
                  </Field>
                )}
              </form.Field>

              <form.Field name="citizenEmail">
                {(field) => (
                  <Field className="col-span-2">
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
            </div>
          </div>

          <form.Field name="internalNotes">
            {(field) => (
              <Field>
                <Label>Notas Internas</Label>
                <Textarea
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Notas visiveis apenas para a equipe"
                  rows={3}
                  value={field.state.value}
                />
              </Field>
            )}
          </form.Field>

          <SheetFooter className="gap-2">
            <Button
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Salvando..." : isUpdate ? "Salvar" : "Criar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
