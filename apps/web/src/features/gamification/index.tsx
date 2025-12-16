"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/base-ui/card";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import {
  BookOpen,
  Calendar,
  ListChecks,
  ShoppingCart,
  Target,
  Trophy,
} from "lucide-react";

import { authClient } from "~/clients/auth-client";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import { AchievementCard } from "./components/achievement-card";
import { PointsHero } from "./components/points-hero";
import { RecentAchievements } from "./components/recent-achievements";
import { StatCard } from "./components/stat-card";

export const MILESTONE_ICONS: Record<string, React.ElementType> = {
  sales: ShoppingCart,
  events: Calendar,
  kanban_tasks: ListChecks,
  onboarding: BookOpen,
};

export const MILESTONE_COLORS: Record<
  string,
  { bg: string; text: string; glow: string }
> = {
  sales: {
    bg: "from-emerald-500/20 to-emerald-600/10",
    text: "text-emerald-500",
    glow: "shadow-emerald-500/25",
  },
  events: {
    bg: "from-blue-500/20 to-blue-600/10",
    text: "text-blue-500",
    glow: "shadow-blue-500/25",
  },
  kanban_tasks: {
    bg: "from-orange-500/20 to-orange-600/10",
    text: "text-orange-500",
    glow: "shadow-orange-500/25",
  },
  onboarding: {
    bg: "from-violet-500/20 to-violet-600/10",
    text: "text-violet-500",
    glow: "shadow-violet-500/25",
  },
};

const MILESTONE_LABELS: Record<string, string> = {
  sales: "Vendas",
  events: "Eventos",
  kanban_tasks: "Tarefas",
  onboarding: "Onboarding",
};

export function Gamification() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();
  const client = useClientQueries(schema);

  const { data: userScore, isLoading: isLoadingScore } =
    client.userScore.useFindFirst(
      {
        where: { userId: session?.user?.id },
      },
      {
        enabled: !!activeOrganization?.id && !!session?.user?.id,
      }
    );

  const { data: actionCounts = [], isLoading: isLoadingCounts } =
    client.userActionCount.useFindMany(
      {
        where: { userId: session?.user?.id },
      },
      {
        enabled: !!activeOrganization?.id && !!session?.user?.id,
      }
    );

  const { data: achievements = [], isLoading: isLoadingAchievements } =
    client.achievement.useFindMany(
      {},
      {
        enabled: !!activeOrganization?.id,
      }
    );

  const { data: userAchievements = [], isLoading: isLoadingUserAchievements } =
    client.userAchievement.useFindMany(
      {
        where: { userId: session?.user?.id },
        include: { achievement: true },
      },
      {
        enabled: !!activeOrganization?.id && !!session?.user?.id,
      }
    );

  const isLoading =
    isLoadingScore ||
    isLoadingCounts ||
    isLoadingAchievements ||
    isLoadingUserAchievements;

  const totalPoints = userScore?.totalPoints ?? 0;
  const earnedAchievementIds = new Set(
    userAchievements.map((ua) => ua.achievementId)
  );

  const actionCountMap = actionCounts.reduce(
    (acc, ac) => {
      acc[ac.actionType] = ac.count;
      return acc;
    },
    {} as Record<string, number>
  );

  const recentAchievements = userAchievements
    .sort(
      (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    )
    .slice(0, 5);

  const availableAchievements = achievements.map((achievement) => {
    const currentCount = actionCountMap[achievement.milestoneType] ?? 0;
    const progressPercentage = Math.min(
      (currentCount / achievement.milestoneCount) * 100,
      100
    );
    return {
      ...achievement,
      earned: earnedAchievementIds.has(achievement.id),
      currentCount,
      progressPercentage,
    };
  });

  if (isLoading) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <Search />
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/30 border-t-amber-500" />
              <Trophy className="absolute inset-0 m-auto h-6 w-6 text-amber-500" />
            </div>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h1 className="font-semibold text-lg">Conquistas</h1>
        </div>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="space-y-8">
        {/* Points Hero Section */}
        <PointsHero
          achievementsEarned={userAchievements.length}
          totalAchievements={achievements.length}
          totalPoints={totalPoints}
        />

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["sales", "events", "kanban_tasks", "onboarding"] as const).map(
            (type, index) => {
              const Icon = MILESTONE_ICONS[type];
              const colors = MILESTONE_COLORS[type];
              const count = actionCountMap[type] ?? 0;
              return (
                <StatCard
                  colors={colors}
                  count={count}
                  delay={index * 100}
                  icon={Icon}
                  key={type}
                  label={MILESTONE_LABELS[type]}
                />
              );
            }
          )}
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <RecentAchievements
            achievements={recentAchievements.map((ua) => ({
              ...ua.achievement,
              earnedAt: ua.earnedAt,
            }))}
          />
        )}

        {/* Available Achievements Grid */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                  <Target className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle>Conquistas Disponíveis</CardTitle>
                  <CardDescription>
                    Continue progredindo para desbloquear
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableAchievements.map((achievement, index) => (
                  <AchievementCard
                    achievement={achievement}
                    delay={index * 50}
                    key={achievement.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </Main>
    </>
  );
}
