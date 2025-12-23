import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui/base-ui/tabs";
import { BookOpenIcon, ListChecksIcon } from "lucide-react";

import { QuizTab } from "./quiz-tab";
import { StepsList } from "./steps-list";

type Step = {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  linkType: string;
  linkUrl: string | null;
  linkLabel: string | null;
  linkOpenInNewTab: boolean;
  estimatedMinutes: number | null;
  progress?: Array<{
    id: string;
    userId: string;
    completed: boolean;
  }>;
};

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions?: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string | null;
    orderIndex: number;
  }>;
  attempts?: Array<{
    id: string;
    userId: string;
    score: number;
    passed: boolean;
    completedAt: Date;
  }>;
};

type FirstStepsTabsProps = {
  steps: Step[];
  quiz: Quiz | null;
  userId: string;
  hasQuiz?: boolean;
};

export function FirstStepsTabs({
  steps,
  quiz,
  userId,
  hasQuiz = false,
}: FirstStepsTabsProps) {
  return (
    <Tabs defaultValue="steps">
      <TabsList>
        <TabsTrigger value="steps">
          <ListChecksIcon className="mr-2 size-4" />
          Passos
        </TabsTrigger>
        {hasQuiz ? (
          <TabsTrigger value="quiz">
            <BookOpenIcon className="mr-2 size-4" />
            Quiz
          </TabsTrigger>
        ) : null}
      </TabsList>

      <TabsContent className="mt-6" value="steps">
        <StepsList steps={steps} userId={userId} />
      </TabsContent>

      {hasQuiz ? (
        <TabsContent className="mt-6" value="quiz">
          <QuizTab quiz={quiz} userId={userId} />
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
