"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  MessageSquare,
  Users,
  BookOpen,
  X,
  Menu,
  ListChecks,
  LogOut,
  User,
  Calendar,
  Kanban,
  ShoppingCart,
  Trophy,
  Video,
  UserMinus,
  Settings,
  Mail,
  KeyRound,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Briefcase,
  Mic,
  Map,
  BarChart3,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { fetchUserScore, type GamificationSummary } from "@/lib/gamification"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuSections = [
  {
    title: "Dashboard",
    defaultOpen: true,
    items: [
      {
        href: "/indicadores",
        label: "Indicadores Administrativos",
        icon: BarChart3,
        description: "Dashboard de métricas de RH com IA",
      },
    ],
  },
  {
    title: "Preboarding",
    defaultOpen: true,
    items: [
      {
        href: "/preboarding",
        label: "Gestão de Candidatos",
        icon: Users,
        description: "CRM para gerenciar candidatos",
      },
      {
        href: "/cargos",
        label: "Gestão de Cargos",
        icon: Briefcase,
        description: "Cadastro de cargos da empresa",
      },
      {
        href: "/gestao-curriculos",
        label: "Gestão de Currículos",
        icon: FileText,
        description: "Landing pages de carreiras",
      },
    ],
  },
  {
    title: "Onboarding",
    defaultOpen: true,
    items: [
      {
        href: "/primeiro-passos",
        label: "Primeiros Passos",
        icon: ListChecks,
        description: "Lista de integração para novos funcionários",
      },
      {
        href: "/onboarding-chat",
        label: "Integração",
        icon: BookOpen,
        description: "Chat de integração para novos funcionários",
      },
      {
        href: "/tutoriais",
        label: "Vídeos Tutoriais",
        icon: Video,
        description: "Veja vídeos da empresa",
      },
    ],
  },
  {
    title: "Routine",
    defaultOpen: true,
    items: [
      {
        href: "/knowledge-chat",
        label: "Base de Conhecimento",
        icon: MessageSquare,
        description: "Minhas conversas com IA sobre a empresa",
      },
      {
        href: "/group-chat",
        label: "Chat em Grupo",
        icon: Users,
        description: "Converse com todos os funcionários",
      },
      {
        href: "/calendar",
        label: "Calendário",
        icon: Calendar,
        description: "Gerencie seus eventos e compromissos",
      },
      {
        href: "/kanban",
        label: "Kanban",
        icon: Kanban,
        description: "Gerencie tarefas em colunas",
      },
      {
        href: "/reunioes",
        label: "Atas de Reunião",
        icon: Mic,
        description: "Transcreva e gerencie reuniões presenciais",
      },
      {
        href: "/mapas-mentais",
        label: "Mapas Mentais",
        icon: Map,
        description: "Visualize fluxos de trabalho da empresa",
      },
    ],
  },
  {
    title: "Offboarding",
    defaultOpen: false,
    items: [
      {
        href: "/offboarding",
        label: "Desligamento",
        icon: UserMinus,
        description: "Processo de desligamento de funcionários",
      },
      {
        href: "/videos-encerramento",
        label: "Vídeos de Encerramento",
        icon: PlayCircle,
        description: "Vídeos do processo de desligamento",
      },
    ],
  },
  {
    title: "Business",
    defaultOpen: true,
    items: [
      {
        href: "/vendas",
        label: "Vendas",
        icon: ShoppingCart,
        description: "Crie pedidos de venda com IA",
      },
    ],
  },
]

export function SideMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gamificationData, setGamificationData] = useState<GamificationSummary | null>(null)
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<"email" | "password">("email")
  const [newEmail, setNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    menuSections.forEach((section) => {
      initial[section.title] = section.defaultOpen
    })
    return initial
  })

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          setUser(null)
        } else if (authUser) {
          setUser({
            email: authUser.email || "",
            name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Usuário",
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const loadGamification = async () => {
      try {
        const data = await fetchUserScore()
        setGamificationData(data)

        if (previousAchievementCount > 0 && data.achievements_earned > previousAchievementCount) {
          const newAchievements = data.recent_achievements.slice(0, data.achievements_earned - previousAchievementCount)

          newAchievements.forEach((achievement) => {
            toast.success(`🎉 Nova Conquista!`, {
              description: `${achievement.icon} ${achievement.name} - +${achievement.points} pontos`,
              duration: 5000,
            })
          })
        }

        setPreviousAchievementCount(data.achievements_earned)
      } catch (error) {
        console.error("Failed to load gamification data:", error)
      }
    }

    loadGamification()

    const interval = setInterval(loadGamification, 30000)
    return () => clearInterval(interval)
  }, [user, previousAchievementCount])

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("[v0] Error logging out:", error)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error("Por favor, insira um email válido")
      return
    }

    setIsUpdating(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.updateUser({ email: newEmail })

      if (error) {
        toast.error("Erro ao atualizar email", { description: error.message })
      } else {
        toast.success("Email de confirmação enviado", {
          description: "Verifique sua caixa de entrada para confirmar a mudança",
        })
        setNewEmail("")
        setIsSettingsOpen(false)
      }
    } catch (error) {
      toast.error("Erro ao atualizar email")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsUpdating(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        toast.error("Erro ao atualizar senha", { description: error.message })
      } else {
        toast.success("Senha atualizada com sucesso!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setIsSettingsOpen(false)
      }
    } catch (error) {
      toast.error("Erro ao atualizar senha")
    } finally {
      setIsUpdating(false)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          "w-64 max-w-full border-r border-border bg-card flex flex-col overflow-hidden",
          "fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-6 border-b border-border flex items-center gap-4">
          <Link
            href="/product"
            className="block hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img src="/images/altos-logo-horizontal.png" alt="Altos AI Logo" className="h-5 w-auto object-contain" />
          </Link>
          <Link
            href="/onboarding-chat"
            className="block hover:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img src="/images/design-mode/download.png" alt="Farben Logo" className="h-10 w-auto" />
          </Link>
        </div>

        <ScrollArea className="flex-1 overflow-x-hidden" orientation="vertical">
          <nav className="p-4 space-y-4">
            {menuSections.map((section) => (
              <Collapsible
                key={section.title}
                open={openSections[section.title]}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-md",
                      "text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      "transition-colors",
                    )}
                  >
                    <span>{section.title}</span>
                    {openSections[section.title] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 rounded-lg transition-colors overflow-hidden",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                        )}
                      >
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-medium text-sm line-clamp-2 break-words">{item.label}</div>
                          <div
                            className={cn(
                              "text-xs mt-0.5 line-clamp-2 break-words",
                              isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 h-auto hover:bg-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      {gamificationData ? (
                        <>
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span>{gamificationData.total_points} pts</span>
                        </>
                      ) : (
                        user.email
                      )}
                    </div>
                  </div>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Dados Pessoais</DropdownMenuLabel>
                <div className="px-2 py-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate text-muted-foreground" title={user.email}>
                      {user.email}
                    </span>
                  </div>
                  {gamificationData && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      <span className="font-medium">{gamificationData.total_points} pontos</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setSettingsTab("email")
                    setIsSettingsOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Alterar Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSettingsTab("password")
                    setIsSettingsOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Alterar Senha
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/gamificacao" className="cursor-pointer">
                    <Trophy className="mr-2 h-4 w-4" />
                    Conquistas e Pontos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Área Administrativa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fazer Login →
            </Link>
          )}
        </div>
      </aside>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {settingsTab === "email" ? (
                <>
                  <Mail className="h-5 w-5" />
                  Alterar Email
                </>
              ) : (
                <>
                  <KeyRound className="h-5 w-5" />
                  Alterar Senha
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {settingsTab === "email"
                ? "Insira seu novo endereço de email. Um email de confirmação será enviado."
                : "Insira sua nova senha. A senha deve ter pelo menos 6 caracteres."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={settingsTab === "email" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSettingsTab("email")}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button
              variant={settingsTab === "password" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSettingsTab("password")}
              className="flex-1"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Senha
            </Button>
          </div>

          {settingsTab === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Email Atual</Label>
                <Input id="current-email" value={user?.email || ""} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Novo Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="seu.novo@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={settingsTab === "email" ? handleUpdateEmail : handleUpdatePassword} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
