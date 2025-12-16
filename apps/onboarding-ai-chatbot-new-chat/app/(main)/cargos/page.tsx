"use client";

import {
  Briefcase,
  Building,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  work_model: string;
  employment_type: string;
  status: string;
  created_at: string;
}

const workModelLabels: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

const employmentTypeLabels: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  estagio: "Estágio",
  temporario: "Temporário",
};

export default function CargosPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    work_model: "presencial",
    employment_type: "clt",
    status: "active",
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await fetch("/api/preboarding/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      toast.error("Erro ao carregar cargos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (job?: JobPosition) => {
    if (job) {
      setSelectedJob(job);
      setFormData({
        title: job.title,
        department: job.department || "",
        location: job.location || "",
        work_model: job.work_model || "presencial",
        employment_type: job.employment_type || "clt",
        status: job.status || "active",
      });
    } else {
      setSelectedJob(null);
      setFormData({
        title: "",
        department: "",
        location: "",
        work_model: "presencial",
        employment_type: "clt",
        status: "active",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("O título do cargo é obrigatório");
      return;
    }

    setIsSaving(true);
    try {
      const url = selectedJob
        ? `/api/preboarding/jobs/${selectedJob.id}`
        : "/api/preboarding/jobs";
      const method = selectedJob ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(selectedJob ? "Cargo atualizado!" : "Cargo criado!");
        setIsDialogOpen(false);
        loadJobs();
      } else {
        toast.error("Erro ao salvar cargo");
      }
    } catch (error) {
      toast.error("Erro ao salvar cargo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    try {
      const res = await fetch(`/api/preboarding/jobs/${selectedJob.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Cargo removido!");
        setIsDeleteDialogOpen(false);
        setSelectedJob(null);
        loadJobs();
      } else {
        toast.error("Erro ao remover cargo");
      }
    } catch (error) {
      toast.error("Erro ao remover cargo");
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="mb-4 h-10 w-64" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton className="h-16 w-full" key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Gestão de Cargos</h1>
          <p className="text-muted-foreground">
            Cadastre os cargos disponíveis na empresa
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cargos..."
            value={searchQuery}
          />
        </div>
        <Badge className="px-3 py-1" variant="outline">
          {filteredJobs.length} cargo{filteredJobs.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-lg">
              Nenhum cargo encontrado
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              {searchQuery
                ? "Tente uma busca diferente"
                : "Comece cadastrando os cargos da empresa"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Cargo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {job.department || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {job.location || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {workModelLabels[job.work_model] || job.work_model}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {employmentTypeLabels[job.employment_type] ||
                        job.employment_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.status === "active" ? "default" : "secondary"
                      }
                    >
                      {job.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(job)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedJob(job);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedJob ? "Editar Cargo" : "Novo Cargo"}
            </DialogTitle>
            <DialogDescription>
              {selectedJob
                ? "Atualize as informações do cargo"
                : "Preencha as informações do novo cargo"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Cargo *</Label>
              <Input
                id="title"
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Desenvolvedor Full Stack"
                value={formData.title}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Ex: Tecnologia"
                  value={formData.department}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ex: São Paulo, SP"
                  value={formData.location}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modelo de Trabalho</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, work_model: value })
                  }
                  value={formData.work_model}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="remoto">Remoto</SelectItem>
                    <SelectItem value="hibrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Contrato</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, employment_type: value })
                  }
                  value={formData.employment_type}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clt">CLT</SelectItem>
                    <SelectItem value="pj">PJ</SelectItem>
                    <SelectItem value="estagio">Estágio</SelectItem>
                    <SelectItem value="temporario">Temporário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                value={formData.status}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button disabled={isSaving} onClick={handleSave}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Cargo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cargo "{selectedJob?.title}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
