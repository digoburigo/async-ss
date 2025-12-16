"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRight,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Plus,
  User,
  UserMinus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface OffboardingProcess {
  id: string;
  user_id: string;
  initiated_by: string;
  employee_name: string;
  employee_email: string;
  department: string | null;
  last_working_day: string | null;
  reason: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  in_progress: { label: "Em Andamento", color: "bg-blue-500" },
  pending_approval: { label: "Aguardando Aprovação", color: "bg-yellow-500" },
  completed: { label: "Concluído", color: "bg-green-500" },
  cancelled: { label: "Cancelado", color: "bg-gray-500" },
};

const reasonLabels: Record<string, string> = {
  resignation: "Demissão Voluntária",
  termination: "Desligamento",
  retirement: "Aposentadoria",
  transfer: "Transferência",
};

export default function OffboardingPage() {
  const [processes, setProcesses] = useState<OffboardingProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    employee_name: "",
    employee_email: "",
    department: "",
    last_working_day: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    async function initialize() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error("[v0] Error getting user:", error);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadProcesses();
    }
  }, [currentUserId]);

  const loadProcesses = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/offboarding/processes");
      const data = await response.json();

      if (data.processes) {
        setProcesses(data.processes);
      }
    } catch (error) {
      console.error("[v0] Error loading processes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProcess = async () => {
    if (!(formData.employee_name && formData.employee_email)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/offboarding/processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.process) {
        setProcesses((prev) => [data.process, ...prev]);
        setIsCreateDialogOpen(false);
        setFormData({
          employee_name: "",
          employee_email: "",
          department: "",
          last_working_day: "",
          reason: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("[v0] Error creating process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md space-y-4 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="mb-2 font-bold text-2xl">Autenticação Necessária</h2>
            <p className="text-muted-foreground">
              Você precisa estar autenticado para acessar o Offboarding.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/auth/login">Fazer Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-balance font-bold text-3xl md:text-4xl">
              Offboarding
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie o processo de desligamento de funcionários
            </p>
          </div>

          <Dialog
            onOpenChange={setIsCreateDialogOpen}
            open={isCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" size="lg">
                <Plus className="h-5 w-5" />
                Iniciar Offboarding
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Iniciar Processo de Offboarding</DialogTitle>
                <DialogDescription>
                  Preencha as informações do funcionário para iniciar o processo
                  de desligamento.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_name">Nome do Funcionário *</Label>
                    <Input
                      id="employee_name"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          employee_name: e.target.value,
                        }))
                      }
                      placeholder="Nome completo"
                      value={formData.employee_name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_email">E-mail *</Label>
                    <Input
                      id="employee_email"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          employee_email: e.target.value,
                        }))
                      }
                      placeholder="email@empresa.com"
                      type="email"
                      value={formData.employee_email}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="Ex: Vendas"
                      value={formData.department}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_working_day">
                      Último Dia de Trabalho
                    </Label>
                    <Input
                      id="last_working_day"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          last_working_day: e.target.value,
                        }))
                      }
                      type="date"
                      value={formData.last_working_day}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo do Desligamento</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, reason: value }))
                    }
                    value={formData.reason}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resignation">
                        Demissão Voluntária
                      </SelectItem>
                      <SelectItem value="termination">Desligamento</SelectItem>
                      <SelectItem value="retirement">Aposentadoria</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Informações adicionais sobre o desligamento..."
                    rows={3}
                    value={formData.notes}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button
                    disabled={
                      !(formData.employee_name && formData.employee_email) ||
                      isSubmitting
                    }
                    onClick={handleCreateProcess}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Iniciar Processo"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-2xl">
                  {processes.filter((p) => p.status === "in_progress").length}
                </p>
                <p className="text-muted-foreground text-xs">Em Andamento</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-bold text-2xl">
                  {
                    processes.filter((p) => p.status === "pending_approval")
                      .length
                  }
                </p>
                <p className="text-muted-foreground text-xs">Aguardando</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-2xl">
                  {processes.filter((p) => p.status === "completed").length}
                </p>
                <p className="text-muted-foreground text-xs">Concluídos</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <UserMinus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-2xl">{processes.length}</p>
                <p className="text-muted-foreground text-xs">Total</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Process List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : processes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UserMinus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-semibold text-xl">
              Nenhum processo de offboarding
            </h3>
            <p className="mb-6 text-muted-foreground">
              Clique no botão acima para iniciar um novo processo de
              desligamento.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {processes.map((process) => {
              const status =
                statusConfig[process.status] || statusConfig.in_progress;

              return (
                <Link href={`/offboarding/${process.id}`} key={process.id}>
                  <Card className="cursor-pointer p-6 transition-shadow hover:shadow-md">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex items-start gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {process.employee_name}
                            </h3>
                            <Badge className={cn("text-white", status.color)}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {process.employee_email}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                            {process.department && (
                              <span className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                {process.department}
                              </span>
                            )}
                            {process.reason && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {reasonLabels[process.reason] || process.reason}
                              </span>
                            )}
                            {process.last_working_day && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Último dia:{" "}
                                {format(
                                  new Date(process.last_working_day),
                                  "dd/MM/yyyy",
                                  { locale: ptBR }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          Criado em{" "}
                          {format(new Date(process.created_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
