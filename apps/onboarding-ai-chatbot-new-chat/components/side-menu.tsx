"use client";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileText,
  Kanban,
  KeyRound,
  ListChecks,
  LogOut,
  Mail,
  Map,
  Menu,
  MessageSquare,
  Mic,
  PlayCircle,
  Settings,
  ShoppingCart,
  Trophy,
  User,
  UserMinus,
  Users,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUserScore, type GamificationSummary } from "@/lib/gamification";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
];

export function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [gamificationData, setGamificationData] =
    useState<GamificationSummary | null>(null);
  const [previousAchievementCount, setPreviousAchievementCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"email" | "password">("email");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      menuSections.forEach((section) => {
        initial[section.title] = section.defaultOpen;
      });
      return initial;
    }
  );

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setUser(null);
        } else if (authUser) {
          setUser({
            email: authUser.email || "",
            name:
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "Usuário",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadGamification = async () => {
      try {
        const data = await fetchUserScore();
        setGamificationData(data);

        if (
          previousAchievementCount > 0 &&
          data.achievements_earned > previousAchievementCount
        ) {
          const newAchievements = data.recent_achievements.slice(
            0,
            data.achievements_earned - previousAchievementCount
          );

          newAchievements.forEach((achievement) => {
            toast.success("🎉 Nova Conquista!", {
              description: `${achievement.icon} ${achievement.name} - +${achievement.points} pontos`,
              duration: 5000,
            });
          });
        }

        setPreviousAchievementCount(data.achievements_earned);
      } catch (error) {
        console.error("Failed to load gamification data:", error);
      }
    };

    loadGamification();

    const interval = setInterval(loadGamification, 30_000);
    return () => clearInterval(interval);
  }, [user, previousAchievementCount]);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("[v0] Error logging out:", error);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsUpdating(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        toast.error("Erro ao atualizar email", { description: error.message });
      } else {
        toast.success("Email de confirmação enviado", {
          description:
            "Verifique sua caixa de entrada para confirmar a mudança",
        });
        setNewEmail("");
        setIsSettingsOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao atualizar email");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!(newPassword && confirmPassword)) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsUpdating(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error("Erro ao atualizar senha", { description: error.message });
      } else {
        toast.success("Senha atualizada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsSettingsOpen(false);
      }
    } catch (error) {
      toast.error("Erro ao atualizar senha");
    } finally {
      setIsUpdating(false);
    }
  };

  const getUserInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <Button
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        size="icon"
        variant="ghost"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex w-64 max-w-full flex-col overflow-hidden border-border border-r bg-card",
          "fixed inset-y-0 left-0 z-40 transition-transform duration-300 md:static",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center gap-4 border-border border-b p-6">
          <Link
            className="block flex-shrink-0 transition-opacity hover:opacity-80"
            href="/product"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              alt="Altos AI Logo"
              className="h-5 w-auto object-contain"
              src="/images/altos-logo-horizontal.png"
            />
          </Link>
          <Link
            className="block flex-shrink-0 transition-opacity hover:opacity-80"
            href="/onboarding-chat"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              alt="Farben Logo"
              className="h-10 w-auto"
              src="/images/design-mode/download.png"
            />
          </Link>
        </div>

        <ScrollArea className="flex-1 overflow-x-hidden" orientation="vertical">
          <nav className="space-y-4 p-4">
            {menuSections.map((section) => (
              <Collapsible
                key={section.title}
                onOpenChange={() => toggleSection(section.title)}
                open={openSections[section.title]}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2",
                      "font-semibold text-muted-foreground text-sm hover:bg-accent/50 hover:text-foreground",
                      "transition-colors"
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
                <CollapsibleContent className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        className={cn(
                          "flex items-start gap-3 overflow-hidden rounded-lg px-4 py-3 transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive &&
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                        href={item.href}
                        key={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="line-clamp-2 break-words font-medium text-sm">
                            {item.label}
                          </div>
                          <div
                            className={cn(
                              "mt-0.5 line-clamp-2 break-words text-xs",
                              isActive
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </nav>
        </ScrollArea>

        <div className="border-border border-t p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="h-auto w-full justify-start gap-3 px-3 py-2 hover:bg-accent"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="ghost"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getUserInitials(user.name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate font-medium text-sm">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1 truncate text-muted-foreground text-xs">
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
                <div className="space-y-1.5 px-2 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span
                      className="truncate font-medium text-muted-foreground"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                  </div>
                  {gamificationData && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                      <span className="font-medium">
                        {gamificationData.total_points} pontos
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSettingsTab("email");
                    setIsSettingsOpen(true);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Alterar Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSettingsTab("password");
                    setIsSettingsOpen(true);
                  }}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Alterar Senha
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/gamificacao">
                    <Trophy className="mr-2 h-4 w-4" />
                    Conquistas e Pontos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="cursor-pointer" href="/admin">
                    <User className="mr-2 h-4 w-4" />
                    Área Administrativa
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              className="text-muted-foreground text-xs transition-colors hover:text-foreground"
              href="/auth/login"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Fazer Login →
            </Link>
          )}
        </div>
      </aside>

      <Dialog onOpenChange={setIsSettingsOpen} open={isSettingsOpen}>
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
              className="flex-1"
              onClick={() => setSettingsTab("email")}
              size="sm"
              variant={settingsTab === "email" ? "default" : "ghost"}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button
              className="flex-1"
              onClick={() => setSettingsTab("password")}
              size="sm"
              variant={settingsTab === "password" ? "default" : "ghost"}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Senha
            </Button>
          </div>

          {settingsTab === "email" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Email Atual</Label>
                <Input
                  className="bg-muted"
                  disabled
                  id="current-email"
                  value={user?.email || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">Novo Email</Label>
                <Input
                  id="new-email"
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="seu.novo@email.com"
                  type="email"
                  value={newEmail}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={newPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              disabled={isUpdating}
              onClick={
                settingsTab === "email"
                  ? handleUpdateEmail
                  : handleUpdatePassword
              }
            >
              {isUpdating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
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
  );
}
