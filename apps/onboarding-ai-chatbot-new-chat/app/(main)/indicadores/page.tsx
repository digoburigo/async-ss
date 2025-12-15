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
			now.getTime() - daysToFilter * 24 * 60 * 60 * 1000,
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
			0,
		);
		const totalDesligamentos = filteredData.reduce(
			(sum, d) => sum + d.desligamentos,
			0,
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
					}),
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
					}),
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
					<div className="mt-4 p-4 bg-muted/30 rounded-lg">
						<h4 className="text-sm font-medium mb-3">{chart.title}</h4>
						<ResponsiveContainer width="100%" height={chartHeight}>
							<BarChart data={chart.data}>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis dataKey={Object.keys(chart.data[0])[0]} fontSize={12} />
								<YAxis fontSize={12} />
								<Tooltip />
								{chart.dataKeys?.map((key, idx) => (
									<Bar
										key={key}
										dataKey={key}
										fill={chart.colors?.[idx] || "#3b82f6"}
										radius={[4, 4, 0, 0]}
									/>
								))}
							</BarChart>
						</ResponsiveContainer>
					</div>
				);
			case "line":
				return (
					<div className="mt-4 p-4 bg-muted/30 rounded-lg">
						<h4 className="text-sm font-medium mb-3">{chart.title}</h4>
						<ResponsiveContainer width="100%" height={chartHeight}>
							<RechartsLineChart data={chart.data}>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis dataKey={Object.keys(chart.data[0])[0]} fontSize={12} />
								<YAxis fontSize={12} />
								<Tooltip />
								{chart.dataKeys?.map((key, idx) => (
									<Line
										key={key}
										type="monotone"
										dataKey={key}
										stroke={chart.colors?.[idx] || "#3b82f6"}
										strokeWidth={2}
										dot={{ fill: chart.colors?.[idx] || "#3b82f6" }}
									/>
								))}
							</RechartsLineChart>
						</ResponsiveContainer>
					</div>
				);
			case "pie":
				return (
					<div className="mt-4 p-4 bg-muted/30 rounded-lg">
						<h4 className="text-sm font-medium mb-3">{chart.title}</h4>
						<ResponsiveContainer width="100%" height={chartHeight}>
							<RechartsPieChart>
								<Pie
									data={chart.data}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={90}
									dataKey="value"
									label={({ name, percent }) =>
										`${name}: ${(percent * 100).toFixed(0)}%`
									}
									labelLine={false}
								>
									{chart.data.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.color || chart.colors?.[index] || "#3b82f6"}
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
					<div className="mt-4 p-4 bg-muted/30 rounded-lg">
						<h4 className="text-sm font-medium mb-3">{chart.title}</h4>
						<ResponsiveContainer width="100%" height={chartHeight}>
							<AreaChart data={chart.data}>
								<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
								<XAxis dataKey={Object.keys(chart.data[0])[0]} fontSize={12} />
								<YAxis fontSize={12} />
								<Tooltip />
								{chart.dataKeys?.map((key, idx) => (
									<Area
										key={key}
										type="monotone"
										dataKey={key}
										fill={chart.colors?.[idx] || "#3b82f6"}
										stroke={chart.colors?.[idx] || "#3b82f6"}
										fillOpacity={0.3}
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
		<div className="flex flex-col h-full overflow-auto">
			{/* Header */}
			<div className="p-6 border-b">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-foreground">
							<span className="font-light">{getGreeting()},</span> Indicadores
							Administrativos
						</h1>
						<p className="text-muted-foreground mt-1">
							Acompanhe as métricas de RH e faça perguntas ao assistente de IA
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Select value={timePeriod} onValueChange={setTimePeriod}>
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
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList>
								<TabsTrigger value="overview">Visão Geral</TabsTrigger>
								<TabsTrigger value="metrics">Métricas</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex-1 p-6 space-y-6">
				{activeTab === "overview" ? (
					<>
						{/* KPI Cards - Updated with dynamic values */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							<Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
								<CardContent className="p-4">
									<div className="flex items-center gap-2 text-blue-600 mb-2">
										<Users className="h-4 w-4" />
										<span className="text-xs font-medium">HeadCount</span>
									</div>
									<p className="text-2xl font-bold text-blue-900">
										{kpiValues.headcount}
									</p>
									<p
										className={cn(
											"text-xs flex items-center gap-1 mt-1",
											kpiValues.headcountChange >= 0
												? "text-green-600"
												: "text-red-600",
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

							<Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
								<CardContent className="p-4">
									<div className="flex items-center gap-2 text-orange-600 mb-2">
										<TrendingDown className="h-4 w-4" />
										<span className="text-xs font-medium">TurnOver</span>
									</div>
									<p className="text-2xl font-bold text-orange-900">
										{kpiValues.turnover}%
									</p>
									<p className="text-xs text-green-600 flex items-center gap-1 mt-1">
										<ArrowDownRight className="h-3 w-3" />
										-2% vs ano anterior
									</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
								<CardContent className="p-4">
									<div className="flex items-center gap-2 text-purple-600 mb-2">
										<Clock className="h-4 w-4" />
										<span className="text-xs font-medium">Absenteísmo</span>
									</div>
									<p className="text-2xl font-bold text-purple-900">7.39%</p>
									<p className="text-xs text-red-600 flex items-center gap-1 mt-1">
										<ArrowUpRight className="h-3 w-3" />
										+0.5% vs mês anterior
									</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
								<CardContent className="p-4">
									<div className="flex items-center gap-2 text-green-600 mb-2">
										<Calendar className="h-4 w-4" />
										<span className="text-xs font-medium">Férias</span>
									</div>
									<p className="text-2xl font-bold text-green-900">20</p>
									<p className="text-xs text-muted-foreground mt-1">
										Em período de férias
									</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
								<CardContent className="p-4">
									<div className="flex items-center gap-2 text-red-600 mb-2">
										<Clock className="h-4 w-4" />
										<span className="text-xs font-medium">Horas Extras</span>
									</div>
									<p className="text-2xl font-bold text-red-900">200</p>
									<p className="text-xs text-muted-foreground mt-1">
										Total no mês
									</p>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-200">
								<CardContent className="p-4">
									<div className="flex items-center gap-2 text-cyan-600 mb-2">
										<UserPlus className="h-4 w-4" />
										<span className="text-xs font-medium">Admissões</span>
									</div>
									<p className="text-2xl font-bold text-cyan-900">
										{kpiValues.admissoes}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
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
								<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
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
										<div key={item.label} className="flex items-center gap-3">
											<div
												className={cn("p-2 rounded-lg bg-muted/50", item.color)}
											>
												<item.icon className="h-4 w-4" />
											</div>
											<div>
												<p className="text-lg font-bold">{item.value}</p>
												<p className="text-xs text-muted-foreground">
													{item.label}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Charts Grid - First Row */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Headcount Evolution - Uses filtered data */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<LineChart className="h-5 w-5 text-primary" />
										Evolução do Headcount
									</CardTitle>
									<CardDescription>
										Headcount mensal com admissões e desligamentos
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<AreaChart data={filteredData}>
											<CartesianGrid
												strokeDasharray="3 3"
												className="opacity-30"
											/>
											<XAxis dataKey="month" fontSize={12} />
											<YAxis fontSize={12} />
											<Tooltip />
											<Legend />
											<Area
												type="monotone"
												dataKey="headcount"
												name="Headcount"
												fill="#3b82f6"
												stroke="#3b82f6"
												fillOpacity={0.3}
											/>
											<Area
												type="monotone"
												dataKey="admissoes"
												name="Admissões"
												fill="#10b981"
												stroke="#10b981"
												fillOpacity={0.3}
											/>
											<Area
												type="monotone"
												dataKey="desligamentos"
												name="Desligamentos"
												fill="#ef4444"
												stroke="#ef4444"
												fillOpacity={0.3}
											/>
										</AreaChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Department Distribution */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<PieChart className="h-5 w-5 text-primary" />
										Por Família/Função
									</CardTitle>
									<CardDescription>
										Distribuição de funcionários por departamento
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-4">
										<ResponsiveContainer width="50%" height={250}>
											<RechartsPieChart>
												<Pie
													data={departmentData}
													cx="50%"
													cy="50%"
													innerRadius={50}
													outerRadius={80}
													dataKey="value"
												>
													{departmentData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													))}
												</Pie>
												<Tooltip />
											</RechartsPieChart>
										</ResponsiveContainer>
										<div className="flex-1 space-y-2">
											{departmentData.map((item) => (
												<div
													key={item.name}
													className="flex items-center justify-between"
												>
													<div className="flex items-center gap-2">
														<div
															className="w-3 h-3 rounded-full"
															style={{ backgroundColor: item.color }}
														/>
														<span className="text-sm">{item.name}</span>
													</div>
													<span className="text-sm font-medium">
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
						<Card className="border-2 border-dashed border-primary/20">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg flex items-center gap-2">
									<div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
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
								<div className="bg-muted/30 rounded-lg p-4 mb-4 h-[400px] overflow-y-auto">
									<div className="space-y-4">
										{chatMessages.map((message) => (
											<div
												key={message.id}
												className={cn(
													"flex gap-3",
													message.role === "user"
														? "justify-end"
														: "justify-start",
												)}
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
															: "bg-card border",
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
															<p className="text-sm whitespace-pre-wrap">
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
								<div className="flex flex-wrap gap-2 mb-4">
									{[
										{ label: "Evolução Headcount", icon: LineChart },
										{ label: "Análise de Turnover", icon: TrendingDown },
										{ label: "Distribuição por Idade", icon: BarChart3 },
										{ label: "Departamentos", icon: PieChart },
									].map((action) => (
										<Button
											key={action.label}
											variant="outline"
											size="sm"
											className="text-xs bg-transparent"
											onClick={() => {
												setInputMessage(
													`Mostre um gráfico de ${action.label.toLowerCase()}`,
												);
											}}
										>
											<action.icon className="h-3 w-3 mr-1" />
											{action.label}
										</Button>
									))}
								</div>

								{/* Input */}
								<div className="flex gap-2">
									<Input
										value={inputMessage}
										onChange={(e) => setInputMessage(e.target.value)}
										placeholder="Pergunte sobre indicadores de RH..."
										onKeyDown={(e) =>
											e.key === "Enter" && !e.shiftKey && handleSendMessage()
										}
										disabled={isGenerating}
										className="flex-1"
									/>
									<Button
										onClick={handleSendMessage}
										disabled={isGenerating || !inputMessage.trim()}
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
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Age Distribution */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg flex items-center gap-2">
										<BarChart3 className="h-5 w-5 text-primary" />
										Por Faixa de Idade
									</CardTitle>
									<CardDescription>
										Distribuição etária dos funcionários
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={250}>
										<BarChart data={ageDistribution} layout="vertical">
											<CartesianGrid
												strokeDasharray="3 3"
												className="opacity-30"
											/>
											<XAxis type="number" fontSize={12} />
											<YAxis
												type="category"
												dataKey="faixa"
												fontSize={12}
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
									<CardTitle className="text-lg flex items-center gap-2">
										<BarChart3 className="h-5 w-5 text-primary" />
										Por Tempo de Empresa
									</CardTitle>
									<CardDescription>
										Distribuição por tempo de casa
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={250}>
										<BarChart data={tenureDistribution}>
											<CartesianGrid
												strokeDasharray="3 3"
												className="opacity-30"
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
									<CardTitle className="text-lg flex items-center gap-2">
										<PieChart className="h-5 w-5 text-primary" />
										Por Sexo
									</CardTitle>
									<CardDescription>Distribuição por gênero</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-4">
										<ResponsiveContainer width="50%" height={200}>
											<RechartsPieChart>
												<Pie
													data={genderData}
													cx="50%"
													cy="50%"
													innerRadius={40}
													outerRadius={70}
													dataKey="value"
													label={({ percent }) =>
														`${(percent * 100).toFixed(0)}%`
													}
													labelLine={false}
												>
													{genderData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													))}
												</Pie>
												<Tooltip />
											</RechartsPieChart>
										</ResponsiveContainer>
										<div className="flex-1 space-y-3">
											{genderData.map((item) => (
												<div
													key={item.name}
													className="flex items-center justify-between"
												>
													<div className="flex items-center gap-2">
														<div
															className="w-3 h-3 rounded-full"
															style={{ backgroundColor: item.color }}
														/>
														<span className="text-sm">{item.name}</span>
													</div>
													<span className="text-sm font-medium">
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
									<CardTitle className="text-lg flex items-center gap-2">
										<TrendingDown className="h-5 w-5 text-primary" />
										Evolução do Turnover
									</CardTitle>
									<CardDescription>Taxa de turnover mensal (%)</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={200}>
										<RechartsLineChart data={turnoverByMonth}>
											<CartesianGrid
												strokeDasharray="3 3"
												className="opacity-30"
											/>
											<XAxis dataKey="month" fontSize={12} />
											<YAxis fontSize={12} />
											<Tooltip />
											<Line
												type="monotone"
												dataKey="turnover"
												name="Turnover %"
												stroke="#ef4444"
												strokeWidth={2}
												dot={{ fill: "#ef4444" }}
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
