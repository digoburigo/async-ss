import { z } from "zod";

// Job Type schemas
export const jobTypeFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().default("#6366f1"),
  active: z.boolean().default(true),
});

export type JobTypeFormData = z.infer<typeof jobTypeFormSchema>;

// Step schemas
export const stepFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  linkType: z.enum(["internal", "external", "none"]).default("none"),
  linkUrl: z.string().optional(),
  linkLabel: z.string().optional(),
  linkOpenInNewTab: z.boolean().default(false),
  estimatedMinutes: z.number().optional(),
  active: z.boolean().default(true),
});

export type StepFormData = z.infer<typeof stepFormSchema>;

// Quiz schemas
export const quizFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).default(70),
  active: z.boolean().default(true),
});

export type QuizFormData = z.infer<typeof quizFormSchema>;

// Question schemas
export const questionFormSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória"),
  options: z.array(z.string().min(1)).min(2, "Mínimo 2 opções"),
  correctAnswer: z.number().min(0),
  explanation: z.string().optional(),
  active: z.boolean().default(true),
});

export type QuestionFormData = z.infer<typeof questionFormSchema>;
