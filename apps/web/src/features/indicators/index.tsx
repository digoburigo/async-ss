"use client";

import { cn } from "@acme/ui";
import { Avatar, AvatarFallback } from "@acme/ui/base-ui/avatar";
import { Badge } from "@acme/ui/base-ui/badge";
import { Button } from "@acme/ui/base-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/base-ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@acme/ui/base-ui/chart";
import { Input } from "@acme/ui/base-ui/input";
import { Progress } from "@acme/ui/base-ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/base-ui/select";
import { Skeleton } from "@acme/ui/base-ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@acme/ui/base-ui/tabs";
import { getRouteApi } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  LogOut,
  PieChart,
  Send,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ConfigDrawer } from "~/components/config-drawer";
import { Header } from "~/components/layout/header";
import { Main } from "~/components/layout/main";
import { ProfileDropdown } from "~/components/profile-dropdown";
import { Search } from "~/components/search";
import { ThemeSwitch } from "~/components/theme-switch";
import type { TimePeriod } from "./hooks/use-hr-indicators-data";
import {
  TIME_PERIOD_LABELS,
  useHRIndicatorsData,
} from "./hooks/use-hr-indicators-data";

const routeApi = getRouteApi("/_authenticated/indicators/");

// Animated counter hook
function useAnimatedCounter(end: number, duration = 1000): number {
  const [count, setCount] = useState(0);
  const prevEndRef = useRef(end);

  useEffect(() => {
    if (prevEndRef.current === end && count === end) return;

    const startValue = prevEndRef.current !== end ? 0 : count;
    prevEndRef.current = end;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - (1 - progress) ** 4;
      setCount(Math.floor(startValue + (end - startValue) * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, count]);

  return count;
}

// KPI Card Component
function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  gradient,
  iconColor,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  gradient: string;
  iconColor: string;
  isLoading: boolean;
}) {
  const animatedValue = useAnimatedCounter(isLoading ? 0 : value);

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-5">
          <Skeleton className="mb-3 h-10 w-10 rounded-xl" />
          <Skeleton className="mb-2 h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]",
          gradient
        )}
      />
      <CardContent className="relative p-5">
        <div
          className={cn(
            "mb-3 inline-flex rounded-xl p-2.5 transition-transform group-hover:scale-110",
            gradient
          )}
        >
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider">
          {title}
        </p>
        <p className="font-bold text-3xl tabular-nums tracking-tight">
          {animatedValue}
        </p>
        {trend !== undefined && (
          <p
            className={cn(
              "mt-2 flex items-center gap-1 font-medium text-xs",
              trend >= 0 ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend >= 0 ? "+" : ""}
            {trend}% {trendLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Stage Progress Card
function StageProgressCard({
  data,
  isLoading,
}: {
  data: { stage: string; count: number; color: string }[];
  isLoading: boolean;
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="space-y-2" key={`skeleton-${i}`}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-indigo-500" />
          Candidatos por Etapa
        </CardTitle>
        <CardDescription>
          Distribuição atual no pipeline de recrutamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            Nenhum candidato encontrado
          </p>
        ) : (
          data.map((item) => (
            <div className="space-y-2" key={item.stage}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-sm">{item.stage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm tabular-nums">
                    {item.count}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <Progress
                className="h-1.5"
                style={
                  {
                    "--progress-background": item.color,
                  } as React.CSSProperties
                }
                value={total > 0 ? (item.count / total) * 100 : 0}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Chart configs
const candidatesChartConfig: ChartConfig = {
  hired: {
    label: "Contratados",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  rejected: {
    label: "Rejeitados",
    color: "hsl(0 84.2% 60.2%)",
  },
  pending: {
    label: "Em análise",
    color: "hsl(221.2 83.2% 53.3%)",
  },
};

const onboardingChartConfig: ChartConfig = {
  completed: {
    label: "Concluídos",
    color: "hsl(142.1 76.2% 36.3%)",
  },
  inProgress: {
    label: "Em andamento",
    color: "hsl(45.4 93.4% 47.5%)",
  },
};

const positionsChartConfig: ChartConfig = {
  open: {
    label: "Abertas",
    color: "hsl(221.2 83.2% 53.3%)",
  },
  filled: {
    label: "Preenchidas",
    color: "hsl(142.1 76.2% 36.3%)",
  },
};

// AI Chat interface
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o assistente de indicadores de RH. Posso ajudar você a analisar dados de recrutamento, onboarding, rotina e offboarding. O que você gostaria de saber?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "", isLoading: true },
    ]);

    // Simulate AI response (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setMessages((prev) =>
      prev
        .filter((m) => m.id !== loadingId)
        .concat({
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "Baseado nos dados atuais, posso ver que temos uma boa taxa de conversão no pipeline de recrutamento. Gostaria de saber mais detalhes sobre alguma métrica específica?",
        })
    );
    setIsGenerating(false);
  };

  return (
    <Card className="border-2 border-primary/20 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2">
            <Sparkles className="size-4 text-white" />
          </div>
          Assistente de Indicadores
        </CardTitle>
        <CardDescription>
          Faça perguntas sobre os dados de RH e receba análises
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 h-[300px] space-y-4 overflow-y-auto rounded-lg bg-muted/30 p-4">
          {messages.map((message) => (
            <div
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
              key={message.id}
            >
              {message.role === "assistant" && (
                <Avatar className="size-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                    <Sparkles className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border bg-card"
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-sm">Analisando dados...</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </p>
                )}
              </div>
              {message.role === "user" && (
                <Avatar className="size-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {[
            "Qual a taxa de conversão?",
            "Tempo médio de contratação",
            "Análise de turnover",
          ].map((suggestion) => (
            <Button
              className="text-xs"
              key={suggestion}
              onClick={() => setInput(suggestion)}
              size="sm"
              variant="outline"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            className="flex-1"
            disabled={isGenerating}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Pergunte sobre indicadores de RH..."
            value={input}
          />
          <Button disabled={isGenerating || !input.trim()} onClick={handleSend}>
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Indicators() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1year");
  const { tab } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const activeTab = tab ?? "preboarding";

  const handleTabChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        tab:
          value === "preboarding"
            ? undefined
            : (value as "onboarding" | "rotina" | "offboarding"),
      }),
    });
  };

  const {
    kpis,
    candidatesByStage,
    onboardingProgress,
    eventsByType,
    offboardingByStatus,
    candidatesOverTime,
    positionsByDepartment,
    isLoading,
  } = useHRIndicatorsData(timePeriod);

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">
              Indicadores de RH
            </h2>
            <p className="text-muted-foreground">
              Acompanhe métricas de recrutamento, onboarding e ciclo do
              colaborador
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              onValueChange={(value) => setTimePeriod(value as TimePeriod)}
              value={timePeriod}
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 size-4 text-muted-foreground" />
                <SelectValue>{TIME_PERIOD_LABELS[timePeriod]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_PERIOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge className="gap-1.5 py-1.5" variant="outline">
              <div className="size-2 animate-pulse rounded-full bg-emerald-500" />
              Dados em tempo real
            </Badge>
          </div>
        </div>
        {/* Tabs Navigation */}
        <Tabs
          className="space-y-6"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="w-full justify-start" variant="line">
            <TabsTrigger className="gap-2" value="preboarding">
              <UserPlus className="size-4" />
              Preboarding
            </TabsTrigger>
            <TabsTrigger className="gap-2" value="onboarding">
              <UserCheck className="size-4" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger className="gap-2" value="rotina">
              <Calendar className="size-4" />
              Rotina
            </TabsTrigger>
            <TabsTrigger className="gap-2" value="offboarding">
              <UserMinus className="size-4" />
              Offboarding
            </TabsTrigger>
          </TabsList>

          {/* PREBOARDING TAB */}
          <TabsContent className="space-y-6" value="preboarding">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                icon={Users}
                iconColor="text-white"
                isLoading={isLoading}
                title="Total Candidatos"
                value={kpis.totalCandidates}
              />
              <KPICard
                gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                icon={UserCheck}
                iconColor="text-white"
                isLoading={isLoading}
                title="Candidatos Ativos"
                trend={12}
                trendLabel="vs mês anterior"
                value={kpis.activeCandidates}
              />
              <KPICard
                gradient="bg-gradient-to-br from-violet-500 to-purple-500"
                icon={Briefcase}
                iconColor="text-white"
                isLoading={isLoading}
                title="Vagas Abertas"
                value={kpis.openPositions}
              />
              <KPICard
                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                icon={Calendar}
                iconColor="text-white"
                isLoading={isLoading}
                title="Entrevistas Agendadas"
                value={kpis.scheduledInterviews}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StageProgressCard
                data={candidatesByStage}
                isLoading={isLoading}
              />

              {/* Candidates Over Time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="size-4 text-blue-500" />
                    Evolução de Candidatos
                  </CardTitle>
                  <CardDescription>
                    Acompanhamento mensal do pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : candidatesOverTime.length === 0 ? (
                    <p className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                      Sem dados para o período
                    </p>
                  ) : (
                    <ChartContainer
                      className="h-[250px] w-full"
                      config={candidatesChartConfig}
                    >
                      <AreaChart data={candidatesOverTime}>
                        <CartesianGrid
                          className="opacity-30"
                          strokeDasharray="3 3"
                        />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Area
                          dataKey="hired"
                          fill="var(--color-hired)"
                          fillOpacity={0.6}
                          stackId="1"
                          stroke="var(--color-hired)"
                          type="monotone"
                        />
                        <Area
                          dataKey="pending"
                          fill="var(--color-pending)"
                          fillOpacity={0.6}
                          stackId="1"
                          stroke="var(--color-pending)"
                          type="monotone"
                        />
                        <Area
                          dataKey="rejected"
                          fill="var(--color-rejected)"
                          fillOpacity={0.6}
                          stackId="1"
                          stroke="var(--color-rejected)"
                          type="monotone"
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Positions by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="size-4 text-violet-500" />
                  Vagas por Departamento
                </CardTitle>
                <CardDescription>
                  Distribuição de vagas abertas e preenchidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : positionsByDepartment.length === 0 ? (
                  <p className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                    Sem dados para o período
                  </p>
                ) : (
                  <ChartContainer
                    className="h-[250px] w-full"
                    config={positionsChartConfig}
                  >
                    <BarChart data={positionsByDepartment} layout="vertical">
                      <CartesianGrid
                        className="opacity-30"
                        strokeDasharray="3 3"
                      />
                      <XAxis fontSize={12} type="number" />
                      <YAxis
                        dataKey="department"
                        fontSize={12}
                        type="category"
                        width={120}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar
                        dataKey="open"
                        fill="var(--color-open)"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="filled"
                        fill="var(--color-filled)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ONBOARDING TAB */}
          <TabsContent className="space-y-6" value="onboarding">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard
                gradient="bg-gradient-to-br from-indigo-500 to-blue-500"
                icon={FileText}
                iconColor="text-white"
                isLoading={isLoading}
                title="Processos Ativos"
                value={kpis.onboardingProcesses}
              />
              <KPICard
                gradient="bg-gradient-to-br from-emerald-500 to-green-500"
                icon={CheckCircle2}
                iconColor="text-white"
                isLoading={isLoading}
                title="Taxa de Conclusão"
                trend={5}
                trendLabel="vs mês anterior"
                value={kpis.checklistCompletion}
              />
              <KPICard
                gradient="bg-gradient-to-br from-amber-500 to-yellow-500"
                icon={Calendar}
                iconColor="text-white"
                isLoading={isLoading}
                title="Eventos de Onboarding"
                value={
                  eventsByType.find((e) => e.type === "ONBOARDING")?.count ?? 0
                }
              />
              <KPICard
                gradient="bg-gradient-to-br from-violet-500 to-purple-500"
                icon={Users}
                iconColor="text-white"
                isLoading={isLoading}
                title="Treinamentos"
                value={
                  eventsByType.find((e) => e.type === "TRAINING")?.count ?? 0
                }
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Onboarding Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Progresso do Onboarding
                  </CardTitle>
                  <CardDescription>
                    Itens do checklist concluídos por mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : onboardingProgress.length === 0 ? (
                    <p className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                      Sem dados para o período
                    </p>
                  ) : (
                    <ChartContainer
                      className="h-[300px] w-full"
                      config={onboardingChartConfig}
                    >
                      <BarChart data={onboardingProgress}>
                        <CartesianGrid
                          className="opacity-30"
                          strokeDasharray="3 3"
                        />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                          dataKey="completed"
                          fill="var(--color-completed)"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="inProgress"
                          fill="var(--color-inProgress)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* AI Assistant */}
              <AIAssistant />
            </div>
          </TabsContent>

          {/* ROTINA TAB */}
          <TabsContent className="space-y-6" value="rotina">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard
                gradient="bg-gradient-to-br from-blue-500 to-indigo-500"
                icon={Calendar}
                iconColor="text-white"
                isLoading={isLoading}
                title="Total de Eventos"
                value={kpis.totalEvents}
              />
              <KPICard
                gradient="bg-gradient-to-br from-violet-500 to-purple-500"
                icon={Users}
                iconColor="text-white"
                isLoading={isLoading}
                title="Reuniões"
                trend={8}
                trendLabel="vs mês anterior"
                value={kpis.meetings}
              />
              <KPICard
                gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                icon={CheckCircle2}
                iconColor="text-white"
                isLoading={isLoading}
                title="Tarefas Kanban"
                value={kpis.kanbanTasks}
              />
              <KPICard
                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                icon={Clock}
                iconColor="text-white"
                isLoading={isLoading}
                title="Entrevistas"
                value={
                  eventsByType.find((e) => e.type === "INTERVIEW")?.count ?? 0
                }
              />
            </div>

            {/* Events by Type Chart */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="size-4 text-violet-500" />
                    Eventos por Tipo
                  </CardTitle>
                  <CardDescription>
                    Distribuição dos tipos de eventos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : eventsByType.length === 0 ? (
                    <p className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                      Sem dados para o período
                    </p>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="h-[280px] flex-1">
                        <ResponsiveContainer height="100%" width="100%">
                          <RechartsPieChart>
                            <Pie
                              cx="50%"
                              cy="50%"
                              data={eventsByType}
                              dataKey="count"
                              innerRadius={60}
                              nameKey="label"
                              outerRadius={100}
                              paddingAngle={2}
                            >
                              {eventsByType.map((entry, index) => (
                                <Cell
                                  fill={entry.color}
                                  key={`cell-${entry.type}`}
                                />
                              ))}
                            </Pie>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {eventsByType.map((item) => (
                          <div
                            className="flex items-center justify-between gap-4"
                            key={item.type}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <span className="font-semibold text-sm tabular-nums">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="size-4 text-blue-500" />
                    Resumo de Atividades
                  </CardTitle>
                  <CardDescription>
                    Visão geral das atividades do período
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton
                          className="h-16 w-full"
                          key={`activity-${i}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between rounded-xl bg-blue-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-500 p-2">
                            <Calendar className="size-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              Eventos Agendados
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Próximos 30 dias
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-2xl tabular-nums">
                          {kpis.totalEvents}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-violet-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-violet-500 p-2">
                            <Users className="size-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Reuniões</p>
                            <p className="text-muted-foreground text-xs">
                              No período
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-2xl tabular-nums">
                          {kpis.meetings}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-emerald-500 p-2">
                            <CheckCircle2 className="size-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Tarefas</p>
                            <p className="text-muted-foreground text-xs">
                              No Kanban
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-2xl tabular-nums">
                          {kpis.kanbanTasks}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* OFFBOARDING TAB */}
          <TabsContent className="space-y-6" value="offboarding">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KPICard
                gradient="bg-gradient-to-br from-rose-500 to-pink-500"
                icon={LogOut}
                iconColor="text-white"
                isLoading={isLoading}
                title="Processos Ativos"
                value={kpis.offboardingProcesses}
              />
              <KPICard
                gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                icon={FileText}
                iconColor="text-white"
                isLoading={isLoading}
                title="Handovers Pendentes"
                value={kpis.pendingHandovers}
              />
              <KPICard
                gradient="bg-gradient-to-br from-emerald-500 to-green-500"
                icon={CheckCircle2}
                iconColor="text-white"
                isLoading={isLoading}
                title="Concluídos"
                value={
                  offboardingByStatus.find((s) => s.status === "completed")
                    ?.count ?? 0
                }
              />
              <KPICard
                gradient="bg-gradient-to-br from-blue-500 to-indigo-500"
                icon={Clock}
                iconColor="text-white"
                isLoading={isLoading}
                title="Em Andamento"
                value={
                  offboardingByStatus.find((s) => s.status === "in_progress")
                    ?.count ?? 0
                }
              />
            </div>

            {/* Offboarding Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="size-4 text-rose-500" />
                    Status dos Processos
                  </CardTitle>
                  <CardDescription>
                    Distribuição por status de offboarding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[280px] w-full" />
                  ) : offboardingByStatus.length === 0 ? (
                    <p className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
                      Nenhum processo de offboarding
                    </p>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="h-[250px] flex-1">
                        <ResponsiveContainer height="100%" width="100%">
                          <RechartsPieChart>
                            <Pie
                              cx="50%"
                              cy="50%"
                              data={offboardingByStatus}
                              dataKey="count"
                              innerRadius={50}
                              nameKey="label"
                              outerRadius={90}
                              paddingAngle={3}
                            >
                              {offboardingByStatus.map((entry) => (
                                <Cell
                                  fill={entry.color}
                                  key={`cell-${entry.status}`}
                                />
                              ))}
                            </Pie>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {offboardingByStatus.map((item) => (
                          <div
                            className="flex items-center justify-between gap-4"
                            key={item.status}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="size-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <span className="font-semibold text-sm tabular-nums">
                              {item.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Offboarding Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    Tarefas de Handover
                  </CardTitle>
                  <CardDescription>
                    Status das transferências de conhecimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          className="h-14 w-full"
                          key={`handover-${i}`}
                        />
                      ))}
                    </div>
                  ) : kpis.pendingHandovers === 0 &&
                    kpis.offboardingProcesses === 0 ? (
                    <p className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
                      Nenhuma tarefa de handover
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between rounded-xl bg-amber-500/10 p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-amber-500 p-2">
                            <Clock className="size-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Pendentes</p>
                            <p className="text-muted-foreground text-xs">
                              Aguardando conclusão
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-2xl tabular-nums">
                          {kpis.pendingHandovers}
                        </span>
                      </div>

                      <div className="rounded-xl border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="font-medium text-sm">
                            Taxa de Conclusão
                          </span>
                          <span className="font-bold text-sm">
                            {kpis.offboardingProcesses > 0
                              ? Math.round(
                                  ((offboardingByStatus.find(
                                    (s) => s.status === "completed"
                                  )?.count ?? 0) /
                                    kpis.offboardingProcesses) *
                                    100
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          className="h-2"
                          value={
                            kpis.offboardingProcesses > 0
                              ? ((offboardingByStatus.find(
                                  (s) => s.status === "completed"
                                )?.count ?? 0) /
                                  kpis.offboardingProcesses) *
                                100
                              : 0
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  );
}
