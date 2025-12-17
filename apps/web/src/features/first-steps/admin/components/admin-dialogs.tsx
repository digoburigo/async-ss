import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@acme/ui/sheet";
import { schema } from "@acme/zen-v3/zenstack/schema";

import { ConfirmDialog } from "~/components/confirm-dialog";
import { useAdmin } from "./admin-provider";
import { JobTypeForm } from "./job-type-form";
import { QuestionForm } from "./question-form";
import { QuizForm } from "./quiz-form";
import { StepForm } from "./step-form";

export function AdminDialogs() {
  const {
    open,
    setOpen,
    currentJobType,
    setCurrentJobType,
    currentStep,
    setCurrentStep,
    currentQuiz,
    setCurrentQuiz,
    currentQuestion,
    setCurrentQuestion,
  } = useAdmin();
  const client = useClientQueries(schema);

  // Job Type mutations
  const { mutate: createJobType, isPending: isCreatingJobType } =
    client.firstStepsJobType.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Cargo criado com sucesso");
        setOpen(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateJobType, isPending: isUpdatingJobType } =
    client.firstStepsJobType.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Cargo atualizado com sucesso");
        setOpen(null);
        setTimeout(() => setCurrentJobType(null), 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutateAsync: deleteJobType } = client.firstStepsJobType.useDelete({
    optimisticUpdate: true,
    onSuccess: () => {
      toast.success("Cargo excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Step mutations
  const { mutate: createStep, isPending: isCreatingStep } =
    client.firstStepsItem.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Passo criado com sucesso");
        setOpen(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateStep, isPending: isUpdatingStep } =
    client.firstStepsItem.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Passo atualizado com sucesso");
        setOpen(null);
        setTimeout(() => setCurrentStep(null), 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutateAsync: deleteStep } = client.firstStepsItem.useDelete({
    optimisticUpdate: true,
    onSuccess: () => {
      toast.success("Passo excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Quiz mutations
  const { mutate: createQuiz, isPending: isCreatingQuiz } =
    client.firstStepsQuiz.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Quiz criado com sucesso");
        setOpen(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateQuiz, isPending: isUpdatingQuiz } =
    client.firstStepsQuiz.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Quiz atualizado com sucesso");
        setOpen(null);
        setTimeout(() => setCurrentQuiz(null), 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutateAsync: deleteQuiz } = client.firstStepsQuiz.useDelete({
    optimisticUpdate: true,
    onSuccess: () => {
      toast.success("Quiz excluído com sucesso");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Question mutations
  const { mutate: createQuestion, isPending: isCreatingQuestion } =
    client.firstStepsQuizQuestion.useCreate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Pergunta criada com sucesso");
        setOpen(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutate: updateQuestion, isPending: isUpdatingQuestion } =
    client.firstStepsQuizQuestion.useUpdate({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Pergunta atualizada com sucesso");
        setOpen(null);
        setTimeout(() => setCurrentQuestion(null), 500);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const { mutateAsync: deleteQuestion } =
    client.firstStepsQuizQuestion.useDelete({
      optimisticUpdate: true,
      onSuccess: () => {
        toast.success("Pergunta excluída com sucesso");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // Handlers
  const handleJobTypeSubmit = async (data: {
    name: string;
    description?: string;
    icon?: string;
    color: string;
    active: boolean;
  }) => {
    if (currentJobType) {
      updateJobType({
        data,
        where: { id: currentJobType.id },
      });
    } else {
      createJobType({ data });
    }
  };

  const handleDeleteJobType = async () => {
    if (!currentJobType) return;
    await deleteJobType({ where: { id: currentJobType.id } });
    setOpen(null);
    setTimeout(() => setCurrentJobType(null), 500);
  };

  const handleStepSubmit = async (data: {
    title: string;
    description: string;
    linkType: "internal" | "external" | "none";
    linkUrl?: string;
    linkLabel?: string;
    linkOpenInNewTab: boolean;
    estimatedMinutes?: number;
    active: boolean;
  }) => {
    if (currentStep) {
      updateStep({
        data,
        where: { id: currentStep.id },
      });
    } else if (currentJobType) {
      createStep({
        data: {
          ...data,
          jobTypeId: currentJobType.id,
          orderIndex: currentJobType.steps?.length || 0,
        },
      });
    }
  };

  const handleDeleteStep = async () => {
    if (!currentStep) return;
    await deleteStep({ where: { id: currentStep.id } });
    setOpen(null);
    setTimeout(() => setCurrentStep(null), 500);
  };

  const handleQuizSubmit = async (data: {
    title: string;
    description?: string;
    passingScore: number;
    active: boolean;
  }) => {
    if (currentQuiz) {
      updateQuiz({
        data,
        where: { id: currentQuiz.id },
      });
    } else if (currentJobType) {
      createQuiz({
        data: {
          ...data,
          jobTypeId: currentJobType.id,
        },
      });
    }
  };

  const handleDeleteQuiz = async () => {
    if (!currentQuiz) return;
    await deleteQuiz({ where: { id: currentQuiz.id } });
    setOpen(null);
    setTimeout(() => setCurrentQuiz(null), 500);
  };

  const handleQuestionSubmit = async (data: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    active: boolean;
  }) => {
    if (currentQuestion) {
      updateQuestion({
        data,
        where: { id: currentQuestion.id },
      });
    } else if (currentQuiz) {
      createQuestion({
        data: {
          ...data,
          quizId: currentQuiz.id,
          orderIndex: currentQuiz.questions?.length || 0,
        },
      });
    }
  };

  const handleDeleteQuestion = async () => {
    if (!currentQuestion) return;
    await deleteQuestion({ where: { id: currentQuestion.id } });
    setOpen(null);
    setTimeout(() => setCurrentQuestion(null), 500);
  };

  return (
    <>
      {/* Job Type Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            if (!currentJobType) {
              setTimeout(() => setCurrentJobType(null), 500);
            }
          }
        }}
        open={open === "create-job-type" || open === "update-job-type"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{currentJobType ? "Editar" : "Criar"} Cargo</SheetTitle>
            <SheetDescription>
              {currentJobType
                ? "Atualize as informações do cargo."
                : "Adicione um novo cargo para organizar os primeiros passos."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <JobTypeForm
              defaultValues={
                currentJobType
                  ? {
                      name: currentJobType.name,
                      description: currentJobType.description ?? undefined,
                      icon: currentJobType.icon ?? undefined,
                      color: currentJobType.color,
                      active: currentJobType.active,
                    }
                  : undefined
              }
              isSubmitting={isCreatingJobType || isUpdatingJobType}
              onSubmit={handleJobTypeSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentJobType ? (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir o cargo{" "}
              <strong>{currentJobType.name}</strong>. <br />
              Esta ação não pode ser desfeita e excluirá todos os passos e quiz
              associados.
            </>
          }
          destructive
          handleConfirm={handleDeleteJobType}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => setCurrentJobType(null), 500);
            }
          }}
          open={open === "delete-job-type"}
          title={`Excluir cargo: ${currentJobType.name}?`}
        />
      ) : null}

      {/* Step Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            setTimeout(() => setCurrentStep(null), 500);
          }
        }}
        open={open === "create-step" || open === "update-step"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{currentStep ? "Editar" : "Criar"} Passo</SheetTitle>
            <SheetDescription>
              {currentStep
                ? "Atualize as informações do passo."
                : "Adicione um novo passo ao cargo."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <StepForm
              defaultValues={
                currentStep
                  ? {
                      title: currentStep.title,
                      description: currentStep.description,
                      linkType: currentStep.linkType,
                      linkUrl: currentStep.linkUrl ?? undefined,
                      linkLabel: currentStep.linkLabel ?? undefined,
                      linkOpenInNewTab: currentStep.linkOpenInNewTab,
                      estimatedMinutes:
                        currentStep.estimatedMinutes ?? undefined,
                      active: currentStep.active,
                    }
                  : undefined
              }
              isSubmitting={isCreatingStep || isUpdatingStep}
              onSubmit={handleStepSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentStep ? (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir o passo{" "}
              <strong>{currentStep.title}</strong>. <br />
              Esta ação não pode ser desfeita.
            </>
          }
          destructive
          handleConfirm={handleDeleteStep}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => setCurrentStep(null), 500);
            }
          }}
          open={open === "delete-step"}
          title={`Excluir passo: ${currentStep.title}?`}
        />
      ) : null}

      {/* Quiz Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            setTimeout(() => setCurrentQuiz(null), 500);
          }
        }}
        open={open === "create-quiz" || open === "update-quiz"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>{currentQuiz ? "Editar" : "Criar"} Quiz</SheetTitle>
            <SheetDescription>
              {currentQuiz
                ? "Atualize as configurações do quiz."
                : "Configure o quiz para este cargo."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <QuizForm
              defaultValues={
                currentQuiz
                  ? {
                      title: currentQuiz.title,
                      description: currentQuiz.description ?? undefined,
                      passingScore: currentQuiz.passingScore,
                      active: currentQuiz.active,
                    }
                  : undefined
              }
              isSubmitting={isCreatingQuiz || isUpdatingQuiz}
              onSubmit={handleQuizSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentQuiz ? (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir o quiz{" "}
              <strong>{currentQuiz.title}</strong>. <br />
              Esta ação não pode ser desfeita e excluirá todas as perguntas.
            </>
          }
          destructive
          handleConfirm={handleDeleteQuiz}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => setCurrentQuiz(null), 500);
            }
          }}
          open={open === "delete-quiz"}
          title={`Excluir quiz: ${currentQuiz.title}?`}
        />
      ) : null}

      {/* Question Dialogs */}
      <Sheet
        onOpenChange={(v) => {
          if (!v) {
            setOpen(null);
            setTimeout(() => setCurrentQuestion(null), 500);
          }
        }}
        open={open === "create-question" || open === "update-question"}
      >
        <SheetContent className="flex flex-col">
          <SheetHeader className="text-start">
            <SheetTitle>
              {currentQuestion ? "Editar" : "Criar"} Pergunta
            </SheetTitle>
            <SheetDescription>
              {currentQuestion
                ? "Atualize a pergunta e suas opções."
                : "Adicione uma nova pergunta ao quiz."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <QuestionForm
              defaultValues={
                currentQuestion
                  ? {
                      question: currentQuestion.question,
                      options: currentQuestion.options,
                      correctAnswer: currentQuestion.correctAnswer,
                      explanation: currentQuestion.explanation ?? undefined,
                      active: currentQuestion.active,
                    }
                  : undefined
              }
              isSubmitting={isCreatingQuestion || isUpdatingQuestion}
              onSubmit={handleQuestionSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>

      {currentQuestion ? (
        <ConfirmDialog
          className="max-w-md"
          confirmText="Excluir"
          desc={
            <>
              Você está prestes a excluir esta pergunta. <br />
              Esta ação não pode ser desfeita.
            </>
          }
          destructive
          handleConfirm={handleDeleteQuestion}
          onOpenChange={(v) => {
            if (!v) {
              setOpen(null);
              setTimeout(() => setCurrentQuestion(null), 500);
            }
          }}
          open={open === "delete-question"}
          title="Excluir pergunta?"
        />
      ) : null}
    </>
  );
}
