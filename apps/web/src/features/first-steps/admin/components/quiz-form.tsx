import { Switch } from "@acme/ui/base-ui/switch";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { useForm } from "@tanstack/react-form";

import type { QuizFormData } from "../data/schema";
import { quizFormSchema } from "../data/schema";

type QuizFormProps = {
  defaultValues?: Partial<QuizFormData>;
  onSubmit: (data: QuizFormData) => Promise<void>;
  isSubmitting?: boolean;
};

export function QuizForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: QuizFormProps) {
  const form = useForm({
    defaultValues: {
      title: defaultValues?.title ?? "Quiz de Conhecimento",
      description: defaultValues?.description ?? "",
      passingScore: defaultValues?.passingScore ?? 70,
      active: defaultValues?.active ?? true,
    },
    onSubmit: async ({ value }) => {
      const result = quizFormSchema.safeParse(value);
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
              placeholder="Ex: Quiz de Conhecimento"
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
            <Label htmlFor={field.name}>Descrição</Label>
            <Textarea
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Descrição do quiz..."
              rows={3}
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

      <form.Field name="passingScore">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Nota mínima para aprovação (%)</Label>
            <Input
              id={field.name}
              max={100}
              min={0}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              placeholder="70"
              type="number"
              value={field.state.value}
            />
            <p className="text-muted-foreground text-xs">
              Porcentagem de acertos necessária para passar (0-100)
            </p>
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

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
