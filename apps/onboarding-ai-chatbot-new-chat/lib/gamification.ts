// Client-side utilities for gamification features

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  milestone_type: string;
  milestone_count: number;
  icon: string;
  earned?: boolean;
  earned_at?: string;
  current_count?: number;
  progress_percentage?: number;
}

export interface GamificationSummary {
  total_points: number;
  achievements_earned: number;
  recent_achievements: Array<{
    name: string;
    description: string;
    points: number;
    icon: string;
    earned_at: string;
  }>;
  action_counts: Record<
    string,
    {
      count: number;
      last_action_at: string;
    }
  >;
  available_achievements: Achievement[];
}

export async function fetchUserScore(): Promise<GamificationSummary> {
  const response = await fetch("/api/gamification/score");
  if (!response.ok) {
    throw new Error("Failed to fetch user score");
  }
  return response.json();
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const response = await fetch("/api/gamification/achievements");
  if (!response.ok) {
    throw new Error("Failed to fetch achievements");
  }
  return response.json();
}

export function formatPoints(points: number): string {
  return `${points} pts`;
}

export function getActionTypeLabel(actionType: string): string {
  const labels: Record<string, string> = {
    sales: "Vendas Criadas",
    events: "Eventos Agendados",
    kanban_tasks: "Tarefas Concluídas",
    onboarding: "Integração Completa",
  };
  return labels[actionType] || actionType;
}

export function getActionTypeDescription(actionType: string): string {
  const descriptions: Record<string, string> = {
    sales: "Pedidos de venda criados",
    events: "Eventos no calendário",
    kanban_tasks: "Tarefas finalizadas no Kanban",
    onboarding: "Processo de integração",
  };
  return descriptions[actionType] || actionType;
}
