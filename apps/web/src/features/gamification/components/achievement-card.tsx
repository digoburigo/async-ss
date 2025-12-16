import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/base-ui/badge";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@acme/ui/base-ui/progress";
import { CheckCircle2, Lock, Trophy } from "lucide-react";

import { MILESTONE_COLORS, MILESTONE_ICONS } from "../index";

type Achievement = {
  id: string;
  name: string;
  description: string;
  points: number;
  milestoneType: string;
  milestoneCount: number;
  icon: string | null;
  earned: boolean;
  currentCount: number;
  progressPercentage: number;
};

type AchievementCardProps = {
  achievement: Achievement;
  delay?: number;
};

export function AchievementCard({
  achievement,
  delay = 0,
}: AchievementCardProps) {
  const isEarned = achievement.earned;
  const progress = achievement.progressPercentage;
  const Icon = MILESTONE_ICONS[achievement.milestoneType] || Trophy;
  const colors =
    MILESTONE_COLORS[achievement.milestoneType] || MILESTONE_COLORS.onboarding;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-300",
        isEarned
          ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-green-500/5"
          : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Earned overlay effect */}
      {isEarned && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      )}

      {/* Content */}
      <div className="relative">
        <div className="mb-3 flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110",
              isEarned
                ? "bg-gradient-to-br from-emerald-400/30 to-green-500/20"
                : colors.bg
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                isEarned ? "text-emerald-500" : colors.text
              )}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold leading-tight">{achievement.name}</p>
              {isEarned && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="mt-0.5 text-muted-foreground text-sm leading-snug">
              {achievement.description}
            </p>
          </div>
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {achievement.currentCount} / {achievement.milestoneCount}
            </span>
            <Badge
              className={cn(
                isEarned && "bg-emerald-500 text-white hover:bg-emerald-500"
              )}
              variant={isEarned ? "default" : "secondary"}
            >
              {isEarned ? "Conquistado" : <>+{achievement.points} pts</>}
            </Badge>
          </div>

          <Progress value={progress}>
            <ProgressTrack
              className={cn("h-2", isEarned ? "bg-emerald-500/20" : "bg-muted")}
            >
              <ProgressIndicator
                className={cn(
                  "transition-all duration-500",
                  isEarned
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-gradient-to-r from-violet-500 to-purple-500"
                )}
              />
            </ProgressTrack>
          </Progress>
        </div>
      </div>

      {/* Locked indicator for 0 progress */}
      {!isEarned && achievement.currentCount === 0 && (
        <div className="pointer-events-none absolute top-3 right-3">
          <Lock className="h-4 w-4 text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
}
