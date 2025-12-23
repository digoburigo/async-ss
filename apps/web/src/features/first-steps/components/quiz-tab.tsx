import { Button } from "@acme/ui/base-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/base-ui/card";
import {
  CheckCircleIcon,
  PlayIcon,
  TrophyIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";

import { QuizPlayer } from "./quiz-player";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  orderIndex: number;
};

type Attempt = {
  id: string;
  userId: string;
  score: number;
  passed: boolean;
  completedAt: Date;
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions?: Question[];
  attempts?: Attempt[];
};

type QuizTabProps = {
  quiz: Quiz | null;
  userId: string;
};

export function QuizTab({ quiz, userId }: QuizTabProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!quiz) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum quiz configurado para este cargo.
        </p>
      </div>
    );
  }

  const userAttempts = quiz.attempts?.filter((a) => a.userId === userId) || [];
  const bestAttempt =
    userAttempts.length > 0
      ? userAttempts.reduce((best, curr) =>
          curr.score > best.score ? curr : best
        )
      : null;
  const hasPassed = userAttempts.some((a) => a.passed);
  const questionsCount = quiz.questions?.length || 0;

  if (isPlaying && quiz.questions && quiz.questions.length > 0) {
    return (
      <QuizPlayer
        onComplete={() => setIsPlaying(false)}
        quiz={quiz}
        userId={userId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              {quiz.description ? (
                <CardDescription>{quiz.description}</CardDescription>
              ) : null}
            </div>
            {hasPassed ? (
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-700 text-sm dark:bg-green-900/30 dark:text-green-400">
                <CheckCircleIcon className="size-4" />
                Aprovado
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-muted-foreground">Questões</div>
              <div className="font-semibold text-xl">{questionsCount}</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-muted-foreground">Nota mínima</div>
              <div className="font-semibold text-xl">{quiz.passingScore}%</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-muted-foreground">Tentativas</div>
              <div className="font-semibold text-xl">{userAttempts.length}</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="text-muted-foreground">Melhor nota</div>
              <div className="font-semibold text-xl">
                {bestAttempt ? `${bestAttempt.score}%` : "-"}
              </div>
            </div>
          </div>

          {questionsCount > 0 ? (
            <Button
              className="w-full"
              onClick={() => setIsPlaying(true)}
              size="lg"
            >
              <PlayIcon className="mr-2 size-4" />
              {userAttempts.length > 0 ? "Tentar novamente" : "Iniciar Quiz"}
            </Button>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
              Nenhuma questão cadastrada neste quiz.
            </div>
          )}
        </CardContent>
      </Card>

      {userAttempts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrophyIcon className="size-4" />
              Histórico de Tentativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userAttempts
                .sort(
                  (a, b) =>
                    new Date(b.completedAt).getTime() -
                    new Date(a.completedAt).getTime()
                )
                .map((attempt, index) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3"
                    key={attempt.id}
                  >
                    <div className="flex items-center gap-3">
                      {attempt.passed ? (
                        <CheckCircleIcon className="size-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="size-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          Tentativa #{userAttempts.length - index}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {new Date(attempt.completedAt).toLocaleDateString(
                            "pt-BR",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {attempt.score}%
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {attempt.passed ? "Aprovado" : "Reprovado"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
