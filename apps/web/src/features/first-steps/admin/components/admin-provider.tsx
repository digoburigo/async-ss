import type {
  FirstStepsItem,
  FirstStepsJobType,
  FirstStepsQuiz,
  FirstStepsQuizQuestion,
  Member,
} from "@acme/zen-v3/zenstack/models";
import React, { useState } from "react";

import useDialogState from "~/hooks/use-dialog-state";

type AdminDialogType =
  | "create-job-type"
  | "update-job-type"
  | "delete-job-type"
  | "create-step"
  | "update-step"
  | "delete-step"
  | "create-quiz"
  | "update-quiz"
  | "delete-quiz"
  | "create-question"
  | "update-question"
  | "delete-question"
  | "assign-job-type";

// Extended types for entities with relations
export type JobTypeWithSteps = FirstStepsJobType & {
  steps?: FirstStepsItem[];
  quizzes?: FirstStepsQuiz[];
  _count?: {
    members?: number;
    steps?: number;
  };
};

export type QuizWithQuestions = FirstStepsQuiz & {
  questions?: FirstStepsQuizQuestion[];
};

export type MemberWithJobType = Member & {
  jobType?: FirstStepsJobType | null;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

type AdminContextType = {
  open: AdminDialogType | null;
  setOpen: (str: AdminDialogType | null) => void;
  selectedJobTypeId: string | null;
  setSelectedJobTypeId: React.Dispatch<React.SetStateAction<string | null>>;
  currentJobType: JobTypeWithSteps | null;
  setCurrentJobType: React.Dispatch<
    React.SetStateAction<JobTypeWithSteps | null>
  >;
  currentStep: FirstStepsItem | null;
  setCurrentStep: React.Dispatch<React.SetStateAction<FirstStepsItem | null>>;
  currentQuiz: QuizWithQuestions | null;
  setCurrentQuiz: React.Dispatch<
    React.SetStateAction<QuizWithQuestions | null>
  >;
  currentQuestion: FirstStepsQuizQuestion | null;
  setCurrentQuestion: React.Dispatch<
    React.SetStateAction<FirstStepsQuizQuestion | null>
  >;
  currentMember: MemberWithJobType | null;
  setCurrentMember: React.Dispatch<
    React.SetStateAction<MemberWithJobType | null>
  >;
};

const AdminContext = React.createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AdminDialogType>(null);
  const [selectedJobTypeId, setSelectedJobTypeId] = useState<string | null>(
    null
  );
  const [currentJobType, setCurrentJobType] = useState<JobTypeWithSteps | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<FirstStepsItem | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizWithQuestions | null>(
    null
  );
  const [currentQuestion, setCurrentQuestion] =
    useState<FirstStepsQuizQuestion | null>(null);
  const [currentMember, setCurrentMember] = useState<MemberWithJobType | null>(
    null
  );

  return (
    <AdminContext.Provider
      value={{
        open,
        setOpen,
        selectedJobTypeId,
        setSelectedJobTypeId,
        currentJobType,
        setCurrentJobType,
        currentStep,
        setCurrentStep,
        currentQuiz,
        setCurrentQuiz,
        currentQuestion,
        setCurrentQuestion,
        currentMember,
        setCurrentMember,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdmin = () => {
  const adminContext = React.useContext(AdminContext);

  if (!adminContext) {
    throw new Error("useAdmin has to be used within <AdminProvider>");
  }

  return adminContext;
};
