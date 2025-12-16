import { Button } from "@acme/ui/base-ui/button";
import { Input } from "@acme/ui/base-ui/input";
import { Label } from "@acme/ui/base-ui/label";
import { Textarea } from "@acme/ui/base-ui/textarea";
import { useForm } from "@tanstack/react-form";

import type { MindmapFormData } from "../data/schema";
import { mindmapSchema } from "../data/schema";

interface MindmapFormProps {
  defaultValues?: Partial<MindmapFormData>;
  onSubmit: (data: MindmapFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function MindmapForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: MindmapFormProps) {
  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validators: {
      onSubmit: mindmapSchema,
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
              placeholder="Ex: Fluxo de Onboarding"
              type="text"
              value={field.state.value}
            />
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={error?.message}>
                {error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Descrição</Label>
            <Textarea
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Descreva o propósito deste mapa mental..."
              rows={4}
              value={field.state.value ?? ""}
            />
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={error?.message}>
                {error?.message}
              </p>
            ))}
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
