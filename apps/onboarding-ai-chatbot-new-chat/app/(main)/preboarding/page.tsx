"use client";

import {
	Briefcase,
	Eye,
	Filter,
	Mail,
	MoreHorizontal,
	Plus,
	Search,
	Star,
	Trash2,
	Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Stage {
	id: string;
	name: string;
	description: string;
	color: string;
	order_index: number;
}

interface JobPosition {
	id: string;
	title: string;
	department: string;
	status: string;
	location: string;
	work_model: string;
	employment_type: string;
}

interface Candidate {
	id: string;
	name: string;
	email: string;
	phone: string;
	position: string;
	department: string;
	stage_id: string;
	stage: Stage | null;
	job_position_id: string | null;
	source: string;
	resume_url: string;
	expected_salary: number;
	expected_start_date: string;
	notes: string;
	rating: number;
	status: string;
	created_at: string;
	updated_at: string;
}

export default function PreboardingPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const jobFilterFromUrl = searchParams.get("job");

	const [stages, setStages] = useState<Stage[]>([]);
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [jobs, setJobs] = useState<JobPosition[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
	const [jobFilter, setJobFilter] = useState<string>(jobFilterFromUrl || "all");
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(
		null,
	);

	// Form state
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		position: "",
		department: "",
		stage_id: "",
		job_position_id: "",
		source: "",
		expected_salary: "",
		expected_start_date: "",
		notes: "",
		rating: 0,
	});

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		if (jobFilterFromUrl) {
			setJobFilter(jobFilterFromUrl);
		}
	}, [jobFilterFromUrl]);

	const loadData = async () => {
		setIsLoading(true);
		try {
			const [stagesRes, candidatesRes, jobsRes] = await Promise.all([
				fetch("/api/preboarding/stages"),
				fetch("/api/preboarding/candidates?status=active"),
				fetch("/api/preboarding/jobs"), // Remove status filter to get all jobs
			]);

			if (stagesRes.ok) {
				const stagesData = await stagesRes.json();
				setStages(stagesData);
				if (stagesData.length > 0 && !formData.stage_id) {
					setFormData((prev) => ({ ...prev, stage_id: stagesData[0].id }));
				}
			}

			if (candidatesRes.ok) {
				const candidatesData = await candidatesRes.json();
				setCandidates(candidatesData);
			}

			if (jobsRes.ok) {
				const jobsData = await jobsRes.json();
				setJobs(jobsData);
			}
		} catch (error) {
			console.error("[v0] Error loading data:", error);
			toast.error("Erro ao carregar dados");
		} finally {
			setIsLoading(false);
		}
	};

	const handleJobPositionChange = (jobId: string) => {
		const selectedJob = jobs.find((j) => j.id === jobId);
		if (selectedJob) {
			setFormData((prev) => ({
				...prev,
				job_position_id: jobId,
				position: selectedJob.title,
				department: selectedJob.department || prev.department,
			}));
		} else {
			setFormData((prev) => ({ ...prev, job_position_id: jobId }));
		}
	};

	const handleAddCandidate = async () => {
		if (!formData.name) {
			toast.error("Nome é obrigatório");
			return;
		}

		if (jobs.length > 0 && !formData.job_position_id) {
			toast.error("Selecione uma vaga para o candidato");
			return;
		}

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/preboarding/candidates", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					expected_salary: formData.expected_salary
						? Number.parseFloat(formData.expected_salary)
						: null,
					expected_start_date: formData.expected_start_date || null,
					rating: formData.rating || null,
					job_position_id: formData.job_position_id || null,
				}),
			});

			if (res.ok) {
				const newCandidate = await res.json();
				setCandidates((prev) => [newCandidate, ...prev]);
				setIsAddDialogOpen(false);
				setFormData({
					name: "",
					email: "",
					phone: "",
					position: "",
					department: "",
					stage_id: stages[0]?.id || "",
					job_position_id: "",
					source: "",
					expected_salary: "",
					expected_start_date: "",
					notes: "",
					rating: 0,
				});
				toast.success("Candidato adicionado com sucesso!");
			} else {
				const error = await res.json();
				toast.error(error.error || "Erro ao adicionar candidato");
			}
		} catch (error) {
			toast.error("Erro ao adicionar candidato");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleMoveCandidate = async (
		candidateId: string,
		newStageId: string,
	) => {
		try {
			const res = await fetch(`/api/preboarding/candidates/${candidateId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ stage_id: newStageId }),
			});

			if (res.ok) {
				const updatedCandidate = await res.json();
				setCandidates((prev) =>
					prev.map((c) => (c.id === candidateId ? updatedCandidate : c)),
				);
				toast.success("Candidato movido!");
			}
		} catch (error) {
			toast.error("Erro ao mover candidato");
		}
	};

	const handleDeleteCandidate = async (candidateId: string) => {
		try {
			const res = await fetch(`/api/preboarding/candidates/${candidateId}`, {
				method: "DELETE",
			});

			if (res.ok) {
				setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
				toast.success("Candidato removido!");
			}
		} catch (error) {
			toast.error("Erro ao remover candidato");
		}
	};

	const handleDragStart = (candidate: Candidate) => {
		setDraggedCandidate(candidate);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (stageId: string) => {
		if (draggedCandidate && draggedCandidate.stage_id !== stageId) {
			handleMoveCandidate(draggedCandidate.id, stageId);
		}
		setDraggedCandidate(null);
	};

	const handleJobFilterChange = (value: string) => {
		setJobFilter(value);
		if (value === "all") {
			router.push("/preboarding");
		} else {
			router.push(`/preboarding?job=${value}`);
		}
	};

	const filteredCandidates = candidates.filter((c) => {
		const matchesSearch =
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.email?.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesJob = jobFilter === "all" || c.job_position_id === jobFilter;

		return matchesSearch && matchesJob;
	});

	const getCandidatesByStage = (stageId: string) => {
		return filteredCandidates.filter((c) => c.stage_id === stageId);
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const getJobTitle = (jobId: string | null) => {
		if (!jobId) return null;
		const job = jobs.find((j) => j.id === jobId);
		return job?.title || null;
	};

	const renderRating = (rating: number | null) => {
		if (!rating) return null;
		return (
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={cn(
							"h-3 w-3",
							star <= rating
								? "fill-yellow-400 text-yellow-400"
								: "text-muted-foreground",
						)}
					/>
				))}
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="flex-1 p-6">
				<div className="flex items-center justify-between mb-6">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-10 w-40" />
				</div>
				<div className="flex gap-4 overflow-x-auto pb-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="flex-shrink-0 w-80">
							<Skeleton className="h-12 w-full mb-4" />
							<div className="space-y-3">
								<Skeleton className="h-32 w-full" />
								<Skeleton className="h-32 w-full" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 p-6 overflow-hidden flex flex-col">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Users className="h-6 w-6" />
						Preboarding - Gestão de Candidatos
					</h1>
					<p className="text-muted-foreground mt-1">
						Gerencie seus candidatos em processo seletivo
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Buscar candidatos..."
							className="pl-9 w-48"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					{/* Job Filter */}
					<Select value={jobFilter} onValueChange={handleJobFilterChange}>
						<SelectTrigger className="w-48">
							<Filter className="h-4 w-4 mr-2" />
							<SelectValue placeholder="Filtrar por vaga" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas as vagas</SelectItem>
							{jobs.map((job) => (
								<SelectItem key={job.id} value={job.id}>
									{job.title} {job.department ? `- ${job.department}` : ""}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Tabs
						value={viewMode}
						onValueChange={(v) => setViewMode(v as "kanban" | "list")}
					>
						<TabsList>
							<TabsTrigger value="kanban">Kanban</TabsTrigger>
							<TabsTrigger value="list">Lista</TabsTrigger>
						</TabsList>
					</Tabs>
					<Button onClick={() => setIsAddDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Adicionar Candidato
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardContent className="p-4">
						<div className="text-2xl font-bold">
							{filteredCandidates.length}
						</div>
						<div className="text-sm text-muted-foreground">
							{jobFilter === "all"
								? "Total de Candidatos"
								: "Candidatos na Vaga"}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="text-2xl font-bold">
							{
								filteredCandidates.filter((c) => {
									const date = new Date(c.created_at);
									const now = new Date();
									return (
										date.getMonth() === now.getMonth() &&
										date.getFullYear() === now.getFullYear()
									);
								}).length
							}
						</div>
						<div className="text-sm text-muted-foreground">Novos este mês</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="text-2xl font-bold">
							{stages.length > 0
								? getCandidatesByStage(stages[stages.length - 1]?.id).length
								: 0}
						</div>
						<div className="text-sm text-muted-foreground">Em fase final</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="text-2xl font-bold">
							{
								filteredCandidates.filter((c) => c.rating && c.rating >= 4)
									.length
							}
						</div>
						<div className="text-sm text-muted-foreground">Alta avaliação</div>
					</CardContent>
				</Card>
			</div>

			{/* Kanban View */}
			{viewMode === "kanban" && (
				<ScrollArea className="flex-1">
					<div className="flex gap-4 pb-4 min-w-max">
						{stages.map((stage) => (
							<div
								key={stage.id}
								className="flex-shrink-0 w-80"
								onDragOver={handleDragOver}
								onDrop={() => handleDrop(stage.id)}
							>
								<div
									className="flex items-center gap-2 p-3 rounded-t-lg mb-2"
									style={{ backgroundColor: `${stage.color}20` }}
								>
									<div
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: stage.color }}
									/>
									<h3 className="font-semibold text-sm">{stage.name}</h3>
									<Badge variant="secondary" className="ml-auto">
										{getCandidatesByStage(stage.id).length}
									</Badge>
								</div>
								<div className="space-y-3 min-h-[200px] p-1">
									{getCandidatesByStage(stage.id).map((candidate) => (
										<Card
											key={candidate.id}
											className={cn(
												"cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
												draggedCandidate?.id === candidate.id && "opacity-50",
											)}
											draggable
											onDragStart={() => handleDragStart(candidate)}
										>
											<CardContent className="p-4">
												<div className="flex items-start justify-between mb-2">
													<div className="flex items-center gap-2">
														<Avatar className="h-8 w-8">
															<AvatarFallback
																className="text-xs"
																style={{ backgroundColor: `${stage.color}40` }}
															>
																{getInitials(candidate.name)}
															</AvatarFallback>
														</Avatar>
														<div>
															<div className="font-medium text-sm">
																{candidate.name}
															</div>
															{renderRating(candidate.rating)}
														</div>
													</div>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
															>
																<MoreHorizontal className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() =>
																	router.push(`/preboarding/${candidate.id}`)
																}
															>
																<Eye className="mr-2 h-4 w-4" />
																Ver detalhes
															</DropdownMenuItem>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																className="text-destructive"
																onClick={() =>
																	handleDeleteCandidate(candidate.id)
																}
															>
																<Trash2 className="mr-2 h-4 w-4" />
																Remover
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
												<div className="space-y-1 text-xs text-muted-foreground">
													<div className="flex items-center gap-1">
														<Briefcase className="h-3 w-3" />
														{candidate.position}
													</div>
													{candidate.email && (
														<div className="flex items-center gap-1 truncate">
															<Mail className="h-3 w-3 flex-shrink-0" />
															<span className="truncate">
																{candidate.email}
															</span>
														</div>
													)}
													{candidate.expected_salary && (
														<div className="flex items-center gap-1">
															<span className="font-medium text-foreground">
																{formatCurrency(candidate.expected_salary)}
															</span>
														</div>
													)}
												</div>
												<div className="flex flex-wrap gap-1 mt-2">
													{candidate.source && (
														<Badge variant="outline" className="text-xs">
															{candidate.source}
														</Badge>
													)}
													{getJobTitle(candidate.job_position_id) && (
														<Badge variant="secondary" className="text-xs">
															{getJobTitle(candidate.job_position_id)}
														</Badge>
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						))}
					</div>
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			)}

			{/* List View */}
			{viewMode === "list" && (
				<Card className="flex-1 overflow-hidden">
					<CardContent className="p-0">
						<ScrollArea className="h-full">
							<table className="w-full">
								<thead>
									<tr className="border-b bg-muted/50">
										<th className="text-left p-4 font-medium">Candidato</th>
										<th className="text-left p-4 font-medium">Cargo</th>
										<th className="text-left p-4 font-medium">Vaga</th>
										<th className="text-left p-4 font-medium">Etapa</th>
										<th className="text-left p-4 font-medium">Avaliação</th>
										<th className="text-left p-4 font-medium">
											Salário Esperado
										</th>
										<th className="text-right p-4 font-medium">Ações</th>
									</tr>
								</thead>
								<tbody>
									{filteredCandidates.map((candidate) => (
										<tr
											key={candidate.id}
											className="border-b hover:bg-muted/50"
										>
											<td className="p-4">
												<div className="flex items-center gap-3">
													<Avatar className="h-8 w-8">
														<AvatarFallback className="text-xs">
															{getInitials(candidate.name)}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className="font-medium">{candidate.name}</div>
														<div className="text-xs text-muted-foreground">
															{candidate.email}
														</div>
													</div>
												</div>
											</td>
											<td className="p-4">{candidate.position}</td>
											<td className="p-4">
												{getJobTitle(candidate.job_position_id) ? (
													<Badge variant="secondary">
														{getJobTitle(candidate.job_position_id)}
													</Badge>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</td>
											<td className="p-4">
												{candidate.stage && (
													<Badge
														style={{
															backgroundColor: `${candidate.stage.color}20`,
															color: candidate.stage.color,
														}}
													>
														{candidate.stage.name}
													</Badge>
												)}
											</td>
											<td className="p-4">{renderRating(candidate.rating)}</td>
											<td className="p-4">
												{candidate.expected_salary
													? formatCurrency(candidate.expected_salary)
													: "-"}
											</td>
											<td className="p-4 text-right">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={() =>
																router.push(`/preboarding/${candidate.id}`)
															}
														>
															<Eye className="mr-2 h-4 w-4" />
															Ver detalhes
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-destructive"
															onClick={() =>
																handleDeleteCandidate(candidate.id)
															}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Remover
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))}
									{filteredCandidates.length === 0 && (
										<tr>
											<td
												colSpan={7}
												className="p-8 text-center text-muted-foreground"
											>
												Nenhum candidato encontrado
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</ScrollArea>
					</CardContent>
				</Card>
			)}

			{/* Add Candidate Dialog */}
			<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Adicionar Candidato</DialogTitle>
						<DialogDescription>
							Preencha as informações do novo candidato
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<Label htmlFor="job_position_id">
									Vaga <span className="text-destructive">*</span>
								</Label>
								<Select
									value={formData.job_position_id}
									onValueChange={handleJobPositionChange}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a vaga" />
									</SelectTrigger>
									<SelectContent>
										{jobs.length === 0 ? (
											<SelectItem value="none" disabled>
												Nenhuma vaga cadastrada - vá para Gestão de Cargos
											</SelectItem>
										) : (
											jobs.map((job) => (
												<SelectItem key={job.id} value={job.id}>
													{job.title}{" "}
													{job.department ? `- ${job.department}` : ""}{" "}
													{job.location ? `(${job.location})` : ""}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								{jobs.length === 0 && (
									<p className="text-xs text-muted-foreground mt-1">
										Cadastre vagas em{" "}
										<a href="/cargos" className="text-primary underline">
											Gestão de Cargos
										</a>{" "}
										primeiro.
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name">
									Nome <span className="text-destructive">*</span>
								</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="Nome completo"
								/>
							</div>
							<div>
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={formData.email}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, email: e.target.value }))
									}
									placeholder="email@exemplo.com"
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="phone">Telefone</Label>
								<Input
									id="phone"
									value={formData.phone}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, phone: e.target.value }))
									}
									placeholder="(00) 00000-0000"
								/>
							</div>
							<div>
								<Label htmlFor="source">Origem</Label>
								<Select
									value={formData.source}
									onValueChange={(v) =>
										setFormData((prev) => ({ ...prev, source: v }))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Como conheceu?" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="linkedin">LinkedIn</SelectItem>
										<SelectItem value="indicacao">Indicação</SelectItem>
										<SelectItem value="site">Site da empresa</SelectItem>
										<SelectItem value="indeed">Indeed</SelectItem>
										<SelectItem value="glassdoor">Glassdoor</SelectItem>
										<SelectItem value="outros">Outros</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="position">Cargo</Label>
								<Input
									id="position"
									value={formData.position}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											position: e.target.value,
										}))
									}
									placeholder="Ex: Desenvolvedor Frontend"
									readOnly={!!formData.job_position_id}
									className={formData.job_position_id ? "bg-muted" : ""}
								/>
								{formData.job_position_id && (
									<p className="text-xs text-muted-foreground mt-1">
										Preenchido automaticamente pela vaga
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="department">Departamento</Label>
								<Input
									id="department"
									value={formData.department}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											department: e.target.value,
										}))
									}
									placeholder="Ex: Tecnologia"
									readOnly={!!formData.job_position_id && !!formData.department}
									className={
										formData.job_position_id && formData.department
											? "bg-muted"
											: ""
									}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="expected_salary">Salário Esperado (R$)</Label>
								<Input
									id="expected_salary"
									type="number"
									value={formData.expected_salary}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											expected_salary: e.target.value,
										}))
									}
									placeholder="5000"
								/>
							</div>
							<div>
								<Label htmlFor="expected_start_date">
									Data de Início Esperada
								</Label>
								<Input
									id="expected_start_date"
									type="date"
									value={formData.expected_start_date}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											expected_start_date: e.target.value,
										}))
									}
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="stage_id">Etapa Inicial</Label>
								<Select
									value={formData.stage_id}
									onValueChange={(v) =>
										setFormData((prev) => ({ ...prev, stage_id: v }))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a etapa" />
									</SelectTrigger>
									<SelectContent>
										{stages.map((stage) => (
											<SelectItem key={stage.id} value={stage.id}>
												<div className="flex items-center gap-2">
													<div
														className="w-2 h-2 rounded-full"
														style={{ backgroundColor: stage.color }}
													/>
													{stage.name}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>Avaliação Inicial</Label>
								<div className="flex items-center gap-1 mt-2">
									{[1, 2, 3, 4, 5].map((star) => (
										<button
											key={star}
											type="button"
											onClick={() =>
												setFormData((prev) => ({ ...prev, rating: star }))
											}
											className="p-1 hover:scale-110 transition-transform"
										>
											<Star
												className={cn(
													"h-6 w-6",
													star <= formData.rating
														? "fill-yellow-400 text-yellow-400"
														: "text-muted-foreground",
												)}
											/>
										</button>
									))}
								</div>
							</div>
						</div>
						<div>
							<Label htmlFor="notes">Observações</Label>
							<Textarea
								id="notes"
								value={formData.notes}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, notes: e.target.value }))
								}
								placeholder="Informações adicionais sobre o candidato..."
								rows={3}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleAddCandidate} disabled={isSubmitting}>
							{isSubmitting ? "Adicionando..." : "Adicionar Candidato"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
