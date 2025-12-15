import { z } from "zod";

export const mindmapSchema = z.object({
	title: z.string().min(1, "O título é obrigatório"),
	description: z.string().optional(),
});

export type MindmapFormData = z.infer<typeof mindmapSchema>;
