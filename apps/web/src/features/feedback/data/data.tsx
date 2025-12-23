import {
  AlertTriangle,
  CheckCircle,
  Circle,
  Eye,
  Loader2,
  XCircle,
} from "lucide-react";

export const statusOptions = [
  { label: "Aberto", value: "open", icon: Circle, color: "bg-blue-500" },
  {
    label: "Em Andamento",
    value: "in_progress",
    icon: Loader2,
    color: "bg-yellow-500",
  },
  {
    label: "Em Revisao",
    value: "under_review",
    icon: Eye,
    color: "bg-purple-500",
  },
  {
    label: "Resolvido",
    value: "resolved",
    icon: CheckCircle,
    color: "bg-green-500",
  },
  {
    label: "Fechado",
    value: "closed",
    icon: CheckCircle,
    color: "bg-gray-500",
  },
  { label: "Rejeitado", value: "rejected", icon: XCircle, color: "bg-red-500" },
];

export const priorityOptions = [
  { label: "Baixa", value: "low", icon: Circle, color: "bg-gray-400" },
  { label: "Media", value: "medium", icon: Circle, color: "bg-blue-400" },
  { label: "Alta", value: "high", icon: AlertTriangle, color: "bg-yellow-500" },
  {
    label: "Urgente",
    value: "urgent",
    icon: AlertTriangle,
    color: "bg-orange-500",
  },
  {
    label: "Critica",
    value: "critical",
    icon: AlertTriangle,
    color: "bg-red-600",
  },
];

export const sourceOptions = [
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "Telefone", value: "phone" },
  { label: "Email", value: "email" },
  { label: "Presencial", value: "in_person" },
  { label: "Redes Sociais", value: "social_media" },
];

export function getStatusOption(value: string) {
  return statusOptions.find((s) => s.value === value);
}

export function getPriorityOption(value: string) {
  return priorityOptions.find((p) => p.value === value);
}

export function getSourceOption(value: string) {
  return sourceOptions.find((s) => s.value === value);
}
