"use client";

import {
  Award,
  BookOpen,
  Calendar,
  ListChecks,
  ShoppingCart,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { fetchUserScore, type GamificationSummary } from "@/lib/gamification";
import { cn } from "@/lib/utils";

const actionIcons: Record<string, any> = {
  sales: ShoppingCart,
  events: Calendar,
  kanban_tasks: ListChecks,
  onboarding: BookOpen,
};

export default function GamificationPage() {
  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserScore();
        setSummary(data);
      } catch (error) {
        console.error("Failed to load gamification data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Erro ao carregar dados de gamificação
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">
          Conquistas e Pontuação
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso e conquiste novos objetivos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Pontos Totais</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{summary.total_points}</div>
            <p className="text-muted-foreground text-xs">Pontos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Conquistas</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {summary.achievements_earned}
            </div>
            <p className="text-muted-foreground text-xs">
              Objetivos alcançados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Vendas Criadas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {summary.action_counts.sales?.count || 0}
            </div>
            <p className="text-muted-foreground text-xs">Pedidos de venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Eventos Agendados
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {summary.action_counts.events?.count || 0}
            </div>
            <p className="text-muted-foreground text-xs">No calendário</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Tarefas Concluídas
            </CardTitle>
            <ListChecks className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {summary.action_counts.kanban_tasks?.count || 0}
            </div>
            <p className="text-muted-foreground text-xs">
              Movidas para "Finalizado"
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Integração</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {summary.action_counts.onboarding?.count || 0}
            </div>
            <p className="text-muted-foreground text-xs">
              Primeiros passos completos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {summary.recent_achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conquistas Recentes</CardTitle>
            <CardDescription>Seus últimos objetivos alcançados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.recent_achievements.map((achievement, index) => (
                <div
                  className="flex items-start gap-4 rounded-lg bg-accent/50 p-4"
                  key={index}
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{achievement.name}</div>
                    <div className="text-muted-foreground text-sm">
                      {achievement.description}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">
                        +{achievement.points} pontos
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(achievement.earned_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Conquistas Disponíveis</CardTitle>
          <CardDescription>
            Continue trabalhando para desbloquear estes objetivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {summary.available_achievements.map((achievement) => {
              const isEarned = achievement.earned;
              const progress = achievement.progress_percentage || 0;

              return (
                <div
                  className={cn(
                    "rounded-lg border-2 p-4 transition-all",
                    isEarned
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-border bg-card hover:border-primary"
                  )}
                  key={achievement.id}
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className={cn("text-3xl", isEarned && "grayscale-0")}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-semibold">
                        {achievement.name}
                        {isEarned && (
                          <Badge className="text-green-600" variant="outline">
                            Conquistado
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-muted-foreground text-sm">
                        {achievement.description}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progresso: {achievement.current_count || 0}/
                        {achievement.milestone_count}
                      </span>
                      <Badge variant="secondary">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    <Progress className="h-2" value={progress} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
