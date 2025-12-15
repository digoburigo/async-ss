import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { useForm } from "@tanstack/react-form";

import type { BoardFormData } from "../data/schema";
import { boardSchema } from "../data/schema";

interface BoardFormProps {
	defaultValues?: Partial<BoardFormData>;
	onSubmit: (data: BoardFormData) => Promise<void>;
	isSubmitting?: boolean;
}

export function BoardForm({
	defaultValues,
	onSubmit,
	isSubmitting = false,
}: BoardFormProps) {
	const form = useForm({
		defaultValues: {
			title: defaultValues?.title ?? "",
			description: defaultValues?.description ?? "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
		validators: {
			onSubmit: boardSchema,
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
							type="text"
							value={field.state.value}
							placeholder="Ex: Projeto Alpha"
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
							value={field.state.value ?? ""}
							placeholder="Descreva o propósito deste quadro..."
							rows={4}
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
