import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Github,
  Instagram,
  Lightbulb,
  Linkedin,
  ListChecks,
  Mail,
  MapPin,
  MessageSquare,
  Palette,
  Phone,
  Rocket,
  Smartphone,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles as SparklesComponent } from "@/components/ui/sparkles";
import { Textarea } from "@/components/ui/textarea";

export default function SoftwareHousePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-gray-200 border-b bg-white bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link className="flex items-center" href="/software-house">
            <Image
              alt="Altos AI"
              className="h-10 w-auto"
              height={60}
              priority
              src="/images/altos-logo-horizontal.png"
              width={180}
            />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              className="font-medium text-gray-600 text-sm transition-colors hover:text-[#5B9AAD]"
              href="#servicos"
            >
              Serviços
            </a>
            <a
              className="font-medium text-gray-600 text-sm transition-colors hover:text-[#5B9AAD]"
              href="#portfolio"
            >
              Portfólio
            </a>
            <a
              className="font-medium text-gray-600 text-sm transition-colors hover:text-[#5B9AAD]"
              href="#sobre"
            >
              Sobre Nós
            </a>
            <a
              className="font-medium text-gray-600 text-sm transition-colors hover:text-[#5B9AAD]"
              href="#contato"
            >
              Contato
            </a>
          </nav>
          <Link href="#contato">
            <Button className="bg-[#5B9AAD] text-white hover:bg-[#4A8999]">
              Fale Conosco
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="absolute top-20 right-10 h-96 w-96 rounded-full bg-[#5B9AAD]/10 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="container relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 font-medium text-[#1E3A4C] text-sm">
              <Rocket className="h-4 w-4 text-[#5B9AAD]" />
              Software House Brasileira
            </div>

            <div className="mb-10 flex justify-center">
              <SparklesComponent
                className="relative inline-block"
                particleColor="#5B9AAD"
                particleDensity={120}
                particleSize={1.4}
                speed={0.5}
              >
                <Image
                  alt="Altos AI"
                  className="h-auto w-full max-w-sm"
                  height={120}
                  priority
                  src="/images/altos-logo-horizontal.png"
                  width={400}
                />
              </SparklesComponent>
            </div>

            <h1 className="mb-6 text-balance font-bold text-3xl text-gray-900 leading-tight md:text-4xl lg:text-5xl">
              Transformamos ideias em{" "}
              <span className="text-[#5B9AAD]">software de ponta</span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-base text-gray-600 leading-relaxed md:text-lg">
              Desenvolvimento sob medida com tecnologia de última geração para
              impulsionar seu negócio ao próximo nível
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="#contato">
                <Button
                  className="h-12 w-full bg-[#5B9AAD] px-8 font-semibold text-base text-white shadow-[#5B9AAD]/25 shadow-lg hover:bg-[#4A8999] sm:w-auto"
                  size="lg"
                >
                  Iniciar Projeto
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#portfolio">
                <Button
                  className="h-12 w-full border-2 border-[#5B9AAD] bg-transparent px-8 font-semibold text-[#5B9AAD] text-base hover:bg-[#5B9AAD]/5 sm:w-auto"
                  size="lg"
                  variant="outline"
                >
                  Ver Portfólio
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mt-16">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#5B9AAD]/20 to-blue-400/20 blur-2xl" />
            <div className="relative rounded-2xl bg-gray-800 p-3 shadow-2xl">
              <div className="mb-2 flex items-center gap-2 rounded-t-lg bg-gray-700 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-flex items-center gap-2 rounded bg-gray-600 px-3 py-1 font-medium text-gray-300 text-xs">
                    <Sparkles className="h-3 w-3" />
                    Altos AI Platform
                  </div>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-white">
                <img
                  alt="Altos AI Platform Demo"
                  className="h-full w-full bg-gray-50 object-contain"
                  src="/images/screenshot-202025-12-03-20at-2011.png"
                />
              </div>
              <div className="mt-2 h-1 rounded-b-lg bg-gray-700" />
            </div>
            <div
              className="relative mx-auto h-3 rounded-b-xl bg-gray-300"
              style={{ width: "110%" }}
            />
            <div
              className="relative mx-auto h-1 rounded-b-2xl bg-gray-400 shadow-lg"
              style={{ width: "120%" }}
            />
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute right-0 bottom-0 left-0">
          <svg
            className="w-full"
            fill="none"
            viewBox="0 0 1440 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      <section className="bg-white py-24" id="servicos">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              Nossos Serviços
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Soluções completas em tecnologia para transformar sua visão em
              realidade, com{" "}
              <span className="font-semibold text-[#5B9AAD]">
                +15 anos de experiência
              </span>{" "}
              com desenvolvimento e negócios
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Code2 className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900 text-xl">
                  Desenvolvimento Web & Mobile
                </h3>
                <p className="mb-4 text-gray-600">
                  Aplicações modernas e escaláveis com as melhores tecnologias
                  do mercado.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    React
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    React Native
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Node.js
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Rocket className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900 text-xl">
                  Plataformas SaaS
                </h3>
                <p className="mb-4 text-gray-600">
                  Criamos plataformas SaaS completas, escaláveis e prontas para
                  monetização desde o primeiro dia.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Multi-tenant
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Assinaturas
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    API
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <GitBranch className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900 text-xl">
                  Venda de Código Fonte
                </h3>
                <p className="mb-4 text-gray-600">
                  Adquira sistemas prontos com código fonte completo para
                  personalizar e escalar seu negócio rapidamente.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    White-label
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Documentado
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Suporte
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Cloud className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900 text-xl">
                  Soluções Cloud & DevOps
                </h3>
                <p className="mb-4 text-gray-600">
                  Infraestrutura escalável e processos automatizados para máxima
                  eficiência.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    AWS
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Azure
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    CI/CD
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Palette className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900 text-xl">
                  UI/UX Design
                </h3>
                <p className="mb-4 text-gray-600">
                  Design centrado no usuário para experiências memoráveis e
                  intuitivas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Design System
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Prototipagem
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Lightbulb className="h-7 w-7" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900 text-xl">
                  Consultoria Tech
                </h3>
                <p className="mb-4 text-gray-600">
                  Orientação estratégica para decisões tecnológicas assertivas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Arquitetura
                  </span>
                  <span className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-600 text-xs">
                    Performance
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="bg-gray-50 py-24" id="portfolio">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              Nosso Portfólio
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Projeto que gerou resultados reais para nossos clientes
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Card className="group overflow-hidden border-0 shadow-xl">
              <div className="grid gap-0 md:grid-cols-2">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] md:h-auto">
                  <img
                    alt="Plataforma de Onboarding"
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    src="/images/screenshot-202025-12-03-20at-2011.png"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-full bg-white/20 px-3 py-1 font-medium text-white text-xs backdrop-blur-sm">
                      Plataforma SaaS
                    </span>
                  </div>
                </div>
                <CardContent className="flex flex-col justify-center p-8">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#5B9AAD]/20 bg-[#5B9AAD]/10 px-3 py-1 font-medium text-[#1E3A4C] text-sm">
                    <Sparkles className="h-4 w-4 text-[#5B9AAD]" />
                    Destaque
                  </div>
                  <h3 className="mb-3 font-bold text-2xl text-gray-900">
                    Plataforma de Onboarding com IA
                  </h3>
                  <p className="mb-6 text-gray-600 leading-relaxed">
                    Sistema completo de integração de novos colaboradores com
                    assistente virtual inteligente, base de conhecimento, chat
                    em grupo, gestão de tarefas e acompanhamento de progresso em
                    tempo real.
                  </p>

                  <div className="mb-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5B9AAD]/10">
                        <MessageSquare className="h-5 w-5 text-[#5B9AAD]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Chat com IA
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Assistente virtual treinado para responder dúvidas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5B9AAD]/10">
                        <BookOpen className="h-5 w-5 text-[#5B9AAD]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Base de Conhecimento
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Documentação corporativa acessível via chat
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#5B9AAD]/10">
                        <ListChecks className="h-5 w-5 text-[#5B9AAD]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Primeiros Passos
                        </h4>
                        <p className="text-gray-600 text-sm">
                          Checklist interativo com progresso em tempo real
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    <span className="rounded bg-[#5B9AAD]/10 px-2 py-1 font-medium text-[#5B9AAD] text-xs">
                      Next.js
                    </span>
                    <span className="rounded bg-[#5B9AAD]/10 px-2 py-1 font-medium text-[#5B9AAD] text-xs">
                      Supabase
                    </span>
                    <span className="rounded bg-[#5B9AAD]/10 px-2 py-1 font-medium text-[#5B9AAD] text-xs">
                      OpenAI
                    </span>
                    <span className="rounded bg-[#5B9AAD]/10 px-2 py-1 font-medium text-[#5B9AAD] text-xs">
                      Tailwind
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium text-sm">
                        50% redução no tempo de integração
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              Tecnologias que Dominamos
            </h2>
            <p className="text-gray-600 text-lg">
              Stack moderna para soluções de alto desempenho
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 opacity-70">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-[#3178C6]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 0 0-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 0 0-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.063h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.822.616 1.42.616.24 0 .47-.044.688-.126l1.333.776.55-.6zm-2.504-1.02c-.24-.472-.36-1.074-.36-1.805 0-1.162.31-1.742.932-1.742.323 0 .57.16.744.478.212.378.318.984.318 1.815 0 1.136-.31 1.704-.93 1.704-.314 0-.56-.15-.704-.45z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">TypeScript</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-[#F7DF1E]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.635l-4.4-3.27 5.346-4.686z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">JavaScript</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Code2 className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-gray-600 text-sm">React</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-[#DD0031]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638a.186.186 0 0 0-.186-.185V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.185.185 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.084.185.186.186m-2.92 0h2.12a.185.185 0 0 0 .184-.185V6.29a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Angular</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Smartphone className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-gray-600 text-sm">React Native</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Database className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-gray-600 text-sm">PostgreSQL</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <Cloud className="h-7 w-7 text-[#FF9900]" />
              </div>
              <span className="text-gray-600 text-sm">AWS</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-[#4285F4]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-8.825-6.893zM8.073 19.673a4.755 4.755 0 0 1-4.071-1.236c-2.584-2.472-2.046-6.899 1.103-8.72.053-.034.104-.07.153-.104l.045-.03a9.136 9.136 0 0 1 .793-.488 8.807 8.807 0 0 0-.123 1.46c0 4.925 3.994 8.918 8.918 8.918h.18a6.696 6.696 0 0 1-4.999.2z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">GCP</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-[#0078D4]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.083 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32zm-3.873-7.635l-4.4-3.27 5.346-4.686z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Azure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-[#2496ED]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.185.185 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.084.185.186.186m-2.92 0h2.12a.185.185 0 0 0 .184-.185V6.29a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.186.186 0 0 0 .185-.185V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.084.185.185.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z" />
                </svg>
              </div>
              <span className="text-gray-600 text-sm">Docker</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                <GitBranch className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-gray-600 text-sm">Git</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-24" id="sobre">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-6 font-bold text-3xl text-gray-900 md:text-4xl">
                Sobre a Altos AI
              </h2>
              <p className="mb-6 text-gray-600 text-lg leading-relaxed">
                Somos uma software house brasileira especializada em
                desenvolvimento de soluções digitais inovadoras. Nossa missão é
                transformar ideias em produtos que geram valor real para nossos
                clientes.
              </p>
              <p className="mb-8 text-gray-600 text-lg leading-relaxed">
                Com uma equipe multidisciplinar de desenvolvedores, designers e
                especialistas em negócios, entregamos projetos que combinam
                excelência técnica com visão estratégica.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                    <Users className="h-6 w-6 text-[#5B9AAD]" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-gray-900">+</div>
                    <div className="text-gray-600 text-sm">
                      Clientes atendidos
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                    <Rocket className="h-6 w-6 text-[#5B9AAD]" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-gray-900">+</div>
                    <div className="text-gray-600 text-sm">
                      Projetos entregues
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#5B9AAD]/20 to-blue-400/20 blur-2xl" />
              <img
                alt="Equipe Altos AI"
                className="relative w-full rounded-2xl shadow-2xl"
                src="/modern-tech-team-working-together-in-office-with-c.jpg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-gray-600 text-lg">
              Feedback de quem confia em nosso trabalho
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      key={i}
                    />
                  ))}
                </div>
                <p className="mb-6 text-gray-600 leading-relaxed">
                  &quot;A Altos AI superou todas as expectativas. O projeto foi
                  entregue no prazo e com qualidade excepcional. Recomendo
                  fortemente!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B9AAD]/20">
                    <span className="font-bold text-[#5B9AAD]">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Maria Rodrigues
                    </div>
                    <div className="text-gray-600 text-sm">CEO, TechStart</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      key={i}
                    />
                  ))}
                </div>
                <p className="mb-6 text-gray-600 leading-relaxed">
                  &quot;Profissionais extremamente competentes e comprometidos.
                  O app ficou incrível e nossos usuários adoraram!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B9AAD]/20">
                    <span className="font-bold text-[#5B9AAD]">JS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      João Silva
                    </div>
                    <div className="text-gray-600 text-sm">
                      CTO, DeliveryMax
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      key={i}
                    />
                  ))}
                </div>
                <p className="mb-6 text-gray-600 leading-relaxed">
                  &quot;Parceria de longo prazo. A Altos AI entende nossas
                  necessidades e sempre entrega soluções inovadoras.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5B9AAD]/20">
                    <span className="font-bold text-[#5B9AAD]">AC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ana Costa</div>
                    <div className="text-gray-600 text-sm">
                      Diretora, IndustriaTech
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        className="bg-gradient-to-br from-[#1E3A4C] to-[#5B9AAD] py-24"
        id="contato"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-16 md:grid-cols-2">
            <div className="text-white">
              <h2 className="mb-6 font-bold text-3xl md:text-4xl">
                Vamos Conversar?
              </h2>
              <p className="mb-8 text-blue-100 text-lg leading-relaxed">
                Tem um projeto em mente? Entre em contato conosco e vamos
                transformar sua ideia em realidade.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-200 text-sm">Email</div>
                    <div className="font-medium">contato@altosai.com.br</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-200 text-sm">Telefone</div>
                    <div className="font-medium">+55 (11) 99999-9999</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-200 text-sm">Localização</div>
                    <div className="font-medium">Santa Catarina, Brasil</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <a
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  href="#"
                >
                  <Linkedin className="h-5 w-5 text-white" />
                </a>
                <a
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  href="#"
                >
                  <Github className="h-5 w-5 text-white" />
                </a>
                <a
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  href="#"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="mb-6 font-bold text-gray-900 text-xl">
                  Envie sua Mensagem
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        placeholder="seu@email.com"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Nome da empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      placeholder="Conte-nos sobre seu projeto..."
                      rows={4}
                    />
                  </div>
                  <Button className="w-full bg-[#5B9AAD] text-white hover:bg-[#4A8999]">
                    Enviar Mensagem
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center">
              <Image
                alt="Altos AI"
                className="h-8 w-auto opacity-80 brightness-0 invert"
                height={50}
                src="/images/altos-logo-horizontal.png"
                width={150}
              />
            </div>
            <div className="text-center text-sm md:text-left">
              © {new Date().getFullYear()} Altos AI. Todos os direitos
              reservados.
            </div>
            <div className="flex gap-4">
              <a className="transition-colors hover:text-white" href="#">
                Privacidade
              </a>
              <a className="transition-colors hover:text-white" href="#">
                Termos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
