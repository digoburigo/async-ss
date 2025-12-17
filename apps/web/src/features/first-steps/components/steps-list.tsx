import { ProgressIndicator } from "./progress-indicator";
import { StepCard } from "./step-card";

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

type StepsListProps = {
  steps: Step[];
  userId: string;
};

export function StepsList({ steps, userId }: StepsListProps) {
  // Sort steps by orderIndex
  const sortedSteps = [...steps].sort((a, b) => a.orderIndex - b.orderIndex);

  // Calculate completed steps for this user
  const completedSteps = sortedSteps.filter((step) =>
    step.progress?.some((p) => p.userId === userId && p.completed)
  ).length;

  return (
    <div className="space-y-6">
      <ProgressIndicator
        completedSteps={completedSteps}
        totalSteps={sortedSteps.length}
      />

      <div className="space-y-3">
        {sortedSteps.map((step) => (
          <StepCard key={step.id} step={step} userId={userId} />
        ))}
      </div>

      {sortedSteps.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum passo configurado para este tipo de cargo.
          </p>
        </div>
      )}
    </div>
  );
}
