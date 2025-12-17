import { z } from "zod";

export const stepProgressSchema = z.object({
  stepId: z.string(),
  completed: z.boolean(),
});

export type StepProgressFormData = z.infer<typeof stepProgressSchema>;

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  selectedAnswer: z.number(),
});

export const quizSubmitSchema = z.object({
  quizId: z.string(),
  answers: z.record(z.string(), z.number()), // questionId -> selectedAnswerIndex
});

export type QuizSubmitFormData = z.infer<typeof quizSubmitSchema>;
