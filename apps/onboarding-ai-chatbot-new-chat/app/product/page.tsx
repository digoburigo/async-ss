import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ListChecks,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles as SparklesComponent } from "@/components/ui/sparkles";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-gray-200 border-b bg-white bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link className="flex items-center" href="/">
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
              href="#funcionalidades"
            >
              Funcionalidades
            </a>
            <a
              className="font-medium text-gray-600 text-sm transition-colors hover:text-[#5B9AAD]"
              href="#beneficios"
            >
              Benefícios
            </a>
            <a
              className="font-medium text-gray-600 text-sm transition-colors hover:text-[#5B9AAD]"
              href="#demo"
            >
              Veja em Ação
            </a>
          </nav>
          <Link href="/auth/login">
            <Button
              className="border-[#5B9AAD] bg-transparent text-[#5B9AAD] hover:bg-[#5B9AAD]/10"
              variant="outline"
            >
              Entrar
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
              <Sparkles className="h-4 w-4 text-[#5B9AAD]" />
              Integração Inteligente com IA
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
              Do primeiro dia ao último: Gerencie toda a jornada do colaborador
              com IA
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-pretty text-base text-gray-600 leading-relaxed md:text-lg">
              Plataforma completa para acelerar e personalizar a integração de
              novos colaboradores, conectando-os à cultura e conhecimento da sua
              empresa.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button
                  className="h-12 w-full bg-[#5B9AAD] px-8 font-semibold text-base text-white shadow-[#5B9AAD]/25 shadow-lg hover:bg-[#4A8999] sm:w-auto"
                  size="lg"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/onboarding-chat">
                <Button
                  className="h-12 w-full border-2 border-[#5B9AAD] bg-transparent px-8 font-semibold text-[#5B9AAD] text-base hover:bg-[#5B9AAD]/5 sm:w-auto"
                  size="lg"
                  variant="outline"
                >
                  Ver Demonstração
                </Button>
              </Link>
            </div>
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

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 font-bold text-4xl text-[#5B9AAD] md:text-5xl">
                50%
              </div>
              <div className="text-gray-600 text-sm md:text-base">
                Redução no tempo de integração
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-4xl text-[#5B9AAD] md:text-5xl">
                24/7
              </div>
              <div className="text-gray-600 text-sm md:text-base">
                Suporte com IA disponível
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-4xl text-[#5B9AAD] md:text-5xl">
                100%
              </div>
              <div className="text-gray-600 text-sm md:text-base">
                Personalizado por cargo
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 font-bold text-4xl text-[#5B9AAD] md:text-5xl">
                4x
              </div>
              <div className="text-gray-600 text-sm md:text-base">
                Mais engajamento
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Product Demo Section */}
      <section className="bg-white py-24" id="demo">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left side - Feature descriptions */}
            <div className="space-y-8">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5B9AAD]/20 bg-[#5B9AAD]/10 px-3 py-1 font-medium text-[#1E3A4C] text-sm">
                  <Sparkles className="h-4 w-4 text-[#5B9AAD]" />
                  Veja em Ação
                </div>
                <h2 className="mb-4 text-balance font-bold text-3xl text-gray-900 md:text-4xl">
                  Experiência completa do início ao fim da jornada do
                  colaborador
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Do recrutamento ao desligamento: uma plataforma única que
                  cobre preboarding, onboarding, rotina diária e offboarding com
                  inteligência artificial.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                      <Users className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                      Preboarding Inteligente
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      CRM completo para gestão de candidatos com geração
                      automática de perguntas de entrevista por IA, tanto para
                      hard skills quanto soft skills, personalizadas para cada
                      cargo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                      <MessageSquare className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                      Assistente IA 24/7
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Chat inteligente treinado com a base de conhecimento da
                      empresa, respondendo dúvidas sobre processos, políticas e
                      cultura organizacional instantaneamente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                      <Clock className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                      Atas de Reunião com Transcrição
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Agende reuniões recorrentes com integração ao calendário e
                      transcreva conversas em tempo real usando reconhecimento
                      de voz, mantendo registro completo das decisões.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                      <TrendingUp className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                      Gamificação e Kanban
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Múltiplos quadros Kanban para gestão de tarefas, sistema
                      de pontuação e conquistas para engajar colaboradores
                      durante toda a jornada na empresa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B9AAD]/10">
                      <ListChecks className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                      Offboarding Estruturado
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Processo completo de desligamento com checklist de
                      tarefas, entrevista de saída, transferência de
                      conhecimento e documentação para garantir transições
                      suaves.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Notebook mockup with video */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-[#5B9AAD]/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

              {/* Notebook mockup */}
              <div className="relative z-10">
                <div className="relative rounded-2xl bg-gray-800 p-3 shadow-2xl">
                  {/* Notebook top bar */}
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
                      alt="Altos AI Platform - Primeiros Passos"
                      className="h-full w-full bg-gray-50 object-contain"
                      src="/images/altos-primeiros-passos-demo.jpeg"
                    />
                  </div>

                  {/* Notebook bottom */}
                  <div className="mt-2 h-1 rounded-b-lg bg-gray-700" />
                </div>

                {/* Keyboard base */}
                <div
                  className="relative mx-auto h-3 rounded-b-xl bg-gray-300"
                  style={{ width: "110%" }}
                />
                <div
                  className="relative mx-auto h-1 rounded-b-2xl bg-gray-400 shadow-lg"
                  style={{ width: "120%" }}
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 z-20 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C]">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-gray-900">95%</div>
                    <div className="text-gray-600 text-xs">
                      Taxa de Conclusão
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20" id="funcionalidades">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-5xl">
              Funcionalidades que fazem a diferença
            </h2>
            <p className="mx-auto max-w-3xl text-gray-600 text-lg leading-relaxed md:text-xl">
              Plataforma completa para gestão do ciclo de vida do colaborador,
              do recrutamento ao desligamento
            </p>
          </div>

          <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 - Preboarding */}
            <Card className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-2xl bg-[#5B9AAD]/10 p-4 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">
                  Preboarding Inteligente
                </h3>
                <p className="mb-4 text-gray-600 leading-relaxed">
                  CRM completo para gestão de candidatos com geração automática
                  de perguntas de entrevista por IA.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Perguntas hard skills e soft skills</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Agendamento de entrevistas</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Pipeline de candidatos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 - Chat IA */}
            <Card className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-2xl bg-[#5B9AAD]/10 p-4 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">
                  Chat de Integração com IA
                </h3>
                <p className="mb-4 text-gray-600 leading-relaxed">
                  Assistente virtual inteligente que guia novos colaboradores
                  durante todo o processo de onboarding.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Respostas contextualizadas por cargo</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Histórico de conversas salvo</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Disponível 24/7</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 - Base de Conhecimento */}
            <Card className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-2xl bg-[#5B9AAD]/10 p-4 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">
                  Base de Conhecimento
                </h3>
                <p className="mb-4 text-gray-600 leading-relaxed">
                  Chat com IA treinada sobre políticas, processos e cultura da
                  empresa para respostas instantâneas.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Upload de documentos</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Busca semântica inteligente</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Respostas baseadas em contexto</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 - Atas de Reunião */}
            <Card className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-2xl bg-[#5B9AAD]/10 p-4 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">
                  Atas de Reunião
                </h3>
                <p className="mb-4 text-gray-600 leading-relaxed">
                  Agende reuniões recorrentes e transcreva conversas em tempo
                  real com reconhecimento de voz.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Transcrição por voz em tempo real</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Reuniões recorrentes</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Integração com calendário</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 5 - Kanban e Gamificação */}
            <Card className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-2xl bg-[#5B9AAD]/10 p-4 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">
                  Kanban e Gamificação
                </h3>
                <p className="mb-4 text-gray-600 leading-relaxed">
                  Múltiplos quadros Kanban com sistema de pontuação e conquistas
                  para engajar colaboradores.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Múltiplos quadros por usuário</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Sistema de pontos e níveis</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Conquistas e recompensas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 6 - Offboarding */}
            <Card className="group overflow-hidden border-0 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-6">
                <div className="mb-4 w-fit rounded-2xl bg-[#5B9AAD]/10 p-4 text-[#5B9AAD] transition-colors duration-300 group-hover:bg-[#5B9AAD] group-hover:text-white">
                  <ListChecks className="h-7 w-7" />
                </div>
                <h3 className="mb-3 font-bold text-gray-900 text-xl">
                  Offboarding Estruturado
                </h3>
                <p className="mb-4 text-gray-600 leading-relaxed">
                  Processo completo de desligamento com checklist, entrevista de
                  saída e transferência de conhecimento.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Checklist de desligamento</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Entrevista de saída</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#5B9AAD]" />
                    <span>Documentação automática</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20" id="beneficios">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-5xl">
              Por que escolher nossa plataforma?
            </h2>
            <p className="mx-auto max-w-3xl text-gray-600 text-lg leading-relaxed md:text-xl">
              Benefícios comprovados que transformam a experiência de integração
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            <div className="group text-center">
              <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] p-6 text-white shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                <Clock className="h-12 w-12" />
              </div>
              <h3 className="mb-3 font-bold text-2xl text-gray-900">
                Onboarding Mais Rápido
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reduza o tempo de integração em até 50% com processos
                automatizados e informações centralizadas em um só lugar
              </p>
            </div>

            <div className="group text-center">
              <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] p-6 text-white shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                <Sparkles className="h-12 w-12" />
              </div>
              <h3 className="mb-3 font-bold text-2xl text-gray-900">
                Experiência Personalizada
              </h3>
              <p className="text-gray-600 leading-relaxed">
                IA adapta o conteúdo e orientações baseado no cargo e perfil de
                cada novo funcionário automaticamente
              </p>
            </div>

            <div className="group text-center">
              <div className="mb-6 inline-flex rounded-3xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] p-6 text-white shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                <TrendingUp className="h-12 w-12" />
              </div>
              <h3 className="mb-3 font-bold text-2xl text-gray-900">
                Maior Engajamento
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Aumente em 4x o engajamento dos novos colaboradores com uma
                experiência moderna e interativa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5B9AAD] via-[#3A7A8A] to-[#1E3A4C] py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="mb-6 text-balance font-bold text-3xl md:text-5xl">
              Pronto para revolucionar sua empresa?
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed opacity-90 md:text-xl">
              Junte-se às empresas que já estão oferecendo uma experiência de
              integração excepcional para seus novos colaboradores com
              tecnologia de ponta.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button
                  className="h-12 w-full bg-white px-8 font-semibold text-[#1E3A4C] text-base shadow-xl hover:bg-gray-100 sm:w-auto"
                  size="lg"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/onboarding-chat">
                <Button
                  className="h-12 w-full border-2 border-white bg-transparent px-8 font-semibold text-base text-white hover:bg-white/10 sm:w-auto"
                  size="lg"
                  variant="outline"
                >
                  Explorar Plataforma
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-gray-200 border-t bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <Image
                alt="Altos AI Logo"
                className="h-9 w-auto"
                height={36}
                src="/images/altos-logo-horizontal.png"
                width={120}
              />
              <span className="text-gray-600 text-sm">
                © 2025 Altos AI. Todos os direitos reservados.
              </span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link
                className="font-medium text-gray-600 transition-colors hover:text-[#5B9AAD]"
                href="/onboarding-chat"
              >
                Plataforma
              </Link>
              <Link
                className="font-medium text-gray-600 transition-colors hover:text-[#5B9AAD]"
                href="/auth/login"
              >
                Login
              </Link>
              <a
                className="font-medium text-gray-600 transition-colors hover:text-[#5B9AAD]"
                href="#funcionalidades"
              >
                Funcionalidades
              </a>
              <a
                className="font-medium text-gray-600 transition-colors hover:text-[#5B9AAD]"
                href="#beneficios"
              >
                Benefícios
              </a>
              <a
                className="font-medium text-gray-600 transition-colors hover:text-[#5B9AAD]"
                href="#demo"
              >
                Veja em Ação
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
