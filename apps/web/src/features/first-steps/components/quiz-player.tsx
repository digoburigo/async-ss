import { cn } from "@acme/ui";
import { Button } from "@acme/ui/base-ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/base-ui/card";
import { Progress } from "@acme/ui/base-ui/progress";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  orderIndex: number;
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions?: Question[];
};

type QuizPlayerProps = {
  quiz: Quiz;
  userId: string;
  onComplete: () => void;
};

export function QuizPlayer({ quiz, userId, onComplete }: QuizPlayerProps) {
  const client = useClientQueries(schema);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [attemptResult, setAttemptResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  const questions = [...(quiz.questions || [])].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const { mutate: createAttempt, isPending } =
    client.firstStepsQuizAttempt.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Quiz finalizado!");
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    // Calculate score
    let correctCount = 0;
    for (const question of questions) {
      if (answers[question.id] === question.correctAnswer) {
        correctCount++;
      }
    }
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    setAttemptResult({ score, passed });
    setShowResults(true);

    // Save attempt
    createAttempt({
      data: {
        userId,
        quizId: quiz.id,
        score,
        passed,
        answers: answers as unknown as string,
      },
    });
  };

  if (showResults && attemptResult) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Resultado do Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex size-24 items-center justify-center rounded-full font-bold text-3xl",
                attemptResult.passed
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {attemptResult.score}%
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-xl">
                {attemptResult.passed
                  ? "Parabéns! Você foi aprovado!"
                  : "Que pena! Você não passou."}
              </h3>
              <p className="text-muted-foreground">
                {attemptResult.passed
                  ? "Você demonstrou conhecimento suficiente."
                  : `Você precisa de pelo menos ${quiz.passingScore}% para passar.`}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Revisão das respostas:</h4>
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  className={cn(
                    "rounded-lg border p-4",
                    isCorrect
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                  )}
                  key={question.id}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckIcon className="mt-0.5 size-5 text-green-600" />
                    ) : (
                      <XIcon className="mt-0.5 size-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">
                        {index + 1}. {question.question}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="text-muted-foreground">
                          Sua resposta:{" "}
                        </span>
                        <span
                          className={
                            isCorrect ? "text-green-600" : "text-red-600"
                          }
                        >
                          {question.options[userAnswer] || "Não respondida"}
                        </span>
                      </div>
                      {isCorrect ? null : (
                        <div className="mt-1 text-sm">
                          <span className="text-muted-foreground">
                            Resposta correta:{" "}
                          </span>
                          <span className="text-green-600">
                            {question.options[question.correctAnswer]}
                          </span>
                        </div>
                      )}
                      {question.explanation ? (
                        <div className="mt-2 text-muted-foreground text-sm">
                          <strong>Explicação:</strong> {question.explanation}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onComplete}>
            Voltar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const selectedAnswer = answers[currentQuestion.id];
  const canFinish = answeredCount === totalQuestions;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Questão {currentIndex + 1} de {totalQuestions}
          </CardTitle>
          <span className="text-muted-foreground text-sm">
            {answeredCount} de {totalQuestions} respondidas
          </span>
        </div>
        <Progress value={progress} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="font-medium text-lg">{currentQuestion.question}</div>

        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <button
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                selectedAnswer === index && "border-primary bg-primary/5"
              )}
              key={index}
              onClick={() => handleSelectAnswer(currentQuestion.id, index)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full border font-medium text-sm",
                    selectedAnswer === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          disabled={currentIndex === 0}
          onClick={handlePrevious}
          variant="outline"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentIndex === totalQuestions - 1 ? (
            <Button disabled={!canFinish || isPending} onClick={handleFinish}>
              {isPending ? "Salvando..." : "Finalizar"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Próxima
              <ArrowRightIcon className="ml-2 size-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
