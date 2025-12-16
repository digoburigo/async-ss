import { schema } from "@acme/zen-v3/zenstack/schema";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { useMemo } from "react";

import { authClient } from "~/clients/auth-client";

export type TimePeriod = "30days" | "90days" | "6months" | "1year";

const MONTH_NAMES_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  "30days": "30 dias",
  "90days": "90 dias",
  "6months": "6 meses",
  "1year": "1 ano",
};

function getCutoffDate(timePeriod: TimePeriod): Date {
  const now = new Date();
  const days: Record<TimePeriod, number> = {
    "30days": 30,
    "90days": 90,
    "6months": 180,
    "1year": 365,
  };
  return new Date(now.getTime() - days[timePeriod] * 24 * 60 * 60 * 1000);
}

// KPI Types
export type HRKpiData = {
  // Preboarding
  totalCandidates: number;
  activeCandidates: number;
  openPositions: number;
  scheduledInterviews: number;
  // Onboarding
  onboardingProcesses: number;
  checklistCompletion: number;
  // Routine
  totalEvents: number;
  kanbanTasks: number;
  meetings: number;
  // Offboarding
  offboardingProcesses: number;
  pendingHandovers: number;
};

// Chart Types
export type CandidatesByStage = {
  stage: string;
  count: number;
  color: string;
};

export type OnboardingProgress = {
  month: string;
  completed: number;
  inProgress: number;
};

export type EventsByType = {
  type: string;
  label: string;
  count: number;
  color: string;
};

export type OffboardingByStatus = {
  status: string;
  label: string;
  count: number;
  color: string;
};

export type CandidatesOverTime = {
  month: string;
  hired: number;
  rejected: number;
  pending: number;
};

export type PositionsByDepartment = {
  department: string;
  open: number;
  filled: number;
};

export type HRIndicatorsData = {
  kpis: HRKpiData;
  candidatesByStage: CandidatesByStage[];
  onboardingProgress: OnboardingProgress[];
  eventsByType: EventsByType[];
  offboardingByStatus: OffboardingByStatus[];
  candidatesOverTime: CandidatesOverTime[];
  positionsByDepartment: PositionsByDepartment[];
  isLoading: boolean;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  MEETING: "Reunião",
  ONBOARDING: "Onboarding",
  TRAINING: "Treinamento",
  INTERVIEW: "Entrevista",
  TASK: "Tarefa",
  OTHER: "Outro",
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  MEETING: "hsl(var(--chart-1))",
  ONBOARDING: "hsl(var(--chart-2))",
  TRAINING: "hsl(var(--chart-3))",
  INTERVIEW: "hsl(var(--chart-4))",
  TASK: "hsl(var(--chart-5))",
  OTHER: "hsl(220 10% 50%)",
};

const OFFBOARDING_STATUS_LABELS: Record<string, string> = {
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const OFFBOARDING_STATUS_COLORS: Record<string, string> = {
  in_progress: "hsl(var(--chart-2))",
  completed: "hsl(var(--chart-3))",
  cancelled: "hsl(var(--chart-4))",
};

const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  hired: "Contratado",
  rejected: "Rejeitado",
  withdrawn: "Desistiu",
};

export function useHRIndicatorsData(timePeriod: TimePeriod): HRIndicatorsData {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const zenClient = useClientQueries(schema);

  const cutoffDate = useMemo(() => getCutoffDate(timePeriod), [timePeriod]);
  const cutoffDateISO = cutoffDate.toISOString();

  const isEnabled = Boolean(activeOrganization?.id);

  // Preboarding queries
  const { data: candidates = [], isLoading: isLoadingCandidates } =
    zenClient.preboardingCandidate.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
        include: {
          stage: true,
          jobPosition: true,
        },
      },
      { enabled: isEnabled }
    );

  const { data: jobPositions = [], isLoading: isLoadingPositions } =
    zenClient.preboardingJobPosition.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  const { data: interviews = [], isLoading: isLoadingInterviews } =
    zenClient.preboardingInterview.useFindMany(
      {
        where: {
          scheduledAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  const { data: stages = [], isLoading: isLoadingStages } =
    zenClient.preboardingStage.useFindMany({}, { enabled: isEnabled });

  // Onboarding queries
  const { data: onboardingProcesses = [], isLoading: isLoadingOnboarding } =
    zenClient.onboardingProcess.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  const { data: checklistProgress = [], isLoading: isLoadingChecklist } =
    zenClient.onboardingChecklistProgress.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  // Routine queries
  const { data: calendarEvents = [], isLoading: isLoadingEvents } =
    zenClient.calendarEvent.useFindMany(
      {
        where: {
          start: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  const { data: kanbanCards = [], isLoading: isLoadingKanban } =
    zenClient.kanbanCard.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  const { data: meetingsData = [], isLoading: isLoadingMeetings } =
    zenClient.meeting.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  // Offboarding queries
  const {
    data: offboardingProcessesData = [],
    isLoading: isLoadingOffboarding,
  } = zenClient.offboardingProcess.useFindMany(
    {
      where: {
        createdAt: { gte: cutoffDateISO },
      },
    },
    { enabled: isEnabled }
  );

  const { data: handoverTasks = [], isLoading: isLoadingHandovers } =
    zenClient.offboardingHandoverTask.useFindMany(
      {
        where: {
          createdAt: { gte: cutoffDateISO },
        },
      },
      { enabled: isEnabled }
    );

  const isLoading =
    isLoadingCandidates ||
    isLoadingPositions ||
    isLoadingInterviews ||
    isLoadingStages ||
    isLoadingOnboarding ||
    isLoadingChecklist ||
    isLoadingEvents ||
    isLoadingKanban ||
    isLoadingMeetings ||
    isLoadingOffboarding ||
    isLoadingHandovers;

  // Compute KPIs
  const kpis = useMemo<HRKpiData>(() => {
    const activeCandidatesCount = candidates.filter(
      (c) => c.status === "active"
    ).length;
    const openPositionsCount = jobPositions.filter(
      (p) => p.status === "aberta"
    ).length;
    const scheduledInterviewsCount = interviews.filter(
      (i) => i.status === "scheduled"
    ).length;
    const completedChecklist = checklistProgress.filter(
      (p) => p.completed
    ).length;
    const checklistCompletionRate =
      checklistProgress.length > 0
        ? Math.round((completedChecklist / checklistProgress.length) * 100)
        : 0;
    const meetingsCount = calendarEvents.filter(
      (e) => e.eventType === "MEETING"
    ).length;
    const pendingHandoversCount = handoverTasks.filter(
      (t) => t.status === "pending" || t.status === "in_progress"
    ).length;

    return {
      totalCandidates: candidates.length,
      activeCandidates: activeCandidatesCount,
      openPositions: openPositionsCount,
      scheduledInterviews: scheduledInterviewsCount,
      onboardingProcesses: onboardingProcesses.length,
      checklistCompletion: checklistCompletionRate,
      totalEvents: calendarEvents.length,
      kanbanTasks: kanbanCards.length,
      meetings: meetingsCount,
      offboardingProcesses: offboardingProcessesData.length,
      pendingHandovers: pendingHandoversCount,
    };
  }, [
    candidates,
    jobPositions,
    interviews,
    onboardingProcesses,
    checklistProgress,
    calendarEvents,
    kanbanCards,
    offboardingProcessesData,
    handoverTasks,
  ]);

  // Candidates by stage
  const candidatesByStage = useMemo<CandidatesByStage[]>(() => {
    const stageMap = new Map<string, { count: number; color: string }>();

    // Initialize all stages
    for (const stage of stages) {
      stageMap.set(stage.name, { count: 0, color: stage.color });
    }

    // Count candidates per stage
    for (const candidate of candidates) {
      if (candidate.stage) {
        const existing = stageMap.get(candidate.stage.name);
        if (existing) {
          stageMap.set(candidate.stage.name, {
            ...existing,
            count: existing.count + 1,
          });
        }
      }
    }

    return Array.from(stageMap.entries())
      .map(([stage, data]) => ({
        stage,
        count: data.count,
        color: data.color,
      }))
      .filter((s) => s.count > 0);
  }, [candidates, stages]);

  // Onboarding progress by month
  const onboardingProgress = useMemo<OnboardingProgress[]>(() => {
    const monthMap = new Map<
      string,
      { completed: number; inProgress: number }
    >();

    for (const progress of checklistProgress) {
      const date = new Date(progress.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthMap.get(monthKey) ?? {
        completed: 0,
        inProgress: 0,
      };
      monthMap.set(monthKey, {
        completed: existing.completed + (progress.completed ? 1 : 0),
        inProgress: existing.inProgress + (progress.completed ? 0 : 1),
      });
    }

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [, month] = key.split("-");
        const monthIndex = Number.parseInt(month ?? "1", 10) - 1;
        return {
          month: MONTH_NAMES_PT[monthIndex] ?? "?",
          completed: value.completed,
          inProgress: value.inProgress,
        };
      });
  }, [checklistProgress]);

  // Events by type
  const eventsByType = useMemo<EventsByType[]>(() => {
    const typeMap = new Map<string, number>();

    for (const event of calendarEvents) {
      const type = event.eventType ?? "OTHER";
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }

    return Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type,
        label: EVENT_TYPE_LABELS[type] ?? type,
        count,
        color: EVENT_TYPE_COLORS[type] ?? "hsl(220 10% 50%)",
      }))
      .sort((a, b) => b.count - a.count);
  }, [calendarEvents]);

  // Offboarding by status
  const offboardingByStatus = useMemo<OffboardingByStatus[]>(() => {
    const statusMap = new Map<string, number>();

    for (const process of offboardingProcessesData) {
      const status = process.status ?? "in_progress";
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    }

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      label: OFFBOARDING_STATUS_LABELS[status] ?? status,
      count,
      color: OFFBOARDING_STATUS_COLORS[status] ?? "hsl(220 10% 50%)",
    }));
  }, [offboardingProcessesData]);

  // Candidates over time
  const candidatesOverTime = useMemo<CandidatesOverTime[]>(() => {
    const monthMap = new Map<
      string,
      { hired: number; rejected: number; pending: number }
    >();

    for (const candidate of candidates) {
      const date = new Date(candidate.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthMap.get(monthKey) ?? {
        hired: 0,
        rejected: 0,
        pending: 0,
      };

      const status = candidate.status ?? "active";
      if (status === "hired") {
        existing.hired += 1;
      } else if (status === "rejected" || status === "withdrawn") {
        existing.rejected += 1;
      } else {
        existing.pending += 1;
      }

      monthMap.set(monthKey, existing);
    }

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [, month] = key.split("-");
        const monthIndex = Number.parseInt(month ?? "1", 10) - 1;
        return {
          month: MONTH_NAMES_PT[monthIndex] ?? "?",
          ...value,
        };
      });
  }, [candidates]);

  // Positions by department
  const positionsByDepartment = useMemo<PositionsByDepartment[]>(() => {
    const deptMap = new Map<string, { open: number; filled: number }>();

    for (const position of jobPositions) {
      const dept = position.department ?? "Sem departamento";
      const existing = deptMap.get(dept) ?? { open: 0, filled: 0 };

      if (position.status === "aberta") {
        existing.open += position.vacancies - position.filledVacancies;
        existing.filled += position.filledVacancies;
      } else if (position.status === "preenchida") {
        existing.filled += position.vacancies;
      }

      deptMap.set(dept, existing);
    }

    return Array.from(deptMap.entries())
      .map(([department, data]) => ({
        department,
        ...data,
      }))
      .sort((a, b) => b.open + b.filled - (a.open + a.filled));
  }, [jobPositions]);

  return {
    kpis,
    candidatesByStage,
    onboardingProgress,
    eventsByType,
    offboardingByStatus,
    candidatesOverTime,
    positionsByDepartment,
    isLoading,
  };
}
