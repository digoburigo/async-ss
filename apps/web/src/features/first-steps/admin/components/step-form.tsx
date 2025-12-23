import { Switch } from "@acme/ui/base-ui/switch";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Textarea } from "@acme/ui/textarea";
import { useForm } from "@tanstack/react-form";

import type { StepFormData } from "../data/schema";
import { stepFormSchema } from "../data/schema";

type StepFormProps = {
  defaultValues?: Partial<StepFormData>;
  onSubmit: (data: StepFormData) => Promise<void>;
  isSubmitting?: boolean;
};

export function StepForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: StepFormProps) {
  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      linkType: defaultValues?.linkType ?? "none",
      linkUrl: defaultValues?.linkUrl ?? "",
      linkLabel: defaultValues?.linkLabel ?? "",
      linkOpenInNewTab: defaultValues?.linkOpenInNewTab ?? false,
      estimatedMinutes: defaultValues?.estimatedMinutes,
      active: defaultValues?.active ?? true,
    },
    onSubmit: async ({ value }) => {
      const result = stepFormSchema.safeParse(value);
      if (!result.success) {
        return;
      }
      await onSubmit(result.data);
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="title">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Título *</Label>
            <Input
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex: Conhecer o sistema de vendas"
              type="text"
              value={field.state.value}
            />
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Descrição *</Label>
            <Textarea
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Descreva o que o colaborador precisa fazer neste passo..."
              rows={4}
              value={field.state.value}
            />
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="estimatedMinutes">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Tempo estimado (minutos)</Label>
            <Input
              id={field.name}
              min={1}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="Ex: 15"
              type="number"
              value={field.state.value ?? ""}
            />
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="linkType">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Tipo de Link</Label>
            <Select
              onValueChange={(value) =>
                field.handleChange(value as "internal" | "external" | "none")
              }
              value={field.state.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de link" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem link</SelectItem>
                <SelectItem value="internal">Link interno</SelectItem>
                <SelectItem value="external">Link externo</SelectItem>
              </SelectContent>
            </Select>
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.linkType}>
        {(linkType) =>
          linkType !== "none" ? (
            <>
              <form.Field name="linkUrl">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>URL do Link</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={
                        linkType === "internal"
                          ? "/dashboard/vendas"
                          : "https://exemplo.com"
                      }
                      type="text"
                      value={field.state.value ?? ""}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        className="text-destructive text-sm"
                        key={String(error)}
                      >
                        {typeof error === "string" ? error : error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>

              <form.Field name="linkLabel">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Texto do Botão</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Ex: Acessar, Ver mais, Assistir"
                      type="text"
                      value={field.state.value ?? ""}
                    />
                    {field.state.meta.errors.map((error) => (
                      <p
                        className="text-destructive text-sm"
                        key={String(error)}
                      >
                        {typeof error === "string" ? error : error?.message}
                      </p>
                    ))}
                  </div>
                )}
              </form.Field>

              <form.Field name="linkOpenInNewTab">
                {(field) => (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      id={field.name}
                      onCheckedChange={field.handleChange}
                    />
                    <Label htmlFor={field.name}>Abrir em nova aba</Label>
                  </div>
                )}
              </form.Field>
            </>
          ) : null
        }
      </form.Subscribe>

      <form.Field name="active">
        {(field) => (
          <div className="flex items-center gap-3">
            <Switch
              checked={field.state.value}
              id={field.name}
              onCheckedChange={field.handleChange}
            />
            <Label htmlFor={field.name}>Ativo</Label>
          </div>
        )}
      </form.Field>

      <form.Subscribe>
        {(state) => (
          <div className="flex justify-end gap-2">
            <Button
              disabled={!state.canSubmit || state.isSubmitting || isSubmitting}
              type="submit"
            >
              {state.isSubmitting || isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
