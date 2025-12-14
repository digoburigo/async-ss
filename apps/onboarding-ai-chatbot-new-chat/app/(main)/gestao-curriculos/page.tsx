"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  FileText,
  Users,
  Link2,
  Eye,
  Download,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  X,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Sparkles,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface LandingPage {
  id: string
  title: string
  slug: string
  description: string | null
  company_name: string
  company_description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  job_ids?: string[]
  linkedin_url?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  tiktok_url?: string | null
  twitter_url?: string | null
  portfolio_url?: string | null
}

interface Application {
  id: string
  landing_page_id: string
  job_position_id: string | null
  full_name: string
  email: string
  phone: string | null
  resume_url: string | null
  resume_filename: string | null
  cover_letter: string | null
  status: string
  notes: string | null
  created_at: string
  career_landing_pages: { title: string; slug: string } | null
  preboarding_job_positions: { title: string; department: string } | null
  linkedin_url?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  tiktok_url?: string | null
  twitter_url?: string | null
  portfolio_url?: string | null
}

interface JobPosition {
  id: string
  title: string
  department: string
  status: string
}

interface ResumeInsights {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}

export default function GestaoCurriculosPage() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [availableJobs, setAvailableJobs] = useState<JobPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("landing-pages")

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false)
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    company_name: "Nossa Empresa",
    company_description: "",
    is_active: true,
    linkedin_url: "",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    twitter_url: "",
    portfolio_url: "",
  })
  const [jobSelections, setJobSelections] = useState<string[]>([])

  const [resumeInsights, setResumeInsights] = useState<ResumeInsights | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [showInsights, setShowInsights] = useState(false)

  useEffect(() => {
    fetchLandingPages()
    fetchApplications()
    fetchAvailableJobs()
  }, [])

  const fetchLandingPages = async () => {
    try {
      const response = await fetch("/api/career/landing-pages")
      if (response.ok) {
        const data = await response.json()
        setLandingPages(data)
      }
    } catch (error) {
      console.error("Error fetching landing pages:", error)
      toast.error("Erro ao carregar landing pages")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/career/applications")
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch("/api/preboarding/jobs?status=active")
      if (response.ok) {
        const data = await response.json()
        setAvailableJobs(data.filter((job: JobPosition) => job.status === "active"))
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  const handleCreateLandingPage = async () => {
    try {
      const validJobIds = jobSelections.filter((id) => id !== "")
      const response = await fetch("/api/career/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, job_ids: validJobIds }),
      })

      if (response.ok) {
        toast.success("Landing page criada com sucesso!")
        setIsCreateDialogOpen(false)
        resetForm()
        fetchLandingPages()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao criar landing page")
      }
    } catch (error) {
      console.error("Error creating landing page:", error)
      toast.error("Erro ao criar landing page")
    }
  }

  const handleUpdateLandingPage = async () => {
    if (!selectedLandingPage) return

    try {
      const validJobIds = jobSelections.filter((id) => id !== "")
      const response = await fetch(`/api/career/landing-pages/${selectedLandingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, job_ids: validJobIds }),
      })

      if (response.ok) {
        toast.success("Landing page atualizada com sucesso!")
        setIsEditDialogOpen(false)
        resetForm()
        fetchLandingPages()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao atualizar landing page")
      }
    } catch (error) {
      console.error("Error updating landing page:", error)
      toast.error("Erro ao atualizar landing page")
    }
  }

  const handleDeleteLandingPage = async () => {
    if (!selectedLandingPage) return

    try {
      const response = await fetch(`/api/career/landing-pages/${selectedLandingPage.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Landing page excluída com sucesso!")
        setIsDeleteDialogOpen(false)
        setSelectedLandingPage(null)
        fetchLandingPages()
      } else {
        toast.error("Erro ao excluir landing page")
      }
    } catch (error) {
      console.error("Error deleting landing page:", error)
      toast.error("Erro ao excluir landing page")
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/career/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success("Status atualizado com sucesso!")
        fetchApplications()
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status })
        }
      } else {
        toast.error("Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Erro ao atualizar status")
    }
  }

  const handleGenerateInsights = async () => {
    if (!selectedApplication?.resume_url) return

    setIsLoadingInsights(true)
    setShowInsights(true)
    setResumeInsights(null)

    try {
      const response = await fetch("/api/career/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: selectedApplication.resume_url }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || "Erro ao analisar currículo")
        setShowInsights(false)
        return
      }

      const insights = await response.json()
      setResumeInsights(insights)
      toast.success("Análise concluída com sucesso!")
    } catch (error) {
      console.error("Error generating insights:", error)
      toast.error("Erro ao analisar currículo")
      setShowInsights(false)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      company_name: "Nossa Empresa",
      company_description: "",
      is_active: true,
      linkedin_url: "",
      instagram_url: "",
      facebook_url: "",
      tiktok_url: "",
      twitter_url: "",
      portfolio_url: "",
    })
    setJobSelections([])
    setSelectedLandingPage(null)
  }

  const openEditDialog = async (page: LandingPage) => {
    setSelectedLandingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description || "",
      company_name: page.company_name,
      company_description: page.company_description || "",
      is_active: page.is_active,
      linkedin_url: page.linkedin_url || "",
      instagram_url: page.instagram_url || "",
      facebook_url: page.facebook_url || "",
      tiktok_url: page.tiktok_url || "",
      twitter_url: page.twitter_url || "",
      portfolio_url: page.portfolio_url || "",
    })
    try {
      const response = await fetch(`/api/career/landing-pages/${page.id}`)
      if (response.ok) {
        const data = await response.json()
        setJobSelections(data.job_ids || [])
      }
    } catch (error) {
      console.error("Error fetching landing page details:", error)
    }
    setIsEditDialogOpen(true)
  }

  const addJobSelection = () => {
    setJobSelections((prev) => [...prev, ""])
  }

  const removeJobSelection = (index: number) => {
    setJobSelections((prev) => prev.filter((_, i) => i !== index))
  }

  const updateJobSelection = (index: number, value: string) => {
    setJobSelections((prev) => prev.map((v, i) => (i === index ? value : v)))
  }

  const getAvailableJobsForSelect = (currentIndex: number) => {
    const selectedInOtherSelects = jobSelections.filter((_, i) => i !== currentIndex)
    return availableJobs.filter((job) => !selectedInOtherSelects.includes(job.id))
  }

  const getJobsForLandingPage = (page: LandingPage) => {
    if (!page.job_ids || page.job_ids.length === 0) return []
    return availableJobs.filter((job) => page.job_ids?.includes(job.id))
  }

  const copyPublicUrl = (slug: string) => {
    const url = `${window.location.origin}/carreiras/${slug}`
    navigator.clipboard.writeText(url)
    toast.success("URL copiada para a área de transferência!")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      pending: { label: "Pendente", variant: "secondary" },
      reviewed: { label: "Analisado", variant: "default" },
      contacted: { label: "Contactado", variant: "default" },
      rejected: { label: "Rejeitado", variant: "destructive" },
      hired: { label: "Contratado", variant: "default" },
    }

    const config = statusConfig[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getApplicationsCount = (landingPageId: string) => {
    return applications.filter((app) => app.landing_page_id === landingPageId).length
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestão de Currículos</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas landing pages de carreiras e candidaturas</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Landing Page
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="landing-pages" className="gap-2">
              <Link2 className="h-4 w-4" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-2">
              <Users className="h-4 w-4" />
              Candidaturas
              {applications.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {applications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="landing-pages">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : landingPages.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma landing page criada</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Crie sua primeira landing page para começar a receber candidaturas
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Landing Page
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {landingPages.map((page) => (
                  <Card key={page.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{page.title}</CardTitle>
                            <Badge variant={page.is_active ? "default" : "secondary"}>
                              {page.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Link2 className="h-3 w-3" />
                              /carreiras/{page.slug}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {getApplicationsCount(page.id)} candidaturas
                            </span>
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.open(`/carreiras/${page.slug}`, "_blank")}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyPublicUrl(page.slug)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copiar URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(page)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedLandingPage(page)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {page.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{page.description}</p>
                      )}
                      {page.job_ids && page.job_ids.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs text-muted-foreground mr-1">Vagas:</span>
                          {getJobsForLandingPage(page).map((job) => (
                            <Badge key={job.id} variant="outline" className="text-xs">
                              {job.title}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Candidaturas Tab */}
          <TabsContent value="applications" className="mt-6">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma candidatura ainda</h3>
                  <p className="text-muted-foreground">
                    As candidaturas aparecerão aqui quando candidatos se inscreverem através das landing pages.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidato</TableHead>
                      <TableHead>Vaga</TableHead>
                      <TableHead>Landing Page</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.full_name}</p>
                            <p className="text-sm text-muted-foreground">{application.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.preboarding_job_positions?.title || "Não especificada"}</TableCell>
                        <TableCell>{application.career_landing_pages?.title || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(application.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setIsApplicationDetailOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Landing Page Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setIsEditDialogOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>{isEditDialogOpen ? "Editar Landing Page" : "Nova Landing Page"}</DialogTitle>
            <DialogDescription>Configure as informações da sua página de carreiras</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Página</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: isEditDialogOpen ? formData.slug : generateSlug(e.target.value),
                      })
                    }}
                    placeholder="Ex: Trabalhe Conosco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL (slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    placeholder="trabalhe-conosco"
                  />
                  <p className="text-xs text-muted-foreground">/carreiras/{formData.slug || "..."}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Descrição da Empresa</Label>
                <Textarea
                  id="company_description"
                  value={formData.company_description}
                  onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                  placeholder="Conte um pouco sobre sua empresa..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição da Página</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional para a página de carreiras..."
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Vagas Disponíveis</Label>
                  <span className="text-xs text-muted-foreground">
                    {jobSelections.filter((id) => id !== "").length} vaga(s) adicionada(s)
                  </span>
                </div>

                {availableJobs.length === 0 ? (
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma vaga cadastrada. Crie vagas em &quot;Gestão de Cargos&quot; primeiro.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobSelections.map((selectedJobId, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Select value={selectedJobId} onValueChange={(value) => updateJobSelection(index, value)}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecione uma vaga..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableJobsForSelect(index).map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                <div className="flex items-center gap-2">
                                  <span>{job.title}</span>
                                  <span className="text-xs text-muted-foreground">({job.department})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeJobSelection(index)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addJobSelection}
                      disabled={jobSelections.length >= availableJobs.length}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Vaga
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="URL do LinkedIn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="URL do Instagram"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="URL do Facebook"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiktok_url">TikTok</Label>
                <Input
                  id="tiktok_url"
                  value={formData.tiktok_url}
                  onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                  placeholder="URL do TikTok"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter_url">Twitter</Label>
                <Input
                  id="twitter_url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="URL do Twitter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio</Label>
                <Input
                  id="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                  placeholder="URL do Portfolio"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Página Ativa</Label>
                  <p className="text-sm text-muted-foreground">Páginas inativas não são acessíveis publicamente</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-background">
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setIsEditDialogOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (isEditDialogOpen) {
                    handleUpdateLandingPage()
                  } else {
                    handleCreateLandingPage()
                  }
                }}
              >
                {isEditDialogOpen ? "Salvar Alterações" : "Criar Landing Page"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Landing Page</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{selectedLandingPage?.title}&quot;? Esta ação não pode ser desfeita e
              todas as candidaturas associadas serão removidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteLandingPage}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog
        open={isApplicationDetailOpen}
        onOpenChange={(open) => {
          setIsApplicationDetailOpen(open)
          if (!open) {
            setResumeInsights(null)
            setShowInsights(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <DialogTitle>Detalhes da Candidatura</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
            {selectedApplication && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold break-words">{selectedApplication.full_name}</h3>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2 min-w-0">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="break-all">{selectedApplication.email}</span>
                      </span>
                      {selectedApplication.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{selectedApplication.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(selectedApplication.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      Vaga de Interesse
                    </p>
                    <p className="font-medium break-words">
                      {selectedApplication.preboarding_job_positions?.title || "Não especificada"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      Data da Candidatura
                    </p>
                    <p className="font-medium">
                      {format(new Date(selectedApplication.created_at), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                {(selectedApplication.linkedin_url ||
                  selectedApplication.instagram_url ||
                  selectedApplication.facebook_url ||
                  selectedApplication.tiktok_url ||
                  selectedApplication.twitter_url ||
                  selectedApplication.portfolio_url) && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Redes Sociais</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedApplication.linkedin_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.linkedin_url!, "_blank")}
                          className="justify-start"
                        >
                          <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2] flex-shrink-0" />
                          <span className="truncate">LinkedIn</span>
                        </Button>
                      )}
                      {selectedApplication.instagram_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.instagram_url!, "_blank")}
                          className="justify-start"
                        >
                          <Instagram className="h-4 w-4 mr-2 text-[#E4405F] flex-shrink-0" />
                          <span className="truncate">Instagram</span>
                        </Button>
                      )}
                      {selectedApplication.facebook_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.facebook_url!, "_blank")}
                          className="justify-start"
                        >
                          <Facebook className="h-4 w-4 mr-2 text-[#1877F2] flex-shrink-0" />
                          <span className="truncate">Facebook</span>
                        </Button>
                      )}
                      {selectedApplication.tiktok_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.tiktok_url!, "_blank")}
                          className="justify-start"
                        >
                          <svg className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                          <span className="truncate">TikTok</span>
                        </Button>
                      )}
                      {selectedApplication.twitter_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.twitter_url!, "_blank")}
                          className="justify-start"
                        >
                          <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2] flex-shrink-0" />
                          <span className="truncate">X (Twitter)</span>
                        </Button>
                      )}
                      {selectedApplication.portfolio_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.portfolio_url!, "_blank")}
                          className="justify-start"
                        >
                          <Globe className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                          <span className="truncate">Portfolio</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {selectedApplication.cover_letter && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Carta de Apresentação</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md break-words whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                )}

                {selectedApplication.resume_url && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Currículo</p>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedApplication.resume_url!, "_blank")}
                        className="w-full justify-center"
                      >
                        <Download className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{selectedApplication.resume_filename || "Baixar Currículo"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleGenerateInsights}
                        disabled={isLoadingInsights}
                        className="w-full justify-center bg-transparent"
                      >
                        {isLoadingInsights ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                        )}
                        Insight com IA
                      </Button>
                    </div>

                    {showInsights && (
                      <div className="mt-4 space-y-4 border rounded-lg p-4 bg-muted/50">
                        {isLoadingInsights ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Analisando currículo...</span>
                          </div>
                        ) : resumeInsights ? (
                          <>
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                                Resumo da Análise
                              </h4>
                              <p className="text-sm text-muted-foreground break-words">{resumeInsights.summary}</p>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-green-600">✓ Pontos Fortes</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {resumeInsights.strengths.map((strength, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground break-words">
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-orange-600">⚠ Pontos de Melhoria</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {resumeInsights.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="text-sm text-muted-foreground break-words">
                                    {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-2 border-t">
                              <h4 className="text-sm font-semibold mb-1">Recomendação</h4>
                              <p className="text-sm text-muted-foreground break-words">
                                {resumeInsights.recommendation}
                              </p>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
