import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MessageSquare,
  Users,
  BookOpen,
  ListChecks,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react"
import Image from "next/image"
import { Sparkles as SparklesComponent } from "@/components/ui/sparkles"

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/altos-logo-horizontal.png"
              alt="Altos AI"
              width={180}
              height={60}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#funcionalidades"
              className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors"
            >
              Funcionalidades
            </a>
            <a href="#beneficios" className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors">
              Benefícios
            </a>
            <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors">
              Veja em Ação
            </a>
          </nav>
          <Link href="/auth/login">
            <Button variant="outline" className="border-[#5B9AAD] text-[#5B9AAD] hover:bg-[#5B9AAD]/10 bg-transparent">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#5B9AAD]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-24 md:py-32 max-w-6xl relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1E3A4C] text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 text-[#5B9AAD]" />
              Integração Inteligente com IA
            </div>

            <div className="mb-10 flex justify-center">
              <SparklesComponent
                className="relative inline-block"
                particleColor="#5B9AAD"
                particleDensity={120}
                speed={0.5}
                particleSize={1.4}
              >
                <Image
                  src="/images/altos-logo-horizontal.png"
                  alt="Altos AI"
                  width={400}
                  height={120}
                  className="w-full max-w-sm h-auto"
                  priority
                />
              </SparklesComponent>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 text-balance leading-tight">
              Do primeiro dia ao último: Gerencie toda a jornada do colaborador com IA
            </h1>

            <p className="text-base md:text-lg text-gray-600 text-pretty mb-10 leading-relaxed max-w-2xl mx-auto">
              Plataforma completa para acelerar e personalizar a integração de novos colaboradores, conectando-os à
              cultura e conhecimento da sua empresa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#5B9AAD] hover:bg-[#4A8999] text-white shadow-lg shadow-[#5B9AAD]/25 h-12 px-8 text-base font-semibold"
                >
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/onboarding-chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#5B9AAD] text-[#5B9AAD] hover:bg-[#5B9AAD]/5 h-12 px-8 text-base font-semibold bg-transparent"
                >
                  Ver Demonstração
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#5B9AAD] mb-2">50%</div>
              <div className="text-sm md:text-base text-gray-600">Redução no tempo de integração</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#5B9AAD] mb-2">24/7</div>
              <div className="text-sm md:text-base text-gray-600">Suporte com IA disponível</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#5B9AAD] mb-2">100%</div>
              <div className="text-sm md:text-base text-gray-600">Personalizado por cargo</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#5B9AAD] mb-2">4x</div>
              <div className="text-sm md:text-base text-gray-600">Mais engajamento</div>
            </div>
          </div>
        </div>
      </section>

      {/* New Product Demo Section */}
      <section id="demo" className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Feature descriptions */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B9AAD]/10 border border-[#5B9AAD]/20 text-[#1E3A4C] text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4 text-[#5B9AAD]" />
                  Veja em Ação
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-balance">
                  Experiência completa do início ao fim da jornada do colaborador
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Do recrutamento ao desligamento: uma plataforma única que cobre preboarding, onboarding, rotina diária
                  e offboarding com inteligência artificial.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Preboarding Inteligente</h3>
                    <p className="text-gray-600 leading-relaxed">
                      CRM completo para gestão de candidatos com geração automática de perguntas de entrevista por IA,
                      tanto para hard skills quanto soft skills, personalizadas para cada cargo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Assistente IA 24/7</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Chat inteligente treinado com a base de conhecimento da empresa, respondendo dúvidas sobre
                      processos, políticas e cultura organizacional instantaneamente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Atas de Reunião com Transcrição</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Agende reuniões recorrentes com integração ao calendário e transcreva conversas em tempo real
                      usando reconhecimento de voz, mantendo registro completo das decisões.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Gamificação e Kanban</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Múltiplos quadros Kanban para gestão de tarefas, sistema de pontuação e conquistas para engajar
                      colaboradores durante toda a jornada na empresa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                      <ListChecks className="h-6 w-6 text-[#5B9AAD]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Offboarding Estruturado</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Processo completo de desligamento com checklist de tarefas, entrevista de saída, transferência de
                      conhecimento e documentação para garantir transições suaves.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Notebook mockup with video */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#5B9AAD]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />

              {/* Notebook mockup */}
              <div className="relative z-10">
                <div className="relative bg-gray-800 rounded-2xl p-3 shadow-2xl">
                  {/* Notebook top bar */}
                  <div className="bg-gray-700 rounded-t-lg px-4 py-2 flex items-center gap-2 mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-600 rounded text-gray-300 text-xs font-medium">
                        <Sparkles className="h-3 w-3" />
                        Altos AI Platform
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-white rounded-lg overflow-hidden aspect-video">
                    <img
                      src="/images/altos-primeiros-passos-demo.jpeg"
                      alt="Altos AI Platform - Primeiros Passos"
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </div>

                  {/* Notebook bottom */}
                  <div className="h-1 bg-gray-700 rounded-b-lg mt-2" />
                </div>

                {/* Keyboard base */}
                <div className="relative h-3 bg-gray-300 rounded-b-xl mx-auto" style={{ width: "110%" }} />
                <div className="relative h-1 bg-gray-400 rounded-b-2xl mx-auto shadow-lg" style={{ width: "120%" }} />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">95%</div>
                    <div className="text-xs text-gray-600">Taxa de Conclusão</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Funcionalidades que fazem a diferença</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Plataforma completa para gestão do ciclo de vida do colaborador, do recrutamento ao desligamento
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Feature 1 - Preboarding */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300 w-fit mb-4">
                  <Users className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Preboarding Inteligente</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  CRM completo para gestão de candidatos com geração automática de perguntas de entrevista por IA.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Perguntas hard skills e soft skills</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Agendamento de entrevistas</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Pipeline de candidatos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 2 - Chat IA */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300 w-fit mb-4">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Chat de Integração com IA</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Assistente virtual inteligente que guia novos colaboradores durante todo o processo de onboarding.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Respostas contextualizadas por cargo</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Histórico de conversas salvo</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Disponível 24/7</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 3 - Base de Conhecimento */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300 w-fit mb-4">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Base de Conhecimento</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Chat com IA treinada sobre políticas, processos e cultura da empresa para respostas instantâneas.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Upload de documentos</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Busca semântica inteligente</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Respostas baseadas em contexto</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 4 - Atas de Reunião */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300 w-fit mb-4">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Atas de Reunião</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Agende reuniões recorrentes e transcreva conversas em tempo real com reconhecimento de voz.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Transcrição por voz em tempo real</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Reuniões recorrentes</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Integração com calendário</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 5 - Kanban e Gamificação */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300 w-fit mb-4">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Kanban e Gamificação</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Múltiplos quadros Kanban com sistema de pontuação e conquistas para engajar colaboradores.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Múltiplos quadros por usuário</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Sistema de pontos e níveis</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Conquistas e recompensas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Feature 6 - Offboarding */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="p-4 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300 w-fit mb-4">
                  <ListChecks className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Offboarding Estruturado</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Processo completo de desligamento com checklist, entrevista de saída e transferência de conhecimento.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Checklist de desligamento</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Entrevista de saída</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-[#5B9AAD] flex-shrink-0" />
                    <span>Documentação automática</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Por que escolher nossa plataforma?</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Benefícios comprovados que transformam a experiência de integração
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] text-white mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Clock className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Onboarding Mais Rápido</h3>
              <p className="text-gray-600 leading-relaxed">
                Reduza o tempo de integração em até 50% com processos automatizados e informações centralizadas em um só
                lugar
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] text-white mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Sparkles className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Experiência Personalizada</h3>
              <p className="text-gray-600 leading-relaxed">
                IA adapta o conteúdo e orientações baseado no cargo e perfil de cada novo funcionário automaticamente
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] text-white mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Maior Engajamento</h3>
              <p className="text-gray-600 leading-relaxed">
                Aumente em 4x o engajamento dos novos colaboradores com uma experiência moderna e interativa
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#5B9AAD] via-[#3A7A8A] to-[#1E3A4C] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">Pronto para revolucionar sua empresa?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
              Junte-se às empresas que já estão oferecendo uma experiência de integração excepcional para seus novos
              colaboradores com tecnologia de ponta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-[#1E3A4C] hover:bg-gray-100 shadow-xl h-12 px-8 text-base font-semibold"
                >
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/onboarding-chat">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 h-12 px-8 text-base font-semibold"
                >
                  Explorar Plataforma
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Image
                src="/images/altos-logo-horizontal.png"
                alt="Altos AI Logo"
                width={120}
                height={36}
                className="h-9 w-auto"
              />
              <span className="text-sm text-gray-600">© 2025 Altos AI. Todos os direitos reservados.</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link
                href="/onboarding-chat"
                className="text-gray-600 hover:text-[#5B9AAD] transition-colors font-medium"
              >
                Plataforma
              </Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-[#5B9AAD] transition-colors font-medium">
                Login
              </Link>
              <a href="#funcionalidades" className="text-gray-600 hover:text-[#5B9AAD] transition-colors font-medium">
                Funcionalidades
              </a>
              <a href="#beneficios" className="text-gray-600 hover:text-[#5B9AAD] transition-colors font-medium">
                Benefícios
              </a>
              <a href="#demo" className="text-gray-600 hover:text-[#5B9AAD] transition-colors font-medium">
                Veja em Ação
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
