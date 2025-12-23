import {
  AudioWaveform,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Command,
  FileText,
  FolderOpen,
  GalleryVerticalEnd,
  HelpCircle,
  Inbox,
  Kanban,
  LayoutDashboard,
  ListChecks,
  Map,
  MessageSquare,
  Mic,
  PlayCircle,
  Settings,
  ShoppingCart,
  Trophy,
  UserMinus,
  Users,
  Video,
} from "lucide-react";

import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Altos AI",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Indicadores",
          url: "/indicators",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Preboarding",
      items: [
        {
          title: "Candidatos",
          url: "/preboarding",
          icon: Users,
        },
        {
          title: "Cargos",
          url: "/cargos",
          icon: Briefcase,
        },
        {
          title: "Currículos",
          url: "/gestao-curriculos",
          icon: FileText,
        },
      ],
    },
    {
      title: "Onboarding",
      items: [
        {
          title: "Primeiros Passos",
          url: "/primeiro-passos",
          icon: ListChecks,
        },
        {
          title: "Gerenciar Passos",
          url: "/primeiro-passos/admin",
          icon: Settings,
        },
        {
          title: "Integração",
          url: "/onboarding-chat",
          icon: BookOpen,
        },
        {
          title: "Vídeos Tutoriais",
          url: "/tutoriais",
          icon: Video,
        },
      ],
    },
    {
      title: "Rotina",
      items: [
        {
          title: "Base de Conhecimento",
          url: "/knowledge-chat",
          icon: MessageSquare,
        },
        {
          title: "Chat em Grupo",
          url: "/group-chat",
          icon: Users,
        },
        {
          title: "Calendário",
          url: "/calendar",
          icon: Calendar,
        },
        {
          title: "Kanban",
          url: "/kanban/",
          icon: Kanban,
        },
        {
          title: "Atas de Reunião",
          url: "/reunioes",
          icon: Mic,
        },
        {
          title: "Mapas Mentais",
          url: "/mindmaps",
          icon: Map,
        },
      ],
    },
    {
      title: "Offboarding",
      items: [
        {
          title: "Desligamento",
          url: "/offboarding",
          icon: UserMinus,
        },
        {
          title: "Vídeos de Encerramento",
          url: "/videos-encerramento",
          icon: PlayCircle,
        },
      ],
    },
    {
      title: "Negócios",
      items: [
        {
          title: "Vendas",
          url: "/vendas",
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: "Gamificação",
      items: [
        {
          title: "Conquistas e Pontos",
          url: "/gamification",
          icon: Trophy,
        },
      ],
    },
    {
      title: "Ouvidoria",
      items: [
        {
          title: "Manifestações",
          url: "/feedback",
          icon: Inbox,
        },
        {
          title: "Dashboard",
          url: "/feedback/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Categorias",
          url: "/feedback/categories",
          icon: FolderOpen,
        },
        {
          title: "Secretarias",
          url: "/feedback/departments",
          icon: Building2,
        },
      ],
    },
    {
      title: "Outros",
      items: [
        {
          title: "Configurações",
          url: "/settings",
          icon: Settings,
        },
        {
          title: "Ajuda",
          url: "/help-center",
          icon: HelpCircle,
        },
      ],
    },
  ],
};
