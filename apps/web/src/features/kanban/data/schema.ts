import { z } from "zod";

export const boardSchema = z.object({
	title: z
		.string()
		.min(1, "Título é obrigatório")
		.max(100, "Título deve ter no máximo 100 caracteres"),
	description: z
		.string()
		.max(500, "Descrição deve ter no máximo 500 caracteres")
		.optional(),
});

export const columnSchema = z.object({
	title: z
		.string()
		.min(1, "Título é obrigatório")
		.max(50, "Título deve ter no máximo 50 caracteres"),
});

export const cardSchema = z.object({
	title: z
		.string()
		.min(1, "Título é obrigatório")
		.max(200, "Título deve ter no máximo 200 caracteres"),
	description: z
		.string()
		.max(1000, "Descrição deve ter no máximo 1000 caracteres")
		.optional(),
	color: z
		.string()
		.regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um código hexadecimal válido")
		.optional(),
	dueDate: z.date().optional(),
});

export type BoardFormData = z.infer<typeof boardSchema>;
export type ColumnFormData = z.infer<typeof columnSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
