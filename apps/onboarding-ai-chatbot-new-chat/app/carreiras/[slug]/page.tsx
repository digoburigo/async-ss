"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  MapPin,
  Briefcase,
  Upload,
  CheckCircle2,
  FileText,
  Users,
  Clock,
  Send,
  Loader2,
  ArrowRight,
  Star,
  Target,
  Heart,
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  LinkIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { toast } from "sonner"

interface LandingPage {
  id: string
  title: string
  slug: string
  description: string | null
  company_name: string
  company_description: string | null
}

interface JobPosition {
  id: string
  title: string
  department: string
  description: string | null
  requirements: string | null
  location: string | null
  employment_type: string | null
}

export default function CareerLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null)
  const [jobs, setJobs] = useState<JobPosition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showSocialMedia, setShowSocialMedia] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    job_position_id: "",
    cover_letter: "",
    linkedin_url: "",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: "",
    twitter_url: "",
    portfolio_url: "",
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  useEffect(() => {
    fetchLandingPageData()
  }, [slug])

  const fetchLandingPageData = async () => {
    try {
      const response = await fetch(`/api/career/public/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setLandingPage(data.landingPage)
        setJobs(data.jobs)
      } else if (response.status === 404) {
        setNotFound(true)
      }
    } catch (error) {
      console.error("Error fetching landing page:", error)
      setNotFound(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.full_name || !formData.email) {
      toast.error("Por favor, preencha seu nome e email")
      return
    }

    if (!formData.job_position_id && jobs.length > 0) {
      toast.error("Por favor, selecione uma vaga de interesse")
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("landing_page_id", landingPage!.id)
      submitData.append("full_name", formData.full_name)
      submitData.append("email", formData.email)
      if (formData.phone) submitData.append("phone", formData.phone)
      if (formData.job_position_id) submitData.append("job_position_id", formData.job_position_id)
      if (formData.cover_letter) submitData.append("cover_letter", formData.cover_letter)
      if (resumeFile) submitData.append("resume", resumeFile)
      if (formData.linkedin_url) submitData.append("linkedin_url", formData.linkedin_url)
      if (formData.instagram_url) submitData.append("instagram_url", formData.instagram_url)
      if (formData.facebook_url) submitData.append("facebook_url", formData.facebook_url)
      if (formData.tiktok_url) submitData.append("tiktok_url", formData.tiktok_url)
      if (formData.twitter_url) submitData.append("twitter_url", formData.twitter_url)
      if (formData.portfolio_url) submitData.append("portfolio_url", formData.portfolio_url)

      const response = await fetch("/api/career/applications", {
        method: "POST",
        body: submitData,
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success("Candidatura enviada com sucesso!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao enviar candidatura")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Erro ao enviar candidatura")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 10MB")
        return
      }
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        toast.error("Apenas arquivos PDF, DOC ou DOCX são permitidos")
        return
      }
      setResumeFile(file)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (notFound || !landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Página não encontrada</h1>
            <p className="text-muted-foreground">
              Esta página de carreiras não existe ou está temporariamente indisponível.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Candidatura Enviada!</h1>
            <p className="text-muted-foreground mb-6">
              Obrigado por se candidatar, {formData.full_name.split(" ")[0]}! Recebemos seus dados e entraremos em
              contato em breve pelo email <span className="font-medium text-foreground">{formData.email}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({
                    full_name: "",
                    email: "",
                    phone: "",
                    job_position_id: "",
                    cover_letter: "",
                    linkedin_url: "",
                    instagram_url: "",
                    facebook_url: "",
                    tiktok_url: "",
                    twitter_url: "",
                    portfolio_url: "",
                  })
                  setResumeFile(null)
                }}
              >
                Enviar outra candidatura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
        <div className="container max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Building2 className="h-3 w-3 mr-1" />
              {landingPage.company_name}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              {landingPage.title}
            </h1>
            {landingPage.description && (
              <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">{landingPage.description}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <span>{jobs.length} vagas abertas</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Equipe em crescimento</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Processo rápido</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {landingPage.company_description && (
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <Card className="border-none shadow-lg bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-4">Sobre Nós</h2>
                  <p className="text-muted-foreground leading-relaxed">{landingPage.company_description}</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Missão</h3>
                      <p className="text-sm text-muted-foreground">Transformar o mercado com inovação</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Valores</h3>
                      <p className="text-sm text-muted-foreground">Colaboração, excelência e integridade</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Cultura</h3>
                      <p className="text-sm text-muted-foreground">Ambiente inclusivo e inovador</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Vagas Disponíveis</h2>
              <p className="text-muted-foreground">Encontre a oportunidade perfeita para sua carreira</p>
            </div>

            {jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma vaga disponível no momento</h3>
                  <p className="text-muted-foreground">
                    Mas não se preocupe! Envie seu currículo e entraremos em contato quando surgirem novas
                    oportunidades.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                    onClick={() => setFormData({ ...formData, job_position_id: job.id })}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-3 mt-2">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {job.department}
                            </span>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {job.location}
                              </span>
                            )}
                            {job.employment_type && <Badge variant="secondary">{job.employment_type}</Badge>}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                    {job.description && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Candidate-se Agora
                  </CardTitle>
                  <CardDescription>Preencha o formulário abaixo para enviar sua candidatura</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">
                        Nome Completo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="seu.email@exemplo.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    {jobs.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="job_position">
                          Vaga de Interesse <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.job_position_id}
                          onValueChange={(value) => setFormData({ ...formData, job_position_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a vaga desejada" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobs.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                {job.title} - {job.department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="resume">Currículo</Label>
                      <div className="relative">
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-muted-foreground bg-transparent"
                          onClick={() => document.getElementById("resume")?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {resumeFile ? resumeFile.name : "Anexar currículo (PDF, DOC)"}
                        </Button>
                        {resumeFile && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-green-600 dark:text-green-400">
                            <FileText className="h-4 w-4" />
                            <span>{resumeFile.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 text-muted-foreground hover:text-destructive"
                              onClick={() => setResumeFile(null)}
                            >
                              Remover
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Máximo 10MB. Formatos: PDF, DOC, DOCX</p>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowSocialMedia(!showSocialMedia)}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className="text-sm font-medium flex items-center gap-2">
                          <LinkIcon className="h-4 w-4" />
                          Redes Sociais (Opcional)
                        </span>
                        {showSocialMedia ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {showSocialMedia && (
                        <div className="p-4 space-y-3 bg-muted/20">
                          <div className="space-y-2">
                            <Label htmlFor="linkedin_url" className="text-xs flex items-center gap-2">
                              <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />
                              LinkedIn
                            </Label>
                            <Input
                              id="linkedin_url"
                              type="url"
                              value={formData.linkedin_url}
                              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                              placeholder="https://linkedin.com/in/seu-perfil"
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="instagram_url" className="text-xs flex items-center gap-2">
                              <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
                              Instagram
                            </Label>
                            <Input
                              id="instagram_url"
                              type="url"
                              value={formData.instagram_url}
                              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                              placeholder="https://instagram.com/seu-usuario"
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="facebook_url" className="text-xs flex items-center gap-2">
                              <Facebook className="h-3.5 w-3.5 text-[#1877F2]" />
                              Facebook
                            </Label>
                            <Input
                              id="facebook_url"
                              type="url"
                              value={formData.facebook_url}
                              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                              placeholder="https://facebook.com/seu-perfil"
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tiktok_url" className="text-xs flex items-center gap-2">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                              </svg>
                              TikTok
                            </Label>
                            <Input
                              id="tiktok_url"
                              type="url"
                              value={formData.tiktok_url}
                              onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                              placeholder="https://tiktok.com/@seu-usuario"
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitter_url" className="text-xs flex items-center gap-2">
                              <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />X (Twitter)
                            </Label>
                            <Input
                              id="twitter_url"
                              type="url"
                              value={formData.twitter_url}
                              onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                              placeholder="https://x.com/seu-usuario"
                              className="text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="portfolio_url" className="text-xs flex items-center gap-2">
                              <LinkIcon className="h-3.5 w-3.5" />
                              Portfólio/Website
                            </Label>
                            <Input
                              id="portfolio_url"
                              type="url"
                              value={formData.portfolio_url}
                              onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                              placeholder="https://seu-portfolio.com"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_letter">Carta de Apresentação</Label>
                      <Textarea
                        id="cover_letter"
                        value={formData.cover_letter}
                        onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                        placeholder="Conte um pouco sobre você e por que deseja fazer parte da nossa equipe..."
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Candidatura
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t bg-muted/30 mt-12">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {landingPage.company_name}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
