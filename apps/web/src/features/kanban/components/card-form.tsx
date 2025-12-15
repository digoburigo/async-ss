import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { useForm } from "@tanstack/react-form";

import type { CardFormData } from "../data/schema";
import { cardSchema } from "../data/schema";

interface CardFormProps {
	defaultValues?: Partial<CardFormData>;
	onSubmit: (data: CardFormData) => Promise<void>;
	isSubmitting?: boolean;
}

export function CardForm({
	defaultValues,
	onSubmit,
	isSubmitting = false,
}: CardFormProps) {
	const form = useForm({
		defaultValues: {
			title: defaultValues?.title ?? "",
			description: defaultValues?.description ?? "",
			color: defaultValues?.color ?? "#3b82f6",
			dueDate: defaultValues?.dueDate,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
		validators: {
			onSubmit: cardSchema,
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
							placeholder="Ex: Implementar feature X"
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
							placeholder="Detalhes da tarefa..."
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

			<div className="grid gap-4 md:grid-cols-2">
				<form.Field name="color">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Cor</Label>
							<div className="flex items-center gap-2">
								<Input
									id={field.name}
									name={field.name}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									type="color"
									value={field.state.value ?? "#3b82f6"}
									className="h-10 w-20"
								/>
								<Input
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									type="text"
									value={field.state.value ?? "#3b82f6"}
									placeholder="#3b82f6"
									className="flex-1"
								/>
							</div>
							{field.state.meta.errors.map((error) => (
								<p className="text-destructive text-sm" key={error?.message}>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>

				<form.Field name="dueDate">
					{(field) => (
						<div className="space-y-2">
							<Label htmlFor={field.name}>Data de Vencimento</Label>
							<Input
								id={field.name}
								name={field.name}
								onBlur={field.handleBlur}
								onChange={(e) => {
									const value = e.target.value;
									field.handleChange(value ? new Date(value) : undefined);
								}}
								type="datetime-local"
								value={
									field.state.value
										? new Date(field.state.value).toISOString().slice(0, 16)
										: ""
								}
								min={new Date().toISOString().slice(0, 16)}
							/>
							{field.state.meta.errors.map((error) => (
								<p className="text-destructive text-sm" key={error?.message}>
									{error?.message}
								</p>
							))}
						</div>
					)}
				</form.Field>
			</div>

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
