"use client"

import { useEffect, useState } from "react"
import { Award, TrendingUp, Target, Trophy, Calendar, ShoppingCart, ListChecks, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { fetchUserScore, type GamificationSummary, type Achievement, getActionTypeLabel } from "@/lib/gamification"
import { cn } from "@/lib/utils"

const actionIcons: Record<string, any> = {
  sales: ShoppingCart,
  events: Calendar,
  kanban_tasks: ListChecks,
  onboarding: BookOpen,
}

export default function GamificationPage() {
  const [summary, setSummary] = useState<GamificationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchUserScore()
        setSummary(data)
      } catch (error) {
        console.error("Failed to load gamification data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Erro ao carregar dados de gamificação</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Conquistas e Pontuação</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso e conquiste novos objetivos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_points}</div>
            <p className="text-xs text-muted-foreground">Pontos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.achievements_earned}</div>
            <p className="text-xs text-muted-foreground">Objetivos alcançados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Criadas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.action_counts.sales?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Pedidos de venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.action_counts.events?.count || 0}</div>
            <p className="text-xs text-muted-foreground">No calendário</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Concluídas</CardTitle>
            <ListChecks className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.action_counts.kanban_tasks?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Movidas para "Finalizado"</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integração</CardTitle>
            <BookOpen className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.action_counts.onboarding?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Primeiros passos completos</p>
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
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-accent/50">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{achievement.name}</div>
                    <div className="text-sm text-muted-foreground">{achievement.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">+{achievement.points} pontos</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.earned_at).toLocaleDateString("pt-BR")}
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
          <CardDescription>Continue trabalhando para desbloquear estes objetivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {summary.available_achievements.map((achievement) => {
              const isEarned = achievement.earned
              const progress = achievement.progress_percentage || 0

              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    isEarned
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-border bg-card hover:border-primary",
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("text-3xl", isEarned && "grayscale-0")}>{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {achievement.name}
                        {isEarned && <Badge variant="outline" className="text-green-600">Conquistado</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{achievement.description}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progresso: {achievement.current_count || 0}/{achievement.milestone_count}
                      </span>
                      <Badge variant="secondary">+{achievement.points} pts</Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
