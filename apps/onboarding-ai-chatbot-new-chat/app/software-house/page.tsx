import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Code2,
  Cloud,
  Palette,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Rocket,
  Smartphone,
  Database,
  GitBranch,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Instagram,
  Sparkles,
  MessageSquare,
  BookOpen,
  ListChecks,
} from "lucide-react"
import { Sparkles as SparklesComponent } from "@/components/ui/sparkles"

export default function SoftwareHousePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <Link href="/software-house" className="flex items-center">
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
            <a href="#servicos" className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors">
              Serviços
            </a>
            <a href="#portfolio" className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors">
              Portfólio
            </a>
            <a href="#sobre" className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors">
              Sobre Nós
            </a>
            <a href="#contato" className="text-sm font-medium text-gray-600 hover:text-[#5B9AAD] transition-colors">
              Contato
            </a>
          </nav>
          <Link href="#contato">
            <Button className="bg-[#5B9AAD] hover:bg-[#4A8999] text-white">Fale Conosco</Button>
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
              <Rocket className="h-4 w-4 text-[#5B9AAD]" />
              Software House Brasileira
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
              Transformamos ideias em <span className="text-[#5B9AAD]">software de ponta</span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 text-pretty mb-10 leading-relaxed max-w-2xl mx-auto">
              Desenvolvimento sob medida com tecnologia de última geração para impulsionar seu negócio ao próximo nível
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#contato">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#5B9AAD] hover:bg-[#4A8999] text-white shadow-lg shadow-[#5B9AAD]/25 h-12 px-8 text-base font-semibold"
                >
                  Iniciar Projeto
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#portfolio">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#5B9AAD] text-[#5B9AAD] hover:bg-[#5B9AAD]/5 h-12 px-8 text-base font-semibold bg-transparent"
                >
                  Ver Portfólio
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#5B9AAD]/20 to-blue-400/20 rounded-3xl blur-2xl" />
            <div className="relative bg-gray-800 rounded-2xl p-3 shadow-2xl">
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
                  src="/images/screenshot-202025-12-03-20at-2011.png"
                  alt="Altos AI Platform Demo"
                  className="w-full h-full object-contain bg-gray-50"
                />
              </div>
              <div className="h-1 bg-gray-700 rounded-b-lg mt-2" />
            </div>
            <div className="relative h-3 bg-gray-300 rounded-b-xl mx-auto" style={{ width: "110%" }} />
            <div className="relative h-1 bg-gray-400 rounded-b-2xl mx-auto shadow-lg" style={{ width: "120%" }} />
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

      <section id="servicos" className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Nossos Serviços</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Soluções completas em tecnologia para transformar sua visão em realidade, com{" "}
              <span className="font-semibold text-[#5B9AAD]">+15 anos de experiência</span> com desenvolvimento e
              negócios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] flex items-center justify-center mb-4 group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300">
                  <Code2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Desenvolvimento Web & Mobile</h3>
                <p className="text-gray-600 mb-4">
                  Aplicações modernas e escaláveis com as melhores tecnologias do mercado.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">React</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">React Native</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Node.js</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] flex items-center justify-center mb-4 group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300">
                  <Rocket className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Plataformas SaaS</h3>
                <p className="text-gray-600 mb-4">
                  Criamos plataformas SaaS completas, escaláveis e prontas para monetização desde o primeiro dia.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Multi-tenant</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Assinaturas</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">API</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] flex items-center justify-center mb-4 group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300">
                  <GitBranch className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Venda de Código Fonte</h3>
                <p className="text-gray-600 mb-4">
                  Adquira sistemas prontos com código fonte completo para personalizar e escalar seu negócio
                  rapidamente.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">White-label</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Documentado</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Suporte</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] flex items-center justify-center mb-4 group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300">
                  <Cloud className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Soluções Cloud & DevOps</h3>
                <p className="text-gray-600 mb-4">
                  Infraestrutura escalável e processos automatizados para máxima eficiência.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">AWS</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Azure</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">CI/CD</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] flex items-center justify-center mb-4 group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300">
                  <Palette className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">UI/UX Design</h3>
                <p className="text-gray-600 mb-4">
                  Design centrado no usuário para experiências memoráveis e intuitivas.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Design System</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Prototipagem</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-[#5B9AAD]/10 text-[#5B9AAD] flex items-center justify-center mb-4 group-hover:bg-[#5B9AAD] group-hover:text-white transition-colors duration-300">
                  <Lightbulb className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Consultoria Tech</h3>
                <p className="text-gray-600 mb-4">Orientação estratégica para decisões tecnológicas assertivas.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Arquitetura</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">Performance</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Nosso Portfólio</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Projeto que gerou resultados reais para nossos clientes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl overflow-hidden group">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-[#5B9AAD] to-[#1E3A4C] overflow-hidden">
                  <img
                    src="/images/screenshot-202025-12-03-20at-2011.png"
                    alt="Plataforma de Onboarding"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                      Plataforma SaaS
                    </span>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B9AAD]/10 border border-[#5B9AAD]/20 text-[#1E3A4C] text-sm font-medium mb-4 w-fit">
                    <Sparkles className="h-4 w-4 text-[#5B9AAD]" />
                    Destaque
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Plataforma de Onboarding com IA</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Sistema completo de integração de novos colaboradores com assistente virtual inteligente, base de
                    conhecimento, chat em grupo, gestão de tarefas e acompanhamento de progresso em tempo real.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#5B9AAD]/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-[#5B9AAD]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Chat com IA</h4>
                        <p className="text-sm text-gray-600">Assistente virtual treinado para responder dúvidas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#5B9AAD]/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-[#5B9AAD]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Base de Conhecimento</h4>
                        <p className="text-sm text-gray-600">Documentação corporativa acessível via chat</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#5B9AAD]/10 flex items-center justify-center flex-shrink-0">
                        <ListChecks className="h-5 w-5 text-[#5B9AAD]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Primeiros Passos</h4>
                        <p className="text-sm text-gray-600">Checklist interativo com progresso em tempo real</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2 py-1 bg-[#5B9AAD]/10 text-[#5B9AAD] rounded text-xs font-medium">
                      Next.js
                    </span>
                    <span className="px-2 py-1 bg-[#5B9AAD]/10 text-[#5B9AAD] rounded text-xs font-medium">
                      Supabase
                    </span>
                    <span className="px-2 py-1 bg-[#5B9AAD]/10 text-[#5B9AAD] rounded text-xs font-medium">OpenAI</span>
                    <span className="px-2 py-1 bg-[#5B9AAD]/10 text-[#5B9AAD] rounded text-xs font-medium">
                      Tailwind
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm font-medium">50% redução no tempo de integração</span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Tecnologias que Dominamos</h2>
            <p className="text-lg text-gray-600">Stack moderna para soluções de alto desempenho</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 items-center opacity-70">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#3178C6]" fill="currentColor">
                  <path d="M16.405 5.501c-.115 0-.193.014-.274.033v.013h.014c.054.104.146.18.214.273.054.107.1.214.154.32l.014-.015c.094-.066.14-.172.14-.333-.04-.047-.046-.094-.08-.14-.04-.067-.126-.1-.18-.153zM5.77 18.695h-.927a50.854 50.854 0 0 0-.27-4.41h-.008l-1.41 4.41H2.45l-1.4-4.41h-.01a72.892 72.892 0 0 0-.195 4.41H0c.055-1.966.192-3.81.41-5.53h1.15l1.335 4.064h.008l1.347-4.063h1.095c.242 2.015.384 3.86.428 5.53zm4.017-4.08c-.378 2.045-.876 3.533-1.492 4.46-.482.716-1.01 1.073-1.583 1.073-.153 0-.34-.046-.566-.138v-.494c.11.017.24.026.386.026.268 0 .483-.075.647-.222.197-.18.295-.382.295-.605 0-.155-.077-.47-.23-.944L6.23 14.615h.91l.727 2.36c.164.536.233.91.205 1.123.4-1.064.678-2.227.835-3.483zm12.325 4.08h-2.63v-5.53h.885v4.85h1.745zm-3.32.135l-1.016-.5c.09-.076.177-.158.255-.25.433-.506.648-1.258.648-2.253 0-1.83-.718-2.746-2.155-2.746-.704 0-1.254.232-1.65.697-.43.508-.646 1.256-.646 2.245 0 .972.19 1.686.574 2.14.35.41.822.616 1.42.616.24 0 .47-.044.688-.126l1.333.776.55-.6zm-2.504-1.02c-.24-.472-.36-1.074-.36-1.805 0-1.162.31-1.742.932-1.742.323 0 .57.16.744.478.212.378.318.984.318 1.815 0 1.136-.31 1.704-.93 1.704-.314 0-.56-.15-.704-.45z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">TypeScript</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#F7DF1E]" fill="currentColor">
                  <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.635l-4.4-3.27 5.346-4.686z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">JavaScript</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Code2 className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-sm text-gray-600">React</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#DD0031]" fill="currentColor">
                  <path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638a.186.186 0 0 0-.186-.185V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.185.185 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.084.185.186.186m-2.92 0h2.12a.185.185 0 0 0 .184-.185V6.29a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Angular</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Smartphone className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-sm text-gray-600">React Native</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Database className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-sm text-gray-600">PostgreSQL</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Cloud className="h-7 w-7 text-[#FF9900]" />
              </div>
              <span className="text-sm text-gray-600">AWS</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#4285F4]" fill="currentColor">
                  <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0-3.875 2.551-3.922 8.11-.247 10.941l.006-.007-.007.03a6.717 6.717 0 0 0 4.077 1.356h5.173l.03.03h5.192c6.687.053 9.376-8.605 3.835-12.35a9.365 9.365 0 0 0-8.825-6.893zM8.073 19.673a4.755 4.755 0 0 1-4.071-1.236c-2.584-2.472-2.046-6.899 1.103-8.72.053-.034.104-.07.153-.104l.045-.03a9.136 9.136 0 0 1 .793-.488 8.807 8.807 0 0 0-.123 1.46c0 4.925 3.994 8.918 8.918 8.918h.18a6.696 6.696 0 0 1-4.999.2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">GCP</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#0078D4]" fill="currentColor">
                  <path d="M22.379 23.343a1.62 1.62 0 0 0 1.536-2.14v.002L17.35 1.76A1.62 1.62 0 0 0 15.816.657H8.184A1.62 1.62 0 0 0 6.65 1.76L.083 21.204a1.62 1.62 0 0 0 1.536 2.139h4.741a1.62 1.62 0 0 0 1.535-1.103l.977-2.892 4.947 3.675c.28.208.618.32.966.32zm-3.873-7.635l-4.4-3.27 5.346-4.686z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Azure</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#2496ED]" fill="currentColor">
                  <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.185.185 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.084.185.186.186m-2.92 0h2.12a.185.185 0 0 0 .184-.185V6.29a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.186.186 0 0 0 .185-.185V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.084.185.185.185m-2.92 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 0 0-.75.748 11.376 11.376 0 0 0 .692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 0 0 3.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Docker</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <GitBranch className="h-7 w-7 text-gray-700" />
              </div>
              <span className="text-sm text-gray-600">Git</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Sobre a Altos AI</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Somos uma software house brasileira especializada em desenvolvimento de soluções digitais inovadoras.
                Nossa missão é transformar ideias em produtos que geram valor real para nossos clientes.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Com uma equipe multidisciplinar de desenvolvedores, designers e especialistas em negócios, entregamos
                projetos que combinam excelência técnica com visão estratégica.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#5B9AAD]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">+</div>
                    <div className="text-sm text-gray-600">Clientes atendidos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#5B9AAD]/10 flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-[#5B9AAD]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">+</div>
                    <div className="text-sm text-gray-600">Projetos entregues</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#5B9AAD]/20 to-blue-400/20 rounded-3xl blur-2xl" />
              <img
                src="/modern-tech-team-working-together-in-office-with-c.jpg"
                alt="Equipe Altos AI"
                className="relative rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">O Que Nossos Clientes Dizem</h2>
            <p className="text-lg text-gray-600">Feedback de quem confia em nosso trabalho</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &quot;A Altos AI superou todas as expectativas. O projeto foi entregue no prazo e com qualidade
                  excepcional. Recomendo fortemente!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#5B9AAD]/20 flex items-center justify-center">
                    <span className="text-[#5B9AAD] font-bold">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Maria Rodrigues</div>
                    <div className="text-sm text-gray-600">CEO, TechStart</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &quot;Profissionais extremamente competentes e comprometidos. O app ficou incrível e nossos usuários
                  adoraram!&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#5B9AAD]/20 flex items-center justify-center">
                    <span className="text-[#5B9AAD] font-bold">JS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">João Silva</div>
                    <div className="text-sm text-gray-600">CTO, DeliveryMax</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  &quot;Parceria de longo prazo. A Altos AI entende nossas necessidades e sempre entrega soluções
                  inovadoras.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#5B9AAD]/20 flex items-center justify-center">
                    <span className="text-[#5B9AAD] font-bold">AC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ana Costa</div>
                    <div className="text-sm text-gray-600">Diretora, IndustriaTech</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 bg-gradient-to-br from-[#1E3A4C] to-[#5B9AAD]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Vamos Conversar?</h2>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Tem um projeto em mente? Entre em contato conosco e vamos transformar sua ideia em realidade.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-200">Email</div>
                    <div className="font-medium">contato@altosai.com.br</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-200">Telefone</div>
                    <div className="font-medium">+55 (11) 99999-9999</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-200">Localização</div>
                    <div className="font-medium">Santa Catarina, Brasil</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Github className="h-5 w-5 text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Instagram className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>

            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Envie sua Mensagem</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" placeholder="Nome da empresa" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea id="message" placeholder="Conte-nos sobre seu projeto..." rows={4} />
                  </div>
                  <Button className="w-full bg-[#5B9AAD] hover:bg-[#4A8999] text-white">
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
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <Image
                src="/images/altos-logo-horizontal.png"
                alt="Altos AI"
                width={150}
                height={50}
                className="h-8 w-auto brightness-0 invert opacity-80"
              />
            </div>
            <div className="text-sm text-center md:text-left">
              © {new Date().getFullYear()} Altos AI. Todos os direitos reservados.
            </div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Termos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
