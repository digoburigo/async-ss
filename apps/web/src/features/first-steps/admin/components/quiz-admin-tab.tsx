import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { Edit2, HelpCircle, Plus, Settings, Trash2 } from "lucide-react";

import { authClient } from "~/clients/auth-client";
import { useAdmin } from "./admin-provider";

export function QuizAdminTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const client = useClientQueries(schema);
  const {
    setOpen,
    setCurrentQuiz,
    setCurrentQuestion,
    setCurrentJobType,
    selectedJobTypeId,
    setSelectedJobTypeId,
  } = useAdmin();

  // Fetch all job types for selector
  const { data: jobTypes = [] } = client.firstStepsJobType.useFindMany(
    {
      where: { active: true },
      orderBy: { orderIndex: "asc" },
    },
    {
      enabled: !!activeOrganization?.id,
    }
  );

  // Fetch quiz for selected job type
  const { data: quizzes = [], isFetching } = client.firstStepsQuiz.useFindMany(
    {
      where: {
        jobTypeId: selectedJobTypeId || "",
      },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    },
    {
      enabled: !!selectedJobTypeId,
    }
  );

  const quiz = quizzes[0] || null;

  const handleCreateQuiz = () => {
    if (!selectedJobTypeId) return;
    const jobType = jobTypes.find((jt) => jt.id === selectedJobTypeId);
    if (jobType) {
      setCurrentJobType(jobType);
    }
    setCurrentQuiz(null);
    setOpen("create-quiz");
  };

  const handleEditQuiz = () => {
    if (!quiz) return;
    setCurrentQuiz(quiz);
    setOpen("update-quiz");
  };

  const handleDeleteQuiz = () => {
    if (!quiz) return;
    setCurrentQuiz(quiz);
    setOpen("delete-quiz");
  };

  const handleCreateQuestion = () => {
    if (!quiz) return;
    setCurrentQuiz(quiz);
    setCurrentQuestion(null);
    setOpen("create-question");
  };

  const handleEditQuestion = (
    question: NonNullable<typeof quiz>["questions"][0]
  ) => {
    if (!quiz) return;
    setCurrentQuiz(quiz);
    setCurrentQuestion(question);
    setOpen("update-question");
  };

  const handleDeleteQuestion = (
    question: NonNullable<typeof quiz>["questions"][0]
  ) => {
    setCurrentQuestion(question);
    setOpen("delete-question");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg">Quiz</h3>
          <p className="text-muted-foreground text-sm">
            Configure o quiz de conhecimento para cada cargo
          </p>
        </div>
        <Select
          onValueChange={setSelectedJobTypeId}
          value={selectedJobTypeId || ""}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            {jobTypes.map((jobType) => (
              <SelectItem key={jobType.id} value={jobType.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: jobType.color }}
                  />
                  {jobType.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedJobTypeId ? (
        isFetching ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando quiz...</p>
          </div>
        ) : quiz ? (
          <div className="space-y-4">
            {/* Quiz Settings Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{quiz.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {quiz.active ? null : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                    <Button
                      onClick={handleEditQuiz}
                      size="sm"
                      variant="outline"
                    >
                      <Edit2 className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      onClick={handleDeleteQuiz}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="mr-1 h-3 w-3 text-destructive" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {quiz.description ? (
                  <p className="mb-2 text-muted-foreground text-sm">
                    {quiz.description}
                  </p>
                ) : null}
                <p className="text-muted-foreground text-sm">
                  Nota mínima para aprovação:{" "}
                  <strong>{quiz.passingScore}%</strong>
                </p>
              </CardContent>
            </Card>

            {/* Questions Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Perguntas ({quiz.questions?.length || 0})
                </h4>
                <Button onClick={handleCreateQuestion} size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  Adicionar pergunta
                </Button>
              </div>

              {quiz.questions?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-center text-muted-foreground text-sm">
                      Nenhuma pergunta cadastrada. Adicione perguntas ao quiz.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                quiz.questions?.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-xs">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-sm">
                              {question.question}
                            </CardTitle>
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div
                                  className={`flex items-center gap-2 text-sm ${
                                    optIndex === question.correctAnswer
                                      ? "font-medium text-green-600"
                                      : "text-muted-foreground"
                                  }`}
                                  key={optIndex}
                                >
                                  <span className="w-5">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span>{option}</span>
                                  {optIndex === question.correctAnswer ? (
                                    <Badge
                                      className="h-4 px-1 text-xs"
                                      variant="secondary"
                                    >
                                      Correta
                                    </Badge>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {question.active ? null : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                          <Button
                            onClick={() => handleEditQuestion(question)}
                            size="icon"
                            variant="ghost"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(question)}
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h4 className="font-medium">Nenhum quiz cadastrado</h4>
              <p className="mt-1 text-center text-muted-foreground text-sm">
                Crie um quiz para este cargo.
              </p>
              <Button className="mt-4" onClick={handleCreateQuiz}>
                <Plus className="mr-2 h-4 w-4" />
                Criar quiz
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h4 className="font-medium">Selecione um cargo</h4>
            <p className="mt-1 text-center text-muted-foreground text-sm">
              Escolha um cargo acima para visualizar e gerenciar seu quiz.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
