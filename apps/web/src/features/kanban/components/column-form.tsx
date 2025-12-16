import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { useForm } from "@tanstack/react-form";

import type { ColumnFormData } from "../data/schema";
import { columnSchema } from "../data/schema";

interface ColumnFormProps {
  defaultValues?: Partial<ColumnFormData>;
  onSubmit: (data: ColumnFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ColumnForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: ColumnFormProps) {
  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validators: {
      onSubmit: columnSchema,
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
              placeholder="Ex: Para Fazer"
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
