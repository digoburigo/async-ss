import { Button } from "@acme/ui/base-ui/button";
import { Checkbox } from "@acme/ui/base-ui/checkbox";
import { DialogFooter } from "@acme/ui/base-ui/dialog";
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@acme/ui/base-ui/field";
import { Input } from "@acme/ui/base-ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@acme/ui/base-ui/select";
import { Textarea } from "@acme/ui/base-ui/textarea";
import type {
	CalendarEventType,
	CalendarEvent as EventCalendar,
} from "@acme/zen-v3/zenstack/models";
import { useForm } from "@tanstack/react-form";
import { addHours, format, isBefore, roundToNearestMinutes } from "date-fns";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { DatePicker } from "~/components/date-picker";

const eventTypeOptions: { label: string; value: CalendarEventType }[] = [
	{ label: "Reunião", value: "MEETING" },
	{ label: "Onboarding", value: "ONBOARDING" },
	{ label: "Treinamento", value: "TRAINING" },
	{ label: "Entrevista", value: "INTERVIEW" },
	{ label: "Tarefa", value: "TASK" },
	{ label: "Outro", value: "OTHER" },
] as const;

export function EventForm({
	event,
	onClose,
	onSave,
	onDelete,
}: {
	event: Partial<EventCalendar> | null;
	onClose: () => void;
	onSave: (event: Partial<EventCalendar>) => void;
	onDelete: (eventId: string) => void;
}) {
	const defaultValues = useMemo(() => {
		return {
			title: event?.title ?? "",
			description: event?.description ?? "",
			start: event?.start ? new Date(event.start) : new Date(),
			end: event?.end
				? new Date(event.end)
				: roundToNearestMinutes(addHours(new Date(), 1), {
						nearestTo: 15,
					}),
			startTime: event?.start
				? new Date(event.start)
				: roundToNearestMinutes(addHours(new Date(), 1), {
						nearestTo: 15,
					}),
			endTime: event?.end
				? new Date(event.end)
				: roundToNearestMinutes(addHours(new Date(), 2), {
						nearestTo: 15,
					}),
			allDay: event?.allDay ?? false,
			eventType: (event?.eventType ?? "OTHER") as CalendarEventType,
		};
	}, [event]);

	const form = useForm({
		defaultValues,
		validators: {
			onSubmit: ({ value }) => {
				if (!value.title.trim()) {
					return {
						fields: {
							title: "Título é obrigatório",
						},
					};
				}
				return undefined;
			},
		},
		onSubmit: async ({ value }) => {
			try {
				const startDate = new Date(value.start);
				const endDate = new Date(value.end);

				if (!value.allDay) {
					startDate.setHours(
						value.startTime?.getHours() ?? startDate.getHours(),
						value.startTime?.getMinutes() ?? startDate.getMinutes(),
						0,
					);
					endDate.setHours(
						value.endTime?.getHours() ?? endDate.getHours(),
						value.endTime?.getMinutes() ?? endDate.getMinutes(),
						0,
					);
				} else {
					startDate.setHours(0, 0, 0, 0);
					endDate.setHours(23, 59, 59, 999);
				}

				if (isBefore(endDate, startDate)) {
					toast.error("A data final não pode ser antes da data inicial");
					return;
				}

				const eventTitle = value.title.trim() ? value.title : "(sem título)";

				const eventData: Partial<EventCalendar> = {
					id: event?.id ?? undefined,
					title: eventTitle,
					description: value.description,
					start: startDate,
					end: endDate,
					allDay: value.allDay,
					eventType: value.eventType ?? "OTHER",
				};

				onSave(eventData);
			} catch (error) {
				console.error("Error processing request:", error);
				toast.error("Erro ao processar solicitação.");
			}
		},
	});

	return (
		<form
			id="event-form"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="flex flex-col gap-6"
		>
			<FieldGroup>
				<form.Field
					name="title"
					validators={{
						onChange: ({ value }) =>
							!value.trim() ? "Título é obrigatório" : undefined,
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Título</FieldLabel>
							<FieldContent>
								<Input
									id={field.name}
									placeholder="Nome do evento..."
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
								{field.state.meta.isTouched &&
									field.state.meta.errors.length > 0 && (
										<FieldError>
											{field.state.meta.errors.join(", ")}
										</FieldError>
									)}
							</FieldContent>
						</Field>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
							<FieldContent>
								<Textarea
									id={field.name}
									placeholder="Detalhes do evento..."
									className="resize-none"
									value={field.state.value ?? ""}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
							</FieldContent>
						</Field>
					)}
				</form.Field>

				<form.Field name="eventType">
					{(field) => (
						<Field>
							<FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
							<FieldContent>
								<Select
									value={field.state.value}
									onValueChange={(value) =>
										field.handleChange(value as CalendarEventType)
									}
								>
									<SelectTrigger id={field.name} className="w-full">
										<SelectValue>
											{eventTypeOptions.find(
												(opt) => opt.value === field.state.value,
											)?.label ?? "Selecione o tipo"}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{eventTypeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FieldContent>
						</Field>
					)}
				</form.Field>

				<div className="flex gap-4">
					<form.Field name="start">
						{(field) => (
							<Field className="flex-1">
								<FieldLabel htmlFor={field.name}>Data inicial</FieldLabel>
								<FieldContent>
									<DatePicker
										selected={field.state.value ?? undefined}
										onSelect={(date: Date | undefined) =>
											field.handleChange(date ?? new Date())
										}
										placeholder="Selecione a data"
									/>
								</FieldContent>
							</Field>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.values.allDay}>
						{(allDay) =>
							!allDay && (
								<form.Field name="startTime">
									{(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>Hora inicial</FieldLabel>
											<FieldContent>
												<Input
													id={field.name}
													type="time"
													step="900"
													value={
														field.state.value
															? format(field.state.value, "HH:mm")
															: ""
													}
													onChange={(e) => {
														const [hours, minutes] = e.target.value.split(":");
														const date = new Date();
														date.setHours(hours ? +hours : 0);
														date.setMinutes(minutes ? +minutes : 0);
														field.handleChange(date);
													}}
													onBlur={field.handleBlur}
												/>
											</FieldContent>
										</Field>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>
				</div>

				<div className="flex gap-4">
					<form.Field name="end">
						{(field) => (
							<Field className="flex-1">
								<FieldLabel htmlFor={field.name}>Data final</FieldLabel>
								<FieldContent>
									<DatePicker
										selected={field.state.value ?? undefined}
										onSelect={(date: Date | undefined) =>
											field.handleChange(date ?? new Date())
										}
										placeholder="Selecione a data"
									/>
								</FieldContent>
							</Field>
						)}
					</form.Field>

					<form.Subscribe selector={(state) => state.values.allDay}>
						{(allDay) =>
							!allDay && (
								<form.Field name="endTime">
									{(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>Hora final</FieldLabel>
											<FieldContent>
												<Input
													id={field.name}
													type="time"
													step="900"
													value={
														field.state.value
															? format(field.state.value, "HH:mm")
															: ""
													}
													onChange={(e) => {
														const [hours, minutes] = e.target.value.split(":");
														const date = new Date();
														date.setHours(hours ? +hours : 0);
														date.setMinutes(minutes ? +minutes : 0);
														field.handleChange(date);
													}}
													onBlur={field.handleBlur}
												/>
											</FieldContent>
										</Field>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>
				</div>

				<form.Field name="allDay">
					{(field) => (
						<Field orientation="horizontal">
							<Checkbox
								id={field.name}
								checked={field.state.value ?? false}
								onCheckedChange={(checked) =>
									field.handleChange(checked === true)
								}
							/>
							<FieldLabel htmlFor={field.name}>
								Dia inteiro (sem horário)
							</FieldLabel>
						</Field>
					)}
				</form.Field>
			</FieldGroup>

			<DialogFooter className="bg-background sticky bottom-0 mt-4 flex-row rounded border-t px-6 py-4 sm:items-center sm:justify-between">
				{event?.id ? (
					<Button
						type="button"
						variant="destructive"
						className="self-start"
						onClick={() => onDelete(event.id ?? "")}
						aria-label="Delete event"
					>
						<Trash2 size={16} aria-hidden="true" />
						Excluir
					</Button>
				) : null}
				<div className="flex flex-1 justify-end gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancelar
					</Button>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
					>
						{([canSubmit, isSubmitting]) => (
							<Button type="submit" disabled={!canSubmit || isSubmitting}>
								{isSubmitting
									? "Salvando..."
									: event?.id
										? "Salvar"
										: "Criar evento"}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</DialogFooter>
		</form>
	);
}
