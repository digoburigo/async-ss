"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Facebook,
  FileText,
  Heart,
  Instagram,
  Linkedin,
  LinkIcon,
  Loader2,
  MapPin,
  Send,
  Star,
  Target,
  Twitter,
  Upload,
  Users,
} from "lucide-react";
import type React from "react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  company_name: string;
  company_description: string | null;
}

interface JobPosition {
  id: string;
  title: string;
  department: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  employment_type: string | null;
}

export default function CareerLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showSocialMedia, setShowSocialMedia] = useState(false);

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
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    fetchLandingPageData();
  }, [slug]);

  const fetchLandingPageData = async () => {
    try {
      const response = await fetch(`/api/career/public/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setLandingPage(data.landingPage);
        setJobs(data.jobs);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching landing page:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(formData.full_name && formData.email)) {
      toast.error("Por favor, preencha seu nome e email");
      return;
    }

    if (!formData.job_position_id && jobs.length > 0) {
      toast.error("Por favor, selecione uma vaga de interesse");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("landing_page_id", landingPage!.id);
      submitData.append("full_name", formData.full_name);
      submitData.append("email", formData.email);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.job_position_id)
        submitData.append("job_position_id", formData.job_position_id);
      if (formData.cover_letter)
        submitData.append("cover_letter", formData.cover_letter);
      if (resumeFile) submitData.append("resume", resumeFile);
      if (formData.linkedin_url)
        submitData.append("linkedin_url", formData.linkedin_url);
      if (formData.instagram_url)
        submitData.append("instagram_url", formData.instagram_url);
      if (formData.facebook_url)
        submitData.append("facebook_url", formData.facebook_url);
      if (formData.tiktok_url)
        submitData.append("tiktok_url", formData.tiktok_url);
      if (formData.twitter_url)
        submitData.append("twitter_url", formData.twitter_url);
      if (formData.portfolio_url)
        submitData.append("portfolio_url", formData.portfolio_url);

      const response = await fetch("/api/career/applications", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success("Candidatura enviada com sucesso!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao enviar candidatura");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Erro ao enviar candidatura");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 10MB");
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Apenas arquivos PDF, DOC ou DOCX são permitidos");
        return;
      }
      setResumeFile(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound || !landingPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Card className="mx-4 max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mb-2 font-semibold text-xl">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground">
              Esta página de carreiras não existe ou está temporariamente
              indisponível.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="mb-3 font-bold text-2xl">Candidatura Enviada!</h1>
            <p className="mb-6 text-muted-foreground">
              Obrigado por se candidatar, {formData.full_name.split(" ")[0]}!
              Recebemos seus dados e entraremos em contato em breve pelo email{" "}
              <span className="font-medium text-foreground">
                {formData.email}
              </span>
              .
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
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
                  });
                  setResumeFile(null);
                }}
                variant="outline"
              >
                Enviar outra candidatura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
        <div className="container relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              <Building2 className="mr-1 h-3 w-3" />
              {landingPage.company_name}
            </Badge>
            <h1 className="mb-6 text-balance font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
              {landingPage.title}
            </h1>
            {landingPage.description && (
              <p className="mb-8 text-pretty text-lg text-muted-foreground md:text-xl">
                {landingPage.description}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
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
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <Card className="border-none bg-gradient-to-br from-card to-muted/20 shadow-lg">
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h2 className="mb-4 font-bold text-2xl">Sobre Nós</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {landingPage.company_description}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Missão</h3>
                      <p className="text-muted-foreground text-sm">
                        Transformar o mercado com inovação
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Valores</h3>
                      <p className="text-muted-foreground text-sm">
                        Colaboração, excelência e integridade
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Cultura</h3>
                      <p className="text-muted-foreground text-sm">
                        Ambiente inclusivo e inovador
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div>
              <h2 className="mb-2 font-bold text-2xl">Vagas Disponíveis</h2>
              <p className="text-muted-foreground">
                Encontre a oportunidade perfeita para sua carreira
              </p>
            </div>

            {jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-medium text-lg">
                    Nenhuma vaga disponível no momento
                  </h3>
                  <p className="text-muted-foreground">
                    Mas não se preocupe! Envie seu currículo e entraremos em
                    contato quando surgirem novas oportunidades.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card
                    className="group cursor-pointer border-l-4 border-l-transparent transition-all hover:border-l-primary hover:shadow-md"
                    key={job.id}
                    onClick={() =>
                      setFormData({ ...formData, job_position_id: job.id })
                    }
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg transition-colors group-hover:text-primary">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="mt-2 flex flex-wrap items-center gap-3">
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
                            {job.employment_type && (
                              <Badge variant="secondary">
                                {job.employment_type}
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </CardHeader>
                    {job.description && (
                      <CardContent className="pt-0">
                        <p className="line-clamp-2 text-muted-foreground text-sm">
                          {job.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <Card className="border-2 shadow-lg">
                <CardHeader className="rounded-t-lg bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Candidate-se Agora
                  </CardTitle>
                  <CardDescription>
                    Preencha o formulário abaixo para enviar sua candidatura
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">
                        Nome Completo{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="full_name"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="Seu nome completo"
                        required
                        value={formData.full_name}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="seu.email@exemplo.com"
                        required
                        type="email"
                        value={formData.email}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="(00) 00000-0000"
                        type="tel"
                        value={formData.phone}
                      />
                    </div>

                    {jobs.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="job_position">
                          Vaga de Interesse{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setFormData({ ...formData, job_position_id: value })
                          }
                          required
                          value={formData.job_position_id}
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
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="resume"
                          onChange={handleFileChange}
                          type="file"
                        />
                        <Button
                          className="w-full justify-start bg-transparent text-muted-foreground"
                          onClick={() =>
                            document.getElementById("resume")?.click()
                          }
                          type="button"
                          variant="outline"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {resumeFile
                            ? resumeFile.name
                            : "Anexar currículo (PDF, DOC)"}
                        </Button>
                        {resumeFile && (
                          <div className="mt-2 flex items-center gap-2 text-green-600 text-sm dark:text-green-400">
                            <FileText className="h-4 w-4" />
                            <span>{resumeFile.name}</span>
                            <Button
                              className="h-auto p-1 text-muted-foreground hover:text-destructive"
                              onClick={() => setResumeFile(null)}
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              Remover
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Máximo 10MB. Formatos: PDF, DOC, DOCX
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                      <button
                        className="flex w-full items-center justify-between bg-muted/50 p-3 transition-colors hover:bg-muted"
                        onClick={() => setShowSocialMedia(!showSocialMedia)}
                        type="button"
                      >
                        <span className="flex items-center gap-2 font-medium text-sm">
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
                        <div className="space-y-3 bg-muted/20 p-4">
                          <div className="space-y-2">
                            <Label
                              className="flex items-center gap-2 text-xs"
                              htmlFor="linkedin_url"
                            >
                              <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />
                              LinkedIn
                            </Label>
                            <Input
                              className="text-sm"
                              id="linkedin_url"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  linkedin_url: e.target.value,
                                })
                              }
                              placeholder="https://linkedin.com/in/seu-perfil"
                              type="url"
                              value={formData.linkedin_url}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              className="flex items-center gap-2 text-xs"
                              htmlFor="instagram_url"
                            >
                              <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
                              Instagram
                            </Label>
                            <Input
                              className="text-sm"
                              id="instagram_url"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  instagram_url: e.target.value,
                                })
                              }
                              placeholder="https://instagram.com/seu-usuario"
                              type="url"
                              value={formData.instagram_url}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              className="flex items-center gap-2 text-xs"
                              htmlFor="facebook_url"
                            >
                              <Facebook className="h-3.5 w-3.5 text-[#1877F2]" />
                              Facebook
                            </Label>
                            <Input
                              className="text-sm"
                              id="facebook_url"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  facebook_url: e.target.value,
                                })
                              }
                              placeholder="https://facebook.com/seu-perfil"
                              type="url"
                              value={formData.facebook_url}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              className="flex items-center gap-2 text-xs"
                              htmlFor="tiktok_url"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                              </svg>
                              TikTok
                            </Label>
                            <Input
                              className="text-sm"
                              id="tiktok_url"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  tiktok_url: e.target.value,
                                })
                              }
                              placeholder="https://tiktok.com/@seu-usuario"
                              type="url"
                              value={formData.tiktok_url}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              className="flex items-center gap-2 text-xs"
                              htmlFor="twitter_url"
                            >
                              <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
                              X (Twitter)
                            </Label>
                            <Input
                              className="text-sm"
                              id="twitter_url"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  twitter_url: e.target.value,
                                })
                              }
                              placeholder="https://x.com/seu-usuario"
                              type="url"
                              value={formData.twitter_url}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              className="flex items-center gap-2 text-xs"
                              htmlFor="portfolio_url"
                            >
                              <LinkIcon className="h-3.5 w-3.5" />
                              Portfólio/Website
                            </Label>
                            <Input
                              className="text-sm"
                              id="portfolio_url"
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  portfolio_url: e.target.value,
                                })
                              }
                              placeholder="https://seu-portfolio.com"
                              type="url"
                              value={formData.portfolio_url}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_letter">
                        Carta de Apresentação
                      </Label>
                      <Textarea
                        id="cover_letter"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cover_letter: e.target.value,
                          })
                        }
                        placeholder="Conte um pouco sobre você e por que deseja fazer parte da nossa equipe..."
                        rows={4}
                        value={formData.cover_letter}
                      />
                    </div>

                    <Button
                      className="w-full"
                      disabled={isSubmitting}
                      size="lg"
                      type="submit"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
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

      <footer className="mt-12 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>
              © {new Date().getFullYear()} {landingPage.company_name}. Todos os
              direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
