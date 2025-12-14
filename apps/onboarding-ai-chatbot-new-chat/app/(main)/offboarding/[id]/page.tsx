"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Calendar,
  Building,
  FileText,
  CheckCircle2,
  Shield,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  Folder,
  Key,
  Laptop,
  ClipboardList,
  UserCog,
  UserCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { useParams } from "next/navigation"

interface OffboardingProcess {
  id: string
  user_id: string
  initiated_by: string
  employee_name: string
  employee_email: string
  department: string | null
  last_working_day: string | null
  reason: string | null
  status: string
  notes: string | null
  created_at: string
}

interface ChecklistStep {
  id: string
  title: string
  description: string | null
  category: string
  order_index: number
  requires_admin_approval: boolean
}

interface ProgressItem {
  id: string
  process_id: string
  step_id: string
  completed: boolean
  completed_at: string | null
  admin_approved: boolean
  admin_approved_at: string | null
  notes: string | null
  step: ChecklistStep
}

interface HandoverTask {
  id: string
  task_title: string
  task_description: string | null
  assigned_to_name: string | null
  status: string
  priority: string
  due_date: string | null
}

const categoryConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  handover: { label: "Transferência", icon: ClipboardList, color: "bg-blue-500" },
  documentation: { label: "Documentação", icon: Folder, color: "bg-purple-500" },
  administrative: { label: "Administrativo", icon: FileText, color: "bg-orange-500" },
  equipment: { label: "Equipamentos", icon: Laptop, color: "bg-green-500" },
  access: { label: "Acessos", icon: Key, color: "bg-red-500" },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-gray-500" },
  medium: { label: "Média", color: "bg-yellow-500" },
  high: { label: "Alta", color: "bg-orange-500" },
  critical: { label: "Crítica", color: "bg-red-500" },
}

const reasonLabels: Record<string, string> = {
  resignation: "Demissão Voluntária",
  termination: "Desligamento",
  retirement: "Aposentadoria",
  transfer: "Transferência",
}

export default function OffboardingDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [process, setProcess] = useState<OffboardingProcess | null>(null)
  const [progress, setProgress] = useState<ProgressItem[]>([])
  const [handoverTasks, setHandoverTasks] = useState<HandoverTask[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEmployee, setIsEmployee] = useState(false)
  const [activeView, setActiveView] = useState<"admin" | "employee">("admin")
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newTask, setNewTask] = useState({
    task_title: "",
    task_description: "",
    assigned_to_name: "",
    priority: "medium",
    due_date: "",
  })

  useEffect(() => {
    async function initialize() {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setCurrentUserId(user.id)
        }
      } catch (error) {
        console.error("Error getting user:", error)
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    if (currentUserId && id) {
      loadProcessDetails()
    }
  }, [currentUserId, id])

  useEffect(() => {
    if (process && currentUserId) {
      const userIsAdmin = process.initiated_by === currentUserId
      const userIsEmployee = process.user_id === currentUserId
      setIsAdmin(userIsAdmin)
      setIsEmployee(userIsEmployee)
      setActiveView(userIsAdmin ? "admin" : "employee")
    }
  }, [process, currentUserId])

  const loadProcessDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/offboarding/processes/${id}`)
      const data = await response.json()

      if (data.process) {
        setProcess(data.process)
        setProgress(data.progress || [])
        setHandoverTasks(data.handoverTasks || [])
      }
    } catch (error) {
      console.error("Error loading process details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStep = async (progressItem: ProgressItem) => {
    try {
      const response = await fetch("/api/offboarding/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: progressItem.id,
          completed: !progressItem.completed,
        }),
      })

      if (response.ok) {
        setProgress((prev) =>
          prev.map((item) =>
            item.id === progressItem.id
              ? { ...item, completed: !item.completed, completed_at: !item.completed ? new Date().toISOString() : null }
              : item,
          ),
        )
        toast.success(progressItem.completed ? "Passo desmarcado" : "Passo concluído!")
      }
    } catch (error) {
      console.error("[v0] Error toggling step:", error)
      toast.error("Erro ao atualizar passo")
    }
  }

  const handleApproveStep = async (progressItem: ProgressItem) => {
    try {
      const response = await fetch("/api/offboarding/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progressId: progressItem.id,
          adminApproved: !progressItem.admin_approved,
        }),
      })

      if (response.ok) {
        setProgress((prev) =>
          prev.map((item) => (item.id === progressItem.id ? { ...item, admin_approved: !item.admin_approved } : item)),
        )
        toast.success(progressItem.admin_approved ? "Aprovação removida" : "Passo aprovado!")
      }
    } catch (error) {
      console.error("[v0] Error approving step:", error)
      toast.error("Erro ao aprovar passo")
    }
  }

  const handleAddTask = async () => {
    if (!newTask.task_title) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/offboarding/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          process_id: id,
          ...newTask,
        }),
      })

      const data = await response.json()

      if (response.ok && data.task) {
        setHandoverTasks((prev) => [...prev, data.task])
        setIsAddTaskDialogOpen(false)
        setNewTask({
          task_title: "",
          task_description: "",
          assigned_to_name: "",
          priority: "medium",
          due_date: "",
        })
        toast.success("Tarefa adicionada!")
      }
    } catch (error) {
      console.error("[v0] Error adding task:", error)
      toast.error("Erro ao adicionar tarefa")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch("/api/offboarding/handover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      })

      if (response.ok) {
        setHandoverTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)))
        toast.success("Status atualizado!")
      }
    } catch (error) {
      console.error("[v0] Error updating task:", error)
      toast.error("Erro ao atualizar tarefa")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/offboarding/handover?taskId=${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setHandoverTasks((prev) => prev.filter((task) => task.id !== taskId))
        toast.success("Tarefa removida!")
      }
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
      toast.error("Erro ao remover tarefa")
    }
  }

  const handleCompleteProcess = async () => {
    try {
      const response = await fetch(`/api/offboarding/processes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setProcess((prev) => (prev ? { ...prev, status: "completed" } : null))
        toast.success("Processo de offboarding concluído!")
      }
    } catch (error) {
      console.error("[v0] Error completing process:", error)
      toast.error("Erro ao concluir processo")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!process) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processo não encontrado</h2>
          <Button asChild>
            <Link href="/offboarding">Voltar</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const completedSteps = progress.filter((p) => p.completed).length
  const totalSteps = progress.length
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  const groupedProgress = progress.reduce(
    (acc, item) => {
      const category = item.step.category
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    },
    {} as Record<string, ProgressItem[]>,
  )

  const employeeCategories = ["handover", "documentation", "equipment"]
  const adminCategories = ["administrative", "access"]

  const employeeProgress = progress.filter((p) => employeeCategories.includes(p.step.category))
  const adminProgress = progress.filter(
    (p) => adminCategories.includes(p.step.category) || p.step.requires_admin_approval,
  )

  const employeeCompletedSteps = employeeProgress.filter((p) => p.completed).length
  const adminCompletedSteps = adminProgress.filter((p) => p.completed).length
  const adminApprovedSteps = progress.filter((p) => p.step.requires_admin_approval && p.admin_approved).length
  const totalAdminApprovalSteps = progress.filter((p) => p.step.requires_admin_approval).length

  const renderChecklistSection = (items: ProgressItem[], canEdit: boolean, showApproval: boolean) => {
    const grouped = items.reduce(
      (acc, item) => {
        const category = item.step.category
        if (!acc[category]) acc[category] = []
        acc[category].push(item)
        return acc
      },
      {} as Record<string, ProgressItem[]>,
    )

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categoryItems]) => {
          const config = categoryConfig[category] || categoryConfig.handover
          const CategoryIcon = config.icon
          const categoryCompleted = categoryItems.filter((i) => i.completed).length

          return (
            <Card key={category} className="overflow-hidden">
              <div className={cn("px-6 py-4 flex items-center justify-between", config.color)}>
                <div className="flex items-center gap-3 text-white">
                  <CategoryIcon className="h-5 w-5" />
                  <span className="font-semibold">{config.label}</span>
                </div>
                <Badge variant="secondary">
                  {categoryCompleted}/{categoryItems.length}
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                {categoryItems
                  .sort((a, b) => a.step.order_index - b.step.order_index)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                        item.completed ? "bg-green-500/5 border-green-500/20" : "hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => canEdit && handleToggleStep(item)}
                        disabled={!canEdit}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium", item.completed && "line-through text-muted-foreground")}>
                            {item.step.title}
                          </span>
                          {item.step.requires_admin_approval && (
                            <Badge variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Aprovação
                            </Badge>
                          )}
                          {item.admin_approved && (
                            <Badge className="bg-green-500 gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Aprovado
                            </Badge>
                          )}
                        </div>
                        {item.step.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.step.description}</p>
                        )}
                        {item.completed && item.completed_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Concluído em{" "}
                            {format(new Date(item.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      {showApproval && item.step.requires_admin_approval && item.completed && (
                        <Button
                          size="sm"
                          variant={item.admin_approved ? "default" : "outline"}
                          onClick={() => handleApproveStep(item)}
                          className="gap-1"
                        >
                          <Shield className="h-4 w-4" />
                          {item.admin_approved ? "Aprovado" : "Aprovar"}
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/offboarding">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Offboarding: {process.employee_name}</h1>
            <p className="text-muted-foreground">{process.employee_email}</p>
          </div>
          {process.status !== "completed" && progressPercentage === 100 && (
            <Button onClick={handleCompleteProcess} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Concluir Processo
            </Button>
          )}
        </div>

        {/* Employee Info Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{process.employee_name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {process.department && (
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {process.department}
                    </span>
                  )}
                  {process.last_working_day && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Último dia: {format(new Date(process.last_working_day), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  )}
                  {process.reason && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {reasonLabels[process.reason] || process.reason}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
              </div>
              <div className="w-24 h-24 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${progressPercentage * 2.51} 251`}
                    className="text-primary"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                  {completedSteps}/{totalSteps}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "admin" | "employee")} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="admin" className="gap-2">
              <UserCog className="h-4 w-4" />
              Visão Administrador
            </TabsTrigger>
            <TabsTrigger value="employee" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Visão Funcionário
            </TabsTrigger>
          </TabsList>

          {/* Admin View */}
          <TabsContent value="admin" className="space-y-6">
            {/* Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {completedSteps}/{totalSteps}
                  </p>
                  <p className="text-xs text-muted-foreground">Passos Concluídos</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {adminApprovedSteps}/{totalAdminApprovalSteps}
                  </p>
                  <p className="text-xs text-muted-foreground">Aprovações Admin</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">
                    {handoverTasks.filter((t) => t.status === "completed").length}/{handoverTasks.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Transferências</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">{progressPercentage}%</p>
                  <p className="text-xs text-muted-foreground">Progresso Total</p>
                </div>
              </Card>
            </div>

            {/* Admin Sub-tabs */}
            <Tabs defaultValue="all-checklist" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all-checklist">Todos os Passos</TabsTrigger>
                <TabsTrigger value="approvals">Aprovações Pendentes</TabsTrigger>
                <TabsTrigger value="handover">Transferências</TabsTrigger>
              </TabsList>

              <TabsContent value="all-checklist">
                {progress.length > 0 ? (
                  renderChecklistSection(progress, true, true)
                ) : (
                  <Card className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum passo encontrado</h3>
                    <p className="text-muted-foreground">Execute o script SQL para criar os passos do checklist.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="approvals">
                {progress.filter((p) => p.step.requires_admin_approval && p.completed && !p.admin_approved).length >
                0 ? (
                  renderChecklistSection(
                    progress.filter((p) => p.step.requires_admin_approval && p.completed && !p.admin_approved),
                    false,
                    true,
                  )
                ) : (
                  <Card className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma aprovação pendente</h3>
                    <p className="text-muted-foreground">Todos os passos que requerem aprovação foram aprovados.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="handover" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Tarefas de Transferência</h3>
                  <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Tarefa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Tarefa de Transferência</DialogTitle>
                        <DialogDescription>
                          Crie uma tarefa para transferir responsabilidades para outro funcionário.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Título da Tarefa *</Label>
                          <Input
                            value={newTask.task_title}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, task_title: e.target.value }))}
                            placeholder="Ex: Transferir gestão do projeto X"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição</Label>
                          <Textarea
                            value={newTask.task_description}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, task_description: e.target.value }))}
                            placeholder="Detalhes sobre a transferência..."
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Responsável</Label>
                            <Input
                              value={newTask.assigned_to_name}
                              onChange={(e) => setNewTask((prev) => ({ ...prev, assigned_to_name: e.target.value }))}
                              placeholder="Nome do responsável"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Prioridade</Label>
                            <Select
                              value={newTask.priority}
                              onValueChange={(value) => setNewTask((prev) => ({ ...prev, priority: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Baixa</SelectItem>
                                <SelectItem value="medium">Média</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="critical">Crítica</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Data Limite</Label>
                          <Input
                            type="date"
                            value={newTask.due_date}
                            onChange={(e) => setNewTask((prev) => ({ ...prev, due_date: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddTask} disabled={!newTask.task_title || isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {handoverTasks.length > 0 ? (
                  <div className="space-y-3">
                    {handoverTasks.map((task) => {
                      const priority = priorityConfig[task.priority] || priorityConfig.medium
                      return (
                        <Card key={task.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{task.task_title}</h4>
                                <Badge className={cn("text-white text-xs", priority.color)}>{priority.label}</Badge>
                              </div>
                              {task.task_description && (
                                <p className="text-sm text-muted-foreground mb-2">{task.task_description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {task.assigned_to_name && <span>Responsável: {task.assigned_to_name}</span>}
                                {task.due_date && (
                                  <span>Prazo: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select value={task.status} onValueChange={(v) => handleUpdateTaskStatus(task.id, v)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                                  <SelectItem value="completed">Concluída</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa de transferência</h3>
                    <p className="text-muted-foreground">Clique em "Nova Tarefa" para adicionar.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Employee View */}
          <TabsContent value="employee" className="space-y-6">
            {/* Employee Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {employeeCompletedSteps}/{employeeProgress.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Suas Tarefas</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {handoverTasks.filter((t) => t.status === "completed").length}/{handoverTasks.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Transferências</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-500">
                    {employeeProgress.length > 0
                      ? Math.round((employeeCompletedSteps / employeeProgress.length) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-muted-foreground">Seu Progresso</p>
                </div>
              </Card>
            </div>

            {/* Employee Info Banner */}
            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-700 dark:text-blue-300">
                    Bem-vindo ao seu processo de offboarding
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete os passos abaixo para garantir uma transição tranquila. Itens que requerem aprovação
                    administrativa serão revisados pelo RH após sua conclusão.
                  </p>
                </div>
              </div>
            </Card>

            {/* Employee Checklist */}
            <Tabs defaultValue="my-tasks" className="space-y-4">
              <TabsList>
                <TabsTrigger value="my-tasks">Minhas Tarefas</TabsTrigger>
                <TabsTrigger value="my-handover">Minhas Transferências</TabsTrigger>
              </TabsList>

              <TabsContent value="my-tasks">
                {employeeProgress.length > 0 ? (
                  renderChecklistSection(employeeProgress, true, false)
                ) : (
                  <Card className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa pendente</h3>
                    <p className="text-muted-foreground">Você não tem tarefas de offboarding atribuídas.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-handover">
                {handoverTasks.length > 0 ? (
                  <div className="space-y-3">
                    {handoverTasks.map((task) => {
                      const priority = priorityConfig[task.priority] || priorityConfig.medium
                      return (
                        <Card key={task.id} className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{task.task_title}</h4>
                                <Badge className={cn("text-white text-xs", priority.color)}>{priority.label}</Badge>
                                <Badge variant={task.status === "completed" ? "default" : "outline"}>
                                  {task.status === "pending"
                                    ? "Pendente"
                                    : task.status === "in_progress"
                                      ? "Em Andamento"
                                      : "Concluída"}
                                </Badge>
                              </div>
                              {task.task_description && (
                                <p className="text-sm text-muted-foreground mb-2">{task.task_description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {task.assigned_to_name && <span>Novo responsável: {task.assigned_to_name}</span>}
                                {task.due_date && (
                                  <span>Prazo: {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma transferência pendente</h3>
                    <p className="text-muted-foreground">Você não tem responsabilidades para transferir.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
