import { Switch } from "@acme/ui/base-ui/switch";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";

import type { QuestionFormData } from "../data/schema";
import { questionFormSchema } from "../data/schema";

type QuestionFormProps = {
  defaultValues?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  isSubmitting?: boolean;
};

export function QuestionForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: QuestionFormProps) {
  const form = useForm({
    defaultValues: {
      question: defaultValues?.question ?? "",
      options: defaultValues?.options ?? ["", ""],
      correctAnswer: defaultValues?.correctAnswer ?? 0,
      explanation: defaultValues?.explanation ?? "",
      active: defaultValues?.active ?? true,
    },
    onSubmit: async ({ value }) => {
      const result = questionFormSchema.safeParse(value);
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
      <form.Field name="question">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Pergunta *</Label>
            <Textarea
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Digite a pergunta..."
              rows={3}
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

      <form.Field mode="array" name="options">
        {(field) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Opções *</Label>
              <Button
                onClick={() => field.pushValue("")}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar opção
              </Button>
            </div>
            <div className="space-y-2">
              {field.state.value.map((_, index) => (
                <form.Field key={`option-${index}`} name={`options[${index}]`}>
                  {(optionField) => (
                    <div className="flex items-center gap-2">
                      <form.Field name="correctAnswer">
                        {(correctField) => (
                          <button
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm transition-colors ${
                              correctField.state.value === index
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground hover:border-primary"
                            }`}
                            onClick={() => correctField.handleChange(index)}
                            title="Marcar como resposta correta"
                            type="button"
                          >
                            {String.fromCharCode(65 + index)}
                          </button>
                        )}
                      </form.Field>
                      <Input
                        className="flex-1"
                        onBlur={optionField.handleBlur}
                        onChange={(e) =>
                          optionField.handleChange(e.target.value)
                        }
                        placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                        type="text"
                        value={optionField.state.value}
                      />
                      {field.state.value.length > 2 ? (
                        <Button
                          onClick={() => field.removeValue(index)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : null}
                    </div>
                  )}
                </form.Field>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Clique na letra para marcar a resposta correta
            </p>
            {field.state.meta.errors.map((error) => (
              <p className="text-destructive text-sm" key={String(error)}>
                {typeof error === "string" ? error : error?.message}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="explanation">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Explicação (opcional)</Label>
            <Textarea
              id={field.name}
              name={field.name}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Explique por que a resposta correta está certa..."
              rows={3}
              value={field.state.value ?? ""}
            />
            <p className="text-muted-foreground text-xs">
              Será exibida após o usuário responder
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
