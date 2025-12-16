"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Briefcase,
  Calendar,
  Clock,
  LineChart,
  Loader2,
  PieChart,
  Send,
  Sparkles,
  TrendingDown,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const generateMockDataWithDates = () => {
  const now = new Date();
  const data = [];

  // Generate 12 months of data going back from current date
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthNames = [
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

    data.push({
      date,
      month: monthNames[date.getMonth()],
      headcount: 180 + Math.floor(Math.random() * 35) + (11 - i) * 3,
      admissoes: 5 + Math.floor(Math.random() * 8),
      desligamentos: 3 + Math.floor(Math.random() * 4),
      turnover: 1.4 + Math.random() * 1.5,
    });
  }

  return data;
};

const allMonthlyData = generateMockDataWithDates();

const departmentData = [
  { name: "Operação", value: 85, color: "#f59e0b" },
  { name: "Técnico", value: 45, color: "#3b82f6" },
  { name: "Comercial", value: 35, color: "#10b981" },
  { name: "Administrativo", value: 30, color: "#8b5cf6" },
  { name: "RH", value: 20, color: "#ef4444" },
];

const ageDistribution = [
  { faixa: "18-25", quantidade: 35 },
  { faixa: "26-35", quantidade: 75 },
  { faixa: "36-45", quantidade: 55 },
  { faixa: "46-55", quantidade: 30 },
  { faixa: "56+", quantidade: 20 },
];

const tenureDistribution = [
  { tempo: "0-1 ano", quantidade: 45 },
  { tempo: "1-3 anos", quantidade: 55 },
  { tempo: "3-5 anos", quantidade: 40 },
  { tempo: "5-10 anos", quantidade: 50 },
  { tempo: "10+ anos", quantidade: 25 },
];

const genderData = [
  { name: "Masculino", value: 120, color: "#3b82f6" },
  { name: "Feminino", value: 95, color: "#ec4899" },
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: {
    type: "bar" | "line" | "pie" | "area";
    data: any[];
    title: string;
    dataKeys?: string[];
    colors?: string[];
  };
  isLoading?: boolean;
}

export default function IndicadoresPage() {
  const [timePeriod, setTimePeriod] = useState("1year");
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o assistente de indicadores administrativos. Posso ajudar você a analisar dados de RH, gerar gráficos e responder perguntas sobre métricas da empresa. O que você gostaria de saber?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    const now = new Date();
    let daysToFilter: number;

    switch (timePeriod) {
      case "30days":
        daysToFilter = 30;
        break;
      case "90days":
        daysToFilter = 90;
        break;
      case "6months":
        daysToFilter = 180;
        break;
      case "1year":
      default:
        daysToFilter = 365;
        break;
    }

    const cutoffDate = new Date(
      now.getTime() - daysToFilter * 24 * 60 * 60 * 1000
    );

    return allMonthlyData.filter((item) => item.date >= cutoffDate);
  }, [timePeriod]);

  const kpiValues = useMemo(() => {
    if (filteredData.length === 0)
      return {
        headcount: 0,
        turnover: 0,
        admissoes: 0,
        desligamentos: 0,
        headcountChange: 0,
        turnoverChange: 0,
      };

    const latestData = filteredData[filteredData.length - 1];
    const previousData =
      filteredData.length > 1
        ? filteredData[filteredData.length - 2]
        : latestData;

    const avgTurnover =
      filteredData.reduce((sum, d) => sum + d.turnover, 0) /
      filteredData.length;
    const totalAdmissoes = filteredData.reduce(
      (sum, d) => sum + d.admissoes,
      0
    );
    const totalDesligamentos = filteredData.reduce(
      (sum, d) => sum + d.desligamentos,
      0
    );

    const headcountChange =
      previousData.headcount > 0
        ? (
            ((latestData.headcount - previousData.headcount) /
              previousData.headcount) *
            100
          ).toFixed(1)
        : "0";

    return {
      headcount: latestData.headcount,
      turnover: avgTurnover.toFixed(1),
      admissoes: totalAdmissoes,
      desligamentos: totalDesligamentos,
      headcountChange: Number.parseFloat(headcountChange),
      turnoverChange: -2,
    };
  }, [filteredData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsGenerating(true);

    const loadingId = (Date.now() + 1).toString();
    setChatMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "", isLoading: true },
    ]);

    try {
      const response = await fetch("/api/indicadores/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) throw new Error("Failed to generate response");

      const data = await response.json();

      setChatMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: data.content,
            chart: data.chart,
          })
      );
    } catch (error) {
      console.error("Error:", error);
      setChatMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content:
              "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.",
          })
      );
      toast.error("Erro ao gerar resposta");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderInlineChart = (chart: ChatMessage["chart"]) => {
    if (!chart) return null;

    const chartHeight = 250;

    switch (chart.type) {
      case "bar":
        return (
          <div className="mt-4 rounded-lg bg-muted/30 p-4">
            <h4 className="mb-3 font-medium text-sm">{chart.title}</h4>
            <ResponsiveContainer height={chartHeight} width="100%">
              <BarChart data={chart.data}>
                <CartesianGrid className="opacity-30" strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(chart.data[0])[0]} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                {chart.dataKeys?.map((key, idx) => (
                  <Bar
                    dataKey={key}
                    fill={chart.colors?.[idx] || "#3b82f6"}
                    key={key}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "line":
        return (
          <div className="mt-4 rounded-lg bg-muted/30 p-4">
            <h4 className="mb-3 font-medium text-sm">{chart.title}</h4>
            <ResponsiveContainer height={chartHeight} width="100%">
              <RechartsLineChart data={chart.data}>
                <CartesianGrid className="opacity-30" strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(chart.data[0])[0]} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                {chart.dataKeys?.map((key, idx) => (
                  <Line
                    dataKey={key}
                    dot={{ fill: chart.colors?.[idx] || "#3b82f6" }}
                    key={key}
                    stroke={chart.colors?.[idx] || "#3b82f6"}
                    strokeWidth={2}
                    type="monotone"
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        );
      case "pie":
        return (
          <div className="mt-4 rounded-lg bg-muted/30 p-4">
            <h4 className="mb-3 font-medium text-sm">{chart.title}</h4>
            <ResponsiveContainer height={chartHeight} width="100%">
              <RechartsPieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={chart.data}
                  dataKey="value"
                  innerRadius={60}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  outerRadius={90}
                >
                  {chart.data.map((entry, index) => (
                    <Cell
                      fill={entry.color || chart.colors?.[index] || "#3b82f6"}
                      key={`cell-${index}`}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );
      case "area":
        return (
          <div className="mt-4 rounded-lg bg-muted/30 p-4">
            <h4 className="mb-3 font-medium text-sm">{chart.title}</h4>
            <ResponsiveContainer height={chartHeight} width="100%">
              <AreaChart data={chart.data}>
                <CartesianGrid className="opacity-30" strokeDasharray="3 3" />
                <XAxis dataKey={Object.keys(chart.data[0])[0]} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                {chart.dataKeys?.map((key, idx) => (
                  <Area
                    dataKey={key}
                    fill={chart.colors?.[idx] || "#3b82f6"}
                    fillOpacity={0.3}
                    key={key}
                    stroke={chart.colors?.[idx] || "#3b82f6"}
                    type="monotone"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const turnoverByMonth = filteredData.map((d) => ({
    month: d.month,
    turnover: Number.parseFloat(d.turnover.toFixed(1)),
  }));

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground md:text-3xl">
              <span className="font-light">{getGreeting()},</span> Indicadores
              Administrativos
            </h1>
            <p className="mt-1 text-muted-foreground">
              Acompanhe as métricas de RH e faça perguntas ao assistente de IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select onValueChange={setTimePeriod} value={timePeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">30 dias</SelectItem>
                <SelectItem value="90days">90 dias</SelectItem>
                <SelectItem value="6months">6 meses</SelectItem>
                <SelectItem value="1year">1 ano</SelectItem>
              </SelectContent>
            </Select>
            <Tabs onValueChange={setActiveTab} value={activeTab}>
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="metrics">Métricas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        {activeTab === "overview" ? (
          <>
            {/* KPI Cards - Updated with dynamic values */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-blue-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-xs">HeadCount</span>
                  </div>
                  <p className="font-bold text-2xl text-blue-900">
                    {kpiValues.headcount}
                  </p>
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-xs",
                      kpiValues.headcountChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {kpiValues.headcountChange >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {kpiValues.headcountChange >= 0 ? "+" : ""}
                    {kpiValues.headcountChange}% vs período anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-orange-600">
                    <TrendingDown className="h-4 w-4" />
                    <span className="font-medium text-xs">TurnOver</span>
                  </div>
                  <p className="font-bold text-2xl text-orange-900">
                    {kpiValues.turnover}%
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-green-600 text-xs">
                    <ArrowDownRight className="h-3 w-3" />
                    -2% vs ano anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-purple-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium text-xs">Absenteísmo</span>
                  </div>
                  <p className="font-bold text-2xl text-purple-900">7.39%</p>
                  <p className="mt-1 flex items-center gap-1 text-red-600 text-xs">
                    <ArrowUpRight className="h-3 w-3" />
                    +0.5% vs mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-green-600">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium text-xs">Férias</span>
                  </div>
                  <p className="font-bold text-2xl text-green-900">20</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Em período de férias
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-red-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium text-xs">Horas Extras</span>
                  </div>
                  <p className="font-bold text-2xl text-red-900">200</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Total no mês
                  </p>
                </CardContent>
              </Card>

              <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center gap-2 text-cyan-600">
                    <UserPlus className="h-4 w-4" />
                    <span className="font-medium text-xs">Admissões</span>
                  </div>
                  <p className="font-bold text-2xl text-cyan-900">
                    {kpiValues.admissoes}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    No período
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Totalizadores */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Totalizadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
                  {[
                    {
                      label: "Ativos",
                      value: 200,
                      icon: Users,
                      color: "text-green-600",
                    },
                    {
                      label: "Desligados",
                      value: kpiValues.desligamentos,
                      icon: UserMinus,
                      color: "text-red-600",
                    },
                    {
                      label: "Admitidos",
                      value: kpiValues.admissoes,
                      icon: UserPlus,
                      color: "text-blue-600",
                    },
                    {
                      label: "Afastados",
                      value: 6,
                      icon: Clock,
                      color: "text-orange-600",
                    },
                    {
                      label: "Aprendizes",
                      value: 5,
                      icon: Users,
                      color: "text-purple-600",
                    },
                    {
                      label: "PCD",
                      value: 18,
                      icon: Users,
                      color: "text-cyan-600",
                    },
                    {
                      label: "Estagiários",
                      value: 3,
                      icon: Briefcase,
                      color: "text-pink-600",
                    },
                    {
                      label: "Experiência",
                      value: 9,
                      icon: Clock,
                      color: "text-amber-600",
                    },
                  ].map((item) => (
                    <div className="flex items-center gap-3" key={item.label}>
                      <div
                        className={cn("rounded-lg bg-muted/50 p-2", item.color)}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{item.value}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid - First Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Headcount Evolution - Uses filtered data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LineChart className="h-5 w-5 text-primary" />
                    Evolução do Headcount
                  </CardTitle>
                  <CardDescription>
                    Headcount mensal com admissões e desligamentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer height={300} width="100%">
                    <AreaChart data={filteredData}>
                      <CartesianGrid
                        className="opacity-30"
                        strokeDasharray="3 3"
                      />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Area
                        dataKey="headcount"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Headcount"
                        stroke="#3b82f6"
                        type="monotone"
                      />
                      <Area
                        dataKey="admissoes"
                        fill="#10b981"
                        fillOpacity={0.3}
                        name="Admissões"
                        stroke="#10b981"
                        type="monotone"
                      />
                      <Area
                        dataKey="desligamentos"
                        fill="#ef4444"
                        fillOpacity={0.3}
                        name="Desligamentos"
                        stroke="#ef4444"
                        type="monotone"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5 text-primary" />
                    Por Família/Função
                  </CardTitle>
                  <CardDescription>
                    Distribuição de funcionários por departamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer height={250} width="50%">
                      <RechartsPieChart>
                        <Pie
                          cx="50%"
                          cy="50%"
                          data={departmentData}
                          dataKey="value"
                          innerRadius={50}
                          outerRadius={80}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell fill={entry.color} key={`cell-${index}`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {departmentData.map((item) => (
                        <div
                          className="flex items-center justify-between"
                          key={item.name}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="font-medium text-sm">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Chat Section */}
            <Card className="border-2 border-primary/20 border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  Assistente de Indicadores
                </CardTitle>
                <CardDescription>
                  Faça perguntas sobre os dados de RH e receba análises com
                  gráficos gerados por IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 h-[400px] overflow-y-auto rounded-lg bg-muted/30 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        className={cn(
                          "flex gap-3",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        )}
                        key={message.id}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-3",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "border bg-card"
                          )}
                        >
                          {message.isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">
                                Analisando dados...
                              </span>
                            </div>
                          ) : (
                            <>
                              <p className="whitespace-pre-wrap text-sm">
                                {message.content}
                              </p>
                              {message.chart &&
                                renderInlineChart(message.chart)}
                            </>
                          )}
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              U
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { label: "Evolução Headcount", icon: LineChart },
                    { label: "Análise de Turnover", icon: TrendingDown },
                    { label: "Distribuição por Idade", icon: BarChart3 },
                    { label: "Departamentos", icon: PieChart },
                  ].map((action) => (
                    <Button
                      className="bg-transparent text-xs"
                      key={action.label}
                      onClick={() => {
                        setInputMessage(
                          `Mostre um gráfico de ${action.label.toLowerCase()}`
                        );
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <action.icon className="mr-1 h-3 w-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    className="flex-1"
                    disabled={isGenerating}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleSendMessage()
                    }
                    placeholder="Pergunte sobre indicadores de RH..."
                    value={inputMessage}
                  />
                  <Button
                    disabled={isGenerating || !inputMessage.trim()}
                    onClick={handleSendMessage}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Detailed Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Por Faixa de Idade
                  </CardTitle>
                  <CardDescription>
                    Distribuição etária dos funcionários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer height={250} width="100%">
                    <BarChart data={ageDistribution} layout="vertical">
                      <CartesianGrid
                        className="opacity-30"
                        strokeDasharray="3 3"
                      />
                      <XAxis fontSize={12} type="number" />
                      <YAxis
                        dataKey="faixa"
                        fontSize={12}
                        type="category"
                        width={60}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="quantidade"
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tenure Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Por Tempo de Empresa
                  </CardTitle>
                  <CardDescription>
                    Distribuição por tempo de casa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer height={250} width="100%">
                    <BarChart data={tenureDistribution}>
                      <CartesianGrid
                        className="opacity-30"
                        strokeDasharray="3 3"
                      />
                      <XAxis dataKey="tempo" fontSize={10} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar
                        dataKey="quantidade"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5 text-primary" />
                    Por Sexo
                  </CardTitle>
                  <CardDescription>Distribuição por gênero</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer height={200} width="50%">
                      <RechartsPieChart>
                        <Pie
                          cx="50%"
                          cy="50%"
                          data={genderData}
                          dataKey="value"
                          innerRadius={40}
                          label={({ percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                          outerRadius={70}
                        >
                          {genderData.map((entry, index) => (
                            <Cell fill={entry.color} key={`cell-${index}`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {genderData.map((item) => (
                        <div
                          className="flex items-center justify-between"
                          key={item.name}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="font-medium text-sm">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Turnover Trend - Uses filtered data */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="h-5 w-5 text-primary" />
                    Evolução do Turnover
                  </CardTitle>
                  <CardDescription>Taxa de turnover mensal (%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer height={200} width="100%">
                    <RechartsLineChart data={turnoverByMonth}>
                      <CartesianGrid
                        className="opacity-30"
                        strokeDasharray="3 3"
                      />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Line
                        dataKey="turnover"
                        dot={{ fill: "#ef4444" }}
                        name="Turnover %"
                        stroke="#ef4444"
                        strokeWidth={2}
                        type="monotone"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
