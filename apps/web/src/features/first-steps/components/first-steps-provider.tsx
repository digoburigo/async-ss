import type {
  FirstStepsItem,
  FirstStepsJobType,
  FirstStepsProgress,
  FirstStepsQuiz,
  FirstStepsQuizAttempt,
  FirstStepsQuizQuestion,
} from "@acme/zen-v3/zenstack/models";
import { createContext, useContext, useState } from "react";

import useDialogState from "~/hooks/use-dialog-state";

// Extended types for entities with relations
export type StepWithProgress = FirstStepsItem & {
  progress?: FirstStepsProgress[];
};

export type JobTypeWithSteps = FirstStepsJobType & {
  steps?: StepWithProgress[];
};

export type QuizWithQuestions = FirstStepsQuiz & {
  questions?: FirstStepsQuizQuestion[];
  attempts?: FirstStepsQuizAttempt[];
};

type FirstStepsDialogType = "quiz-start" | "quiz-results";

type FirstStepsContextType = {
  // Dialog state
  open: FirstStepsDialogType | null;
  setOpen: (str: FirstStepsDialogType | null) => void;

  // Selected job type (for org admins to switch between types)
  selectedJobTypeId: string | null;
  setSelectedJobTypeId: (id: string | null) => void;

  // Quiz state
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  quizAnswers: Record<string, number>;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  // Latest attempt for results display
  latestAttempt: FirstStepsQuizAttempt | null;
  setLatestAttempt: (attempt: FirstStepsQuizAttempt | null) => void;
};

const FirstStepsContext = createContext<FirstStepsContextType | null>(null);

export function FirstStepsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<FirstStepsDialogType>(null);
  const [selectedJobTypeId, setSelectedJobTypeId] = useState<string | null>(
    null
  );
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [latestAttempt, setLatestAttempt] =
    useState<FirstStepsQuizAttempt | null>(null);

  return (
    <FirstStepsContext.Provider
      value={{
        open,
        setOpen,
        selectedJobTypeId,
        setSelectedJobTypeId,
        isQuizActive,
        setIsQuizActive,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        quizAnswers,
        setQuizAnswers,
        latestAttempt,
        setLatestAttempt,
      }}
    >
      {children}
    </FirstStepsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFirstSteps() {
  const context = useContext(FirstStepsContext);
  if (!context) {
    throw new Error("useFirstSteps must be used within <FirstStepsProvider>");
  }
  return context;
}
