import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@acme/ui/base-ui/progress";

type ProgressIndicatorProps = {
  completedSteps: number;
  totalSteps: number;
  className?: string;
};

export function ProgressIndicator({
  completedSteps,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <Progress className={className} value={percentage}>
      <div className="flex w-full items-center justify-between">
        <ProgressLabel>
          {completedSteps} de {totalSteps} passos concluídos
        </ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  );
}
