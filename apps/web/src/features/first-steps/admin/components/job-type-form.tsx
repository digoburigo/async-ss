import { useForm } from "@tanstack/react-form";

import { Switch } from "@acme/ui/base-ui/switch";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";

import type { JobTypeFormData } from "../data/schema";
import { jobTypeFormSchema } from "../data/schema";

// Color options for job types
const colorOptions = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#64748b", label: "Slate" },
];

type JobTypeFormProps = {
  defaultValues?: Partial<JobTypeFormData>;
  onSubmit: (data: JobTypeFormData) => Promise<void>;
  isSubmitting?: boolean;
};

export function JobTypeForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: JobTypeFormProps) {
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      icon: defaultValues?.icon ?? "",
      color: defaultValues?.color ?? "#6366f1",
      active: defaultValues?.active ?? true,
    },
    onSubmit: async ({ value }) => {
      const result = jobTypeFormSchema.safeParse(value);
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
      <form.Field name="name">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Nome *</Label>
            <Input
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex: Vendedor, Auxiliar, Gerente"
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
              placeholder="Descrição do cargo ou função..."
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

      <form.Field name="icon">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Ícone (Lucide)</Label>
            <Input
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ex: ShoppingCart, Package, User"
              type="text"
              value={field.state.value ?? ""}
            />
            <p className="text-muted-foreground text-xs">
              Use nomes de ícones do Lucide Icons (https://lucide.dev/icons)
            </p>
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="color">
        {(field) => (
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  aria-label={color.label}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    field.state.value === color.value
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  key={color.value}
                  onClick={() => field.handleChange(color.value)}
                  style={{ backgroundColor: color.value }}
                  type="button"
                />
              ))}
            </div>
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
