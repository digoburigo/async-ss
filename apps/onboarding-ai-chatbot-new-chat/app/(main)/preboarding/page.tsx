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
    null
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
    newStageId: string
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
          prev.map((c) => (c.id === candidateId ? updatedCandidate : c))
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

  const getCandidatesByStage = (stageId: string) =>
    filteredCandidates.filter((c) => c.stage_id === stageId);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

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
            className={cn(
              "h-3 w-3",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            )}
            key={star}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div className="w-80 flex-shrink-0" key={i}>
              <Skeleton className="mb-4 h-12 w-full" />
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
    <div className="flex flex-1 flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 font-bold text-2xl">
            <Users className="h-6 w-6" />
            Preboarding - Gestão de Candidatos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seus candidatos em processo seletivo
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-48 pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar candidatos..."
              value={searchQuery}
            />
          </div>
          {/* Job Filter */}
          <Select onValueChange={handleJobFilterChange} value={jobFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
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
            onValueChange={(v) => setViewMode(v as "kanban" | "list")}
            value={viewMode}
          >
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Candidato
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl">
              {filteredCandidates.length}
            </div>
            <div className="text-muted-foreground text-sm">
              {jobFilter === "all"
                ? "Total de Candidatos"
                : "Candidatos na Vaga"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl">
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
            <div className="text-muted-foreground text-sm">Novos este mês</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl">
              {stages.length > 0
                ? getCandidatesByStage(stages[stages.length - 1]?.id).length
                : 0}
            </div>
            <div className="text-muted-foreground text-sm">Em fase final</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-bold text-2xl">
              {
                filteredCandidates.filter((c) => c.rating && c.rating >= 4)
                  .length
              }
            </div>
            <div className="text-muted-foreground text-sm">Alta avaliação</div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <ScrollArea className="flex-1">
          <div className="flex min-w-max gap-4 pb-4">
            {stages.map((stage) => (
              <div
                className="w-80 flex-shrink-0"
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div
                  className="mb-2 flex items-center gap-2 rounded-t-lg p-3"
                  style={{ backgroundColor: `${stage.color}20` }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="font-semibold text-sm">{stage.name}</h3>
                  <Badge className="ml-auto" variant="secondary">
                    {getCandidatesByStage(stage.id).length}
                  </Badge>
                </div>
                <div className="min-h-[200px] space-y-3 p-1">
                  {getCandidatesByStage(stage.id).map((candidate) => (
                    <Card
                      className={cn(
                        "cursor-grab transition-all hover:shadow-md active:cursor-grabbing",
                        draggedCandidate?.id === candidate.id && "opacity-50"
                      )}
                      draggable
                      key={candidate.id}
                      onDragStart={() => handleDragStart(candidate)}
                    >
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
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
                                className="h-8 w-8"
                                size="icon"
                                variant="ghost"
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
                        <div className="space-y-1 text-muted-foreground text-xs">
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
                        <div className="mt-2 flex flex-wrap gap-1">
                          {candidate.source && (
                            <Badge className="text-xs" variant="outline">
                              {candidate.source}
                            </Badge>
                          )}
                          {getJobTitle(candidate.job_position_id) && (
                            <Badge className="text-xs" variant="secondary">
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
                    <th className="p-4 text-left font-medium">Candidato</th>
                    <th className="p-4 text-left font-medium">Cargo</th>
                    <th className="p-4 text-left font-medium">Vaga</th>
                    <th className="p-4 text-left font-medium">Etapa</th>
                    <th className="p-4 text-left font-medium">Avaliação</th>
                    <th className="p-4 text-left font-medium">
                      Salário Esperado
                    </th>
                    <th className="p-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr
                      className="border-b hover:bg-muted/50"
                      key={candidate.id}
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
                            <div className="text-muted-foreground text-xs">
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
                            <Button size="icon" variant="ghost">
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
                        className="p-8 text-center text-muted-foreground"
                        colSpan={7}
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
      <Dialog onOpenChange={setIsAddDialogOpen} open={isAddDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
                  onValueChange={handleJobPositionChange}
                  value={formData.job_position_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.length === 0 ? (
                      <SelectItem disabled value="none">
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
                  <p className="mt-1 text-muted-foreground text-xs">
                    Cadastre vagas em{" "}
                    <a className="text-primary underline" href="/cargos">
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nome completo"
                  value={formData.name}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                  type="email"
                  value={formData.email}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                />
              </div>
              <div>
                <Label htmlFor="source">Origem</Label>
                <Select
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, source: v }))
                  }
                  value={formData.source}
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
                  className={formData.job_position_id ? "bg-muted" : ""}
                  id="position"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  placeholder="Ex: Desenvolvedor Frontend"
                  readOnly={!!formData.job_position_id}
                  value={formData.position}
                />
                {formData.job_position_id && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    Preenchido automaticamente pela vaga
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  className={
                    formData.job_position_id && formData.department
                      ? "bg-muted"
                      : ""
                  }
                  id="department"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  placeholder="Ex: Tecnologia"
                  readOnly={!!formData.job_position_id && !!formData.department}
                  value={formData.department}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected_salary">Salário Esperado (R$)</Label>
                <Input
                  id="expected_salary"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_salary: e.target.value,
                    }))
                  }
                  placeholder="5000"
                  type="number"
                  value={formData.expected_salary}
                />
              </div>
              <div>
                <Label htmlFor="expected_start_date">
                  Data de Início Esperada
                </Label>
                <Input
                  id="expected_start_date"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_start_date: e.target.value,
                    }))
                  }
                  type="date"
                  value={formData.expected_start_date}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stage_id">Etapa Inicial</Label>
                <Select
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, stage_id: v }))
                  }
                  value={formData.stage_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
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
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      className="p-1 transition-transform hover:scale-110"
                      key={star}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, rating: star }))
                      }
                      type="button"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6",
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Informações adicionais sobre o candidato..."
                rows={3}
                value={formData.notes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button disabled={isSubmitting} onClick={handleAddCandidate}>
              {isSubmitting ? "Adicionando..." : "Adicionar Candidato"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
