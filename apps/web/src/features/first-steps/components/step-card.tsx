import { cn } from "@acme/ui";
import { Button } from "@acme/ui/base-ui/button";
import { Checkbox } from "@acme/ui/base-ui/checkbox";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useNavigate } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { ClockIcon, ExternalLinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StepCardProps = {
  step: {
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
  userId: string;
};

export function StepCard({ step, userId }: StepCardProps) {
  const client = useClientQueries(schema);
  const navigate = useNavigate();

  // Find the user's progress for this step
  const userProgress = step.progress?.find((p) => p.userId === userId);
  const serverCompleted = userProgress?.completed ?? false;

  // Local optimistic state for instant UI feedback
  const [optimisticCompleted, setOptimisticCompleted] = useState<
    boolean | null
  >(null);

  // Reset optimistic state when server data is reconciled
  // biome-ignore lint/correctness/useExhaustiveDependencies: Reset when server state changes
  useEffect(() => {
    setOptimisticCompleted(null);
  }, [serverCompleted, userProgress?.id]);

  // Use optimistic state if set, otherwise use server state
  const isCompleted = optimisticCompleted ?? serverCompleted;

  // Create progress mutation
  const { mutate: createProgress, isPending: isCreating } =
    client.firstStepsProgress.useCreate({
      onError: (error: Error) => {
        // Revert optimistic update on error
        setOptimisticCompleted(null);
        toast.error(error.message);
      },
    });

  // Update progress mutation
  const { mutate: updateProgress, isPending: isUpdating } =
    client.firstStepsProgress.useUpdate({
      onError: (error: Error) => {
        // Revert optimistic update on error
        setOptimisticCompleted(null);
        toast.error(error.message);
      },
    });

  const isPending = isCreating || isUpdating;

  const handleToggle = () => {
    if (isPending) {
      return;
    }

    const newCompletedState = !isCompleted;

    // Apply optimistic update immediately
    setOptimisticCompleted(newCompletedState);

    if (userProgress) {
      // Update existing progress
      updateProgress({
        data: {
          completed: newCompletedState,
          completedAt: newCompletedState ? new Date() : null,
        },
        where: { id: userProgress.id },
      });
    } else {
      // Create new progress entry
      createProgress({
        data: {
          userId,
          stepId: step.id,
          completed: true,
          completedAt: new Date(),
        },
      });
    }
  };

  const handleLinkClick = () => {
    if (step.linkType === "internal" && step.linkUrl) {
      navigate({ to: step.linkUrl as "/" });
    } else if (step.linkType === "external" && step.linkUrl) {
      if (step.linkOpenInNewTab) {
        window.open(step.linkUrl, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = step.linkUrl;
      }
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors",
        isCompleted && "bg-muted/50"
      )}
    >
      <Checkbox
        checked={isCompleted}
        className="mt-0.5"
        disabled={isPending}
        onCheckedChange={handleToggle}
      />

      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <button
            className={cn(
              "cursor-pointer select-none text-left font-medium text-sm leading-tight",
              isCompleted && "text-muted-foreground line-through",
              isPending && "pointer-events-none opacity-50"
            )}
            disabled={isPending}
            onClick={handleToggle}
            type="button"
          >
            {step.title}
          </button>
          {step.estimatedMinutes ? (
            <div className="flex shrink-0 items-center gap-1 text-muted-foreground text-xs">
              <ClockIcon className="size-3" />
              <span>{step.estimatedMinutes} min</span>
            </div>
          ) : null}
        </div>

        <p className="text-muted-foreground text-sm">{step.description}</p>

        {step.linkType !== "none" && step.linkUrl ? (
          <Button
            className="mt-2"
            disabled={isPending}
            onClick={handleLinkClick}
            size="sm"
            variant="outline"
          >
            {step.linkLabel ||
              (step.linkType === "external" ? "Abrir link" : "Ir para")}
            {step.linkType === "external" ? (
              <ExternalLinkIcon className="ml-1 size-3" />
            ) : null}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
