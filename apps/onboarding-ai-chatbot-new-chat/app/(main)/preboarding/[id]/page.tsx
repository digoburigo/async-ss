"use client";

import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Building,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  File,
  FileArchive,
  FileImage,
  FileText,
  Lightbulb,
  LinkIcon,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Stage {
  id: string;
  name: string;
  color: string;
  order_index: number;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  stage_id: string;
  stage: Stage | null;
  source: string;
  resume_url: string;
  expected_salary: number;
  expected_start_date: string;
  notes: string;
  rating: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  candidate_id: string;
  activity_type: string;
  title: string;
  description: string;
  created_at: string;
}

interface Interview {
  id: string;
  candidate_id: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string;
  interviewer_name: string;
  interviewer_email: string;
  location: string;
  meeting_link: string;
  status: string;
  notes: string;
  feedback: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: string;
  candidate_id: string;
  question_type: "hard_skills" | "soft_skills";
  question: string;
  expected_answer: string | null;
  answer: string | null;
  rating: number | null;
  notes: string | null;
  order_index: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

// Add CandidateDocument interface
interface CandidateDocument {
  id: string;
  candidate_id: string;
  document_type: string;
  title: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  ai_analysis: string | null;
  adherence_score: number | null;
  analyzed_at: string | null;
  created_at: string;
}

const activityIcons: Record<string, React.ElementType> = {
  note: MessageSquare,
  stage_change: FileText,
  interview: Video,
  email: Mail,
  call: PhoneCall,
  document: FileText,
  other: Clock,
};

const interviewTypeLabels: Record<string, string> = {
  phone: "Telefone",
  video: "Vídeo",
  in_person: "Presencial",
  technical: "Técnica",
  hr: "RH",
  final: "Final",
};

const interviewStatusLabels: Record<string, string> = {
  scheduled: "Agendada",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não Compareceu",
};

const interviewStatusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-yellow-100 text-yellow-800",
};

function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string; // Use 'id' consistently

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<Partial<Candidate>>(
    {}
  );
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Question editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editingAnswer, setEditingAnswer] = useState("");
  const [editingRating, setEditingRating] = useState(0);
  const [editingNotes, setEditingNotes] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  // Interview scheduling state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    scheduled_at: "",
    duration_minutes: "60",
    interview_type: "video",
    interviewer_name: "",
    interviewer_email: "",
    location: "",
    meeting_link: "",
    notes: "",
    create_calendar_event: true,
  });

  // Interview feedback state
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(
    null
  );
  const [feedbackForm, setFeedbackForm] = useState({
    status: "completed",
    feedback: "",
    rating: 0,
  });

  // State for custom question form
  const [isAddCustomQuestionOpen, setIsAddCustomQuestionOpen] = useState(false);
  const [customQuestionForm, setCustomQuestionForm] = useState({
    question: "",
    question_type: "hard_skills" as "hard_skills" | "soft_skills",
    expected_answer: "",
  });
  const [isAddingCustomQuestion, setIsAddingCustomQuestion] = useState(false);
  const [questionTabType, setQuestionTabType] = useState<"ai" | "custom">("ai");
  const [questionSkillTab, setQuestionSkillTab] = useState<
    "hard_skills" | "soft_skills"
  >("hard_skills");

  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadDocumentType, setUploadDocumentType] = useState("resume");
  const [uploadDocumentTitle, setUploadDocumentTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzingDocumentId, setAnalyzingDocumentId] = useState<string | null>(
    null
  );
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  const [isRegenerateAllDialogOpen, setIsRegenerateAllDialogOpen] =
    useState(false);
  const [regeneratingQuestionId, setRegeneratingQuestionId] = useState<
    string | null
  >(null);

  // Use 'id' consistently for loading candidate data
  useEffect(() => {
    if (!(id && isValidUUID(id))) {
      router.replace("/preboarding");
      return;
    }
    loadData();
  }, [id, router]);

  const loadData = async () => {
    if (!isValidUUID(id)) {
      // Use 'id' here
      return;
    }

    setIsLoading(true);
    try {
      const [
        candidateRes,
        stagesRes,
        activitiesRes,
        interviewsRes,
        questionsRes,
      ] = await Promise.all([
        fetch(`/api/preboarding/candidates/${id}`), // Use 'id' here
        fetch("/api/preboarding/stages"),
        fetch(`/api/preboarding/activities?candidate_id=${id}`), // Use 'id' here
        fetch(`/api/preboarding/interviews?candidate_id=${id}`), // Use 'id' here
        fetch(`/api/preboarding/questions?candidate_id=${id}`), // Use 'id' here
      ]);

      if (candidateRes.ok) {
        const data = await candidateRes.json();
        setCandidate(data);
      }

      if (stagesRes.ok) {
        const data = await stagesRes.json();
        setStages(data);
      }

      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(data);
      }

      if (interviewsRes.ok) {
        const data = await interviewsRes.json();
        setInterviews(data);
      }

      if (questionsRes.ok) {
        const data = await questionsRes.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("[v0] Error loading data:", error);
      toast.error("Erro ao carregar dados do candidato");
    } finally {
      setIsLoading(false);
    }
  };

  // Renamed loadData to be more specific and added document loading
  const loadCandidate = async () => {
    if (!(id && isValidUUID(id))) {
      router.replace("/preboarding");
      return;
    }
    try {
      const res = await fetch(`/api/preboarding/candidates/${id}`);
      if (res.ok) {
        setCandidate(await res.json());
      } else {
        toast.error("Erro ao carregar dados do candidato");
        router.replace("/preboarding");
      }
    } catch (error) {
      console.error("Error loading candidate:", error);
      toast.error("Erro ao carregar dados do candidato");
      router.replace("/preboarding");
    }
  };

  const loadActivities = async () => {
    try {
      const res = await fetch(`/api/preboarding/activities?candidate_id=${id}`);
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      toast.error("Erro ao carregar atividades");
    }
  };

  const loadInterviews = async () => {
    try {
      const res = await fetch(`/api/preboarding/interviews?candidate_id=${id}`);
      if (res.ok) {
        setInterviews(await res.json());
      }
    } catch (error) {
      console.error("Error loading interviews:", error);
      toast.error("Erro ao carregar entrevistas");
    }
  };

  const loadQuestions = async () => {
    try {
      const res = await fetch(`/api/preboarding/questions?candidate_id=${id}`);
      if (res.ok) {
        setQuestions(await res.json());
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Erro ao carregar perguntas");
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(
        `/api/preboarding/documents?candidate_id=${id}`
      );
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  // Load all data on mount
  useEffect(() => {
    if (!(id && isValidUUID(id))) {
      router.replace("/preboarding");
      return;
    }
    loadCandidate();
    loadActivities();
    loadInterviews();
    loadQuestions();
    loadDocuments(); // Load documents
  }, [id, router]);

  const handleGenerateQuestions = async () => {
    if (!candidate) {
      toast.error("Candidato não encontrado");
      return;
    }

    setIsGeneratingQuestions(true);
    try {
      const res = await fetch("/api/preboarding/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          position: candidate.position,
          department: candidate.department,
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        let errorMessage = "Erro ao gerar perguntas";

        if (contentType?.includes("application/json")) {
          const error = await res.json();
          errorMessage = error.error || error.details || errorMessage;
        } else {
          // Got HTML or other non-JSON response
          const text = await res.text();
          console.error(
            "[v0] Non-JSON error response:",
            text.substring(0, 500)
          );
          errorMessage =
            "Erro no servidor. Verifique os logs para mais detalhes.";
        }

        toast.error(errorMessage);
        return;
      }

      if (!contentType?.includes("application/json")) {
        console.error("[v0] Expected JSON but got:", contentType);
        const text = await res.text();
        console.error("[v0] Response text:", text.substring(0, 500));
        toast.error("Resposta inválida do servidor");
        return;
      }

      const data = await res.json();

      if (data.success && data.questions) {
        setQuestions(data.questions);
        toast.success(
          `${data.questions.length} perguntas geradas com sucesso!`
        );
        await loadQuestions(); // Reload to ensure sync
      } else {
        toast.error("Resposta inesperada do servidor");
      }
    } catch (error) {
      console.error("[v0] Exception generating questions:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleStartEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditingAnswer(question.answer || "");
    setEditingRating(question.rating || 0);
    setEditingNotes(question.notes || "");
  };

  const handleSaveQuestion = async (questionId: string) => {
    try {
      const res = await fetch(`/api/preboarding/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: editingAnswer,
          rating: editingRating,
          notes: editingNotes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setQuestions((prev) =>
          prev.map((q) => (q.id === updated.id ? updated : q))
        );
        setEditingQuestionId(null);
        toast.success("Resposta salva!");
      }
    } catch (error) {
      toast.error("Erro ao salvar resposta");
    }
  };

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSaveCandidateInfo = async () => {
    if (!candidate) return;

    setIsSavingInfo(true);
    try {
      const res = await fetch(`/api/preboarding/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedCandidate),
      });

      if (res.ok) {
        const updated = await res.json();
        setCandidate(updated);
        setIsEditingInfo(false);
        setEditedCandidate({});
        toast.success("Informações atualizadas!");
      } else {
        toast.error("Erro ao atualizar informações");
      }
    } catch (error) {
      toast.error("Erro ao atualizar informações");
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleStartEditingInfo = () => {
    if (!candidate) return;
    setEditedCandidate({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      position: candidate.position,
      department: candidate.department,
      expected_salary: candidate.expected_salary,
      expected_start_date: candidate.expected_start_date,
      source: candidate.source,
      notes: candidate.notes,
    });
    setIsEditingInfo(true);
  };

  const handleCancelEditingInfo = () => {
    setIsEditingInfo(false);
    setEditedCandidate({});
  };

  const handleStageChange = async (newStageId: string) => {
    if (!candidate) return;

    try {
      const res = await fetch(`/api/preboarding/candidates/${id}`, {
        // Use 'id' here
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: newStageId }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCandidate(updated);
        loadData(); // Reloads all data, including stages
        toast.success("Etapa atualizada!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar etapa");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch("/api/preboarding/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: id, // Use 'id' here
          activity_type: "note",
          title: "Nova anotação",
          description: newNote,
        }),
      });

      if (res.ok) {
        const newActivity = await res.json();
        setActivities((prev) => [newActivity, ...prev]);
        setNewNote("");
        toast.success("Anotação adicionada!");
      }
    } catch (error) {
      toast.error("Erro ao adicionar anotação");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!(interviewForm.scheduled_at && interviewForm.interview_type)) {
      toast.error("Preencha a data e tipo da entrevista");
      return;
    }

    setIsScheduling(true);
    try {
      const res = await fetch("/api/preboarding/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: id, // Use 'id' here
          scheduled_at: interviewForm.scheduled_at,
          duration_minutes: Number.parseInt(interviewForm.duration_minutes),
          interview_type: interviewForm.interview_type,
          interviewer_name: interviewForm.interviewer_name,
          interviewer_email: interviewForm.interviewer_email,
          location: interviewForm.location,
          meeting_link: interviewForm.meeting_link,
          notes: interviewForm.notes,
          create_calendar_event: interviewForm.create_calendar_event,
        }),
      });

      if (res.ok) {
        const newInterview = await res.json();
        setInterviews((prev) => [...prev, newInterview]);
        setIsScheduleDialogOpen(false);
        setInterviewForm({
          scheduled_at: "",
          duration_minutes: "60",
          interview_type: "video",
          interviewer_name: "",
          interviewer_email: "",
          location: "",
          meeting_link: "",
          notes: "",
          create_calendar_event: true,
        });
        loadInterviews(); // Reload interviews
        toast.success("Entrevista agendada!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao agendar entrevista");
      }
    } catch (error) {
      toast.error("Erro ao agendar entrevista");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleOpenFeedback = (interview: Interview) => {
    setSelectedInterview(interview);
    setFeedbackForm({
      status: interview.status === "scheduled" ? "completed" : interview.status,
      feedback: interview.feedback || "",
      rating: interview.rating || 0,
    });
    setFeedbackDialogOpen(true);
  };

  const handleSaveFeedback = async () => {
    if (!selectedInterview) return;

    try {
      const res = await fetch(
        `/api/preboarding/interviews/${selectedInterview.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(feedbackForm),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setInterviews((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        setFeedbackDialogOpen(false);
        setSelectedInterview(null);
        loadInterviews(); // Reload interviews
        toast.success("Feedback salvo!");
      }
    } catch (error) {
      toast.error("Erro ao salvar feedback");
    }
  };

  const handleCancelInterview = async (interviewId: string) => {
    try {
      const res = await fetch(`/api/preboarding/interviews/${interviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        const updated = await res.json();
        setInterviews((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        loadInterviews(); // Reload interviews
        toast.success("Entrevista cancelada");
      }
    } catch (error) {
      toast.error("Erro ao cancelar entrevista");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/preboarding/candidates/${id}`, {
        // Use 'id' here
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Candidato removido!");
        router.push("/preboarding");
      }
    } catch (error) {
      toast.error("Erro ao remover candidato");
    }
  };

  const handleAddCustomQuestion = async () => {
    if (!customQuestionForm.question.trim()) {
      toast.error("Digite a pergunta");
      return;
    }

    setIsAddingCustomQuestion(true);
    try {
      const res = await fetch("/api/preboarding/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: id, // Use 'id' here
          question: customQuestionForm.question,
          question_type: customQuestionForm.question_type,
          expected_answer: customQuestionForm.expected_answer || null,
          is_ai_generated: false,
          order_index: questions.filter((q) => !q.is_ai_generated).length,
        }),
      });

      if (res.ok) {
        const newQuestion = await res.json();
        setQuestions((prev) => [...prev, newQuestion]);
        setCustomQuestionForm({
          question: "",
          question_type: "hard_skills",
          expected_answer: "",
        });
        setIsAddCustomQuestionOpen(false);
        toast.success("Pergunta adicionada!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao adicionar pergunta");
      }
    } catch (error) {
      toast.error("Erro ao adicionar pergunta");
    } finally {
      setIsAddingCustomQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const res = await fetch(`/api/preboarding/questions/${questionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        toast.success("Pergunta removida!");
      }
    } catch (error) {
      toast.error("Erro ao remover pergunta");
    }
  };

  const handleUploadDocument = async () => {
    if (!(selectedFile && uploadDocumentTitle)) {
      toast.error("Selecione um arquivo e preencha o título");
      return;
    }

    setIsUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("candidate_id", id); // Use 'id' here
      formData.append("document_type", uploadDocumentType);
      formData.append("title", uploadDocumentTitle);

      const response = await fetch("/api/preboarding/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload document");

      toast.success("Documento enviado com sucesso!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadDocumentTitle("");
      setUploadDocumentType("resume");
      loadDocuments(); // Reload documents
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erro ao enviar documento");
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/preboarding/documents/${documentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      toast.success("Documento excluído com sucesso!");
      loadDocuments(); // Reload documents
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao excluir documento");
    }
  };

  const handleAnalyzeDocument = async (documentId: string) => {
    setAnalyzingDocumentId(documentId);
    try {
      const response = await fetch(
        `/api/preboarding/documents/${documentId}/analyze`,
        {
          method: "POST",
        }
      );

      if (!response.ok) throw new Error("Failed to analyze document");

      toast.success("Análise concluída com sucesso!");
      loadDocuments(); // Reload documents
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast.error("Erro ao analisar documento");
    } finally {
      setAnalyzingDocumentId(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR");

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("pt-BR");

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      resume: "Currículo",
      certificate: "Certificado",
      portfolio: "Portfólio",
      reference: "Carta de Referência",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType?.includes("image")) return FileImage;
    if (mimeType?.includes("pdf")) return FileText;
    if (mimeType?.includes("zip") || mimeType?.includes("rar"))
      return FileArchive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAdherenceScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const aiQuestions = questions.filter((q) => q.is_ai_generated);
  const customQuestions = questions.filter((q) => !q.is_ai_generated);

  const getFilteredQuestions = (
    isAi: boolean,
    skillType: "hard_skills" | "soft_skills"
  ) =>
    questions.filter(
      (q) => q.is_ai_generated === isAi && q.question_type === skillType
    );

  const handleRegenerateAllQuestions = async () => {
    if (!candidate) {
      toast.error("Candidato não encontrado");
      return;
    }

    setIsRegenerateAllDialogOpen(false);
    setIsGeneratingQuestions(true);

    try {
      // First delete all existing AI questions
      const aiQuestionsToDelete = questions.filter((q) => q.is_ai_generated);
      for (const q of aiQuestionsToDelete) {
        await fetch(`/api/preboarding/questions/${q.id}`, { method: "DELETE" });
      }

      // Remove AI questions from state immediately
      setQuestions((prev) => prev.filter((q) => !q.is_ai_generated));

      // Generate new questions
      const res = await fetch("/api/preboarding/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: candidate.id,
          position: candidate.position,
          department: candidate.department,
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        let errorMessage = "Erro ao regenerar perguntas";
        if (contentType?.includes("application/json")) {
          const error = await res.json();
          errorMessage = error.error || error.details || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      if (!contentType?.includes("application/json")) {
        toast.error("Resposta inválida do servidor");
        return;
      }

      const data = await res.json();

      if (data.success && data.questions) {
        setQuestions((prev) => [
          ...prev.filter((q) => !q.is_ai_generated),
          ...data.questions,
        ]);
        toast.success(
          `${data.questions.length} perguntas regeneradas com sucesso!`
        );
      }
    } catch (error) {
      console.error("[v0] Exception regenerating questions:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleRegenerateSingleQuestion = async (question: Question) => {
    if (!candidate) {
      toast.error("Candidato não encontrado");
      return;
    }

    setRegeneratingQuestionId(question.id);

    try {
      const res = await fetch("/api/preboarding/questions/regenerate-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          candidate_id: candidate.id,
          position: candidate.position,
          department: candidate.department,
          question_type: question.question_type,
          current_question: question.question,
          is_ai_generated: question.is_ai_generated,
        }),
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        let errorMessage = "Erro ao regenerar pergunta";
        if (contentType?.includes("application/json")) {
          const error = await res.json();
          errorMessage = error.error || error.details || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      if (!contentType?.includes("application/json")) {
        toast.error("Resposta inválida do servidor");
        return;
      }

      const data = await res.json();

      if (data.success && data.question) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === question.id ? data.question : q))
        );
        toast.success("Pergunta regenerada com sucesso!");
      }
    } catch (error) {
      console.error("[v0] Exception regenerating single question:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setRegeneratingQuestionId(null);
    }
  };

  const renderQuestionCard = (question: Question, index: number) => (
    <Card key={question.id}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 font-medium text-muted-foreground text-sm">
                {index + 1}.
              </span>
              <div className="flex-1">
                <p className="font-medium">{question.question}</p>
                {question.expected_answer && (
                  <div className="mt-2 rounded-md bg-muted p-2">
                    <p className="mb-1 text-muted-foreground text-xs">
                      Resposta esperada:
                    </p>
                    <p className="text-sm">{question.expected_answer}</p>
                  </div>
                )}
                {editingQuestionId === question.id ? (
                  <div className="mt-3 space-y-3">
                    <Textarea
                      onChange={(e) => setEditingAnswer(e.target.value)}
                      placeholder="Resposta do candidato..."
                      rows={3}
                      value={editingAnswer}
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Avaliação:</Label>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              className="p-0.5 transition-transform hover:scale-110"
                              key={star}
                              onClick={() => setEditingRating(star)}
                              type="button"
                            >
                              <Star
                                className={cn(
                                  "h-5 w-5",
                                  star <= editingRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Textarea
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Notas do entrevistador..."
                      rows={2}
                      value={editingNotes}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleSaveQuestion(question.id)}
                        size="sm"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setEditingQuestionId(null)}
                        size="sm"
                        variant="outline"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : question.answer ? (
                  <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-green-700 text-xs">
                        Respondida
                      </span>
                      {question.rating && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              className={cn(
                                "h-3 w-3",
                                star <= question.rating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              )}
                              key={star}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{question.answer}</p>
                    {question.notes && (
                      <p className="mt-2 text-muted-foreground text-xs italic">
                        Nota: {question.notes}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              disabled={regeneratingQuestionId === question.id}
              onClick={() => handleRegenerateSingleQuestion(question)}
              size="sm"
              title="Regenerar pergunta"
              variant="ghost"
            >
              {regeneratingQuestionId === question.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => handleStartEditQuestion(question)}
              size="sm"
              variant="ghost"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              className="text-destructive hover:text-destructive"
              onClick={() => handleDeleteQuestion(question.id)}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = (isAi: boolean) => (
    <Card className="p-8">
      <div className="text-center">
        {isAi ? (
          <>
            <Sparkles className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-base">
              Nenhuma pergunta de IA gerada
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Gere perguntas automaticamente baseadas no cargo do candidato.
            </p>
            <Button
              disabled={isGeneratingQuestions}
              onClick={handleGenerateQuestions}
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
            {questions.filter((q) => q.is_ai_generated).length > 0 && (
              <Button
                className="ml-2 bg-transparent"
                disabled={isGeneratingQuestions}
                onClick={() => setIsRegenerateAllDialogOpen(true)}
                variant="outline"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Regenerar todas com IA
              </Button>
            )}
          </>
        ) : (
          <>
            <Plus className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-2 font-medium text-base">
              Nenhuma pergunta personalizada
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Adicione suas próprias perguntas para a entrevista.
            </p>
            <Button
              onClick={() => setIsAddCustomQuestionOpen(true)}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Pergunta
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  const renderQuestionsList = (questionsList: Question[]) => {
    if (questionsList.length === 0) return null;
    return (
      <div className="space-y-3">
        {questionsList.map((question, index) =>
          renderQuestionCard(question, index)
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <h2 className="mb-2 font-semibold text-xl">
            Candidato não encontrado
          </h2>
          <Button onClick={() => router.push("/preboarding")}>
            Voltar ao Pipeline
          </Button>
        </div>
      </div>
    );
  }

  const upcomingInterviews = interviews.filter(
    (i) => i.status === "scheduled" && new Date(i.scheduled_at) >= new Date()
  );
  const pastInterviews = interviews.filter(
    (i) => i.status !== "scheduled" || new Date(i.scheduled_at) < new Date()
  );

  const QuestionCard = ({
    question,
    index,
    showDelete = false,
  }: {
    question: Question;
    index: number;
    showDelete?: boolean;
  }) => {
    const isEditing = editingQuestionId === question.id;
    const isExpanded = expandedQuestions.has(question.id);

    return (
      <Card className="overflow-hidden" key={question.id}>
        <div
          className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
          onClick={() => !isEditing && toggleQuestionExpanded(question.id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge className="text-xs" variant="outline">
                  {index + 1}
                </Badge>
                {question.rating && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        className={cn(
                          "h-3 w-3",
                          star <= question.rating!
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                        key={star}
                      />
                    ))}
                  </div>
                )}
                {question.answer && (
                  <Badge className="text-xs" variant="secondary">
                    Respondida
                  </Badge>
                )}
              </div>
              <p className="font-medium text-sm">{question.question}</p>
            </div>
            <div className="flex items-center gap-1">
              {showDelete && (
                <Button
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(question.id);
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button className="shrink-0" size="icon" variant="ghost">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t bg-muted/30 p-4">
            {question.expected_answer && (
              <div className="mb-4">
                <Label className="text-muted-foreground text-xs">
                  Resposta Esperada
                </Label>
                <p className="mt-1 text-muted-foreground text-sm italic">
                  {question.expected_answer}
                </p>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Resposta do Candidato</Label>
                  <Textarea
                    className="mt-1"
                    onChange={(e) => setEditingAnswer(e.target.value)}
                    placeholder="Registre a resposta do candidato..."
                    rows={3}
                    value={editingAnswer}
                  />
                </div>
                <div>
                  <Label className="text-xs">Avaliação</Label>
                  <div className="mt-1 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        className="p-0.5 transition-transform hover:scale-110"
                        key={star}
                        onClick={() => setEditingRating(star)}
                        type="button"
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            star <= editingRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Observações</Label>
                  <Textarea
                    className="mt-1"
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Notas adicionais..."
                    rows={2}
                    value={editingNotes}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSaveQuestion(question.id)}
                    size="sm"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    onClick={() => setEditingQuestionId(null)}
                    size="sm"
                    variant="outline"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {question.answer && (
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Resposta do Candidato
                    </Label>
                    <p className="mt-1 text-sm">{question.answer}</p>
                  </div>
                )}
                {question.notes && (
                  <div>
                    <Label className="text-muted-foreground text-xs">
                      Observações
                    </Label>
                    <p className="mt-1 text-sm">{question.notes}</p>
                  </div>
                )}
                <Button
                  onClick={() => handleStartEditQuestion(question)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {question.answer ? "Editar Resposta" : "Registrar Resposta"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/preboarding")}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-12 w-12">
            <AvatarFallback
              className="text-lg"
              style={{ backgroundColor: `${candidate.stage?.color}40` }}
            >
              {getInitials(candidate.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-2xl">{candidate.name}</h1>
            <p className="text-muted-foreground">{candidate.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={handleStageChange} value={candidate.stage_id}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione a etapa" />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            size="icon"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs className="w-full" defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="questions">
            Perguntas
            {questions.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {questions.filter((q) => q.answer).length}/{questions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documentos
            {documents.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="interviews">
            Entrevistas
            {upcomingInterviews.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {upcomingInterviews.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activities">
            Atividades
            {activities.length > 0 && (
              <Badge className="ml-2" variant="secondary">
                {activities.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Info Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informações do Candidato</CardTitle>
                  <div className="flex items-center gap-2">
                    {isEditingInfo ? (
                      <>
                        <Button
                          disabled={isSavingInfo}
                          onClick={handleCancelEditingInfo}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button
                          disabled={isSavingInfo}
                          onClick={handleSaveCandidateInfo}
                          size="sm"
                        >
                          {isSavingInfo ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="mr-1 h-4 w-4" />
                          )}
                          Salvar
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleStartEditingInfo}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Nome</Label>
                        <Input
                          id="edit-name"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              name: e.target.value,
                            })
                          }
                          value={editedCandidate.name || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              email: e.target.value,
                            })
                          }
                          type="email"
                          value={editedCandidate.email || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Telefone</Label>
                        <Input
                          id="edit-phone"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              phone: e.target.value,
                            })
                          }
                          value={editedCandidate.phone || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-position">Cargo</Label>
                        <Input
                          id="edit-position"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              position: e.target.value,
                            })
                          }
                          value={editedCandidate.position || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-department">Departamento</Label>
                        <Input
                          id="edit-department"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              department: e.target.value,
                            })
                          }
                          value={editedCandidate.department || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-salary">Salário Esperado</Label>
                        <Input
                          id="edit-salary"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              expected_salary: Number.parseFloat(
                                e.target.value
                              ),
                            })
                          }
                          type="number"
                          value={editedCandidate.expected_salary || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-start-date">Início Esperado</Label>
                        <Input
                          id="edit-start-date"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              expected_start_date: e.target.value,
                            })
                          }
                          type="date"
                          value={editedCandidate.expected_start_date || ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-source">Fonte</Label>
                        <Input
                          id="edit-source"
                          onChange={(e) =>
                            setEditedCandidate({
                              ...editedCandidate,
                              source: e.target.value,
                            })
                          }
                          value={editedCandidate.source || ""}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-notes">Observações</Label>
                      <Textarea
                        id="edit-notes"
                        onChange={(e) =>
                          setEditedCandidate({
                            ...editedCandidate,
                            notes: e.target.value,
                          })
                        }
                        rows={4}
                        value={editedCandidate.notes || ""}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {candidate.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Email
                            </div>
                            <a
                              className="text-primary hover:underline"
                              href={`mailto:${candidate.email}`}
                            >
                              {candidate.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Telefone
                            </div>
                            <a
                              className="hover:underline"
                              href={`tel:${candidate.phone}`}
                            >
                              {candidate.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {candidate.department && (
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Departamento
                            </div>
                            <div>{candidate.department}</div>
                          </div>
                        </div>
                      )}
                      {candidate.expected_salary && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Salário Esperado
                            </div>
                            <div>
                              {formatCurrency(candidate.expected_salary)}
                            </div>
                          </div>
                        </div>
                      )}
                      {candidate.expected_start_date && (
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Início Esperado
                            </div>
                            <div>
                              {formatDate(candidate.expected_start_date)}
                            </div>
                          </div>
                        </div>
                      )}
                      {candidate.source && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Fonte
                            </div>
                            <Badge variant="outline">{candidate.source}</Badge>
                          </div>
                        </div>
                      )}
                      {candidate.rating && (
                        <div className="flex items-center gap-3">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground text-sm">
                              Avaliação
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  className={cn(
                                    "h-4 w-4",
                                    star <= candidate.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  )}
                                  key={star}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 border-t pt-4">
                      <div className="mb-2 text-muted-foreground text-sm">
                        Observações
                      </div>
                      <p className="whitespace-pre-wrap text-sm">
                        {candidate.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pipeline Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Progresso no Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stages.map((stage) => {
                      const isCurrentOrPast =
                        stage.order_index <=
                        (candidate.stage?.order_index || 0);
                      const isCurrent = stage.id === candidate.stage_id;

                      return (
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-md p-2 transition-colors",
                            isCurrent && "bg-muted"
                          )}
                          key={stage.id}
                        >
                          <div
                            className={cn(
                              "h-3 w-3 rounded-full border-2",
                              isCurrentOrPast ? "bg-current" : "bg-muted"
                            )}
                            style={{
                              borderColor: stage.color,
                              backgroundColor: isCurrentOrPast
                                ? stage.color
                                : "transparent",
                            }}
                          />
                          <span
                            className={cn(
                              "text-sm",
                              isCurrent && "font-medium"
                            )}
                          >
                            {stage.name}
                          </span>
                          {isCurrent && (
                            <Badge
                              className="ml-auto text-xs"
                              variant="secondary"
                            >
                              Atual
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    className="w-full justify-start bg-transparent"
                    onClick={() => setIsScheduleDialogOpen(true)}
                    variant="outline"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Entrevista
                  </Button>
                  {candidate.email && (
                    <Button
                      asChild
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                    >
                      <a href={`mailto:${candidate.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Email
                      </a>
                    </Button>
                  )}
                  {candidate.phone && (
                    <Button
                      asChild
                      className="w-full justify-start bg-transparent"
                      variant="outline"
                    >
                      <a href={`tel:${candidate.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Ligar
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                Perguntas para Entrevista
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsAddCustomQuestionOpen(true)}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Pergunta
                </Button>
                {aiQuestions.length > 0 ? (
                  <Button
                    disabled={isGeneratingQuestions}
                    onClick={() => setIsRegenerateAllDialogOpen(true)}
                    variant="outline"
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerar todas as perguntas
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled={isGeneratingQuestions}
                    onClick={handleGenerateQuestions}
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar com IA
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Main tabs: AI vs Custom */}
            <Tabs
              onValueChange={(v) => setQuestionTabType(v as "ai" | "custom")}
              value={questionTabType}
            >
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger className="flex items-center gap-2" value="ai">
                  <Sparkles className="h-4 w-4" />
                  Perguntas IA
                  {aiQuestions.length > 0 && (
                    <Badge className="ml-1" variant="secondary">
                      {aiQuestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-2" value="custom">
                  <User className="h-4 w-4" />
                  Personalizadas
                  {customQuestions.length > 0 && (
                    <Badge className="ml-1" variant="secondary">
                      {customQuestions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* AI Questions Tab */}
              <TabsContent className="mt-0" value="ai">
                {aiQuestions.length === 0 ? (
                  renderEmptyState(true)
                ) : (
                  <Tabs
                    onValueChange={(v) =>
                      setQuestionSkillTab(v as "hard_skills" | "soft_skills")
                    }
                    value={questionSkillTab}
                  >
                    <TabsList className="mb-4">
                      <TabsTrigger
                        className="flex items-center gap-2"
                        value="hard_skills"
                      >
                        <Briefcase className="h-4 w-4" />
                        Hard Skills
                        <Badge className="ml-1" variant="outline">
                          {getFilteredQuestions(true, "hard_skills").length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex items-center gap-2"
                        value="soft_skills"
                      >
                        <User className="h-4 w-4" />
                        Soft Skills
                        <Badge className="ml-1" variant="outline">
                          {getFilteredQuestions(true, "soft_skills").length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent className="mt-0" value="hard_skills">
                      {getFilteredQuestions(true, "hard_skills").length ===
                      0 ? (
                        <Card className="p-6">
                          <div className="text-center text-muted-foreground">
                            <Briefcase className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p>Nenhuma pergunta de Hard Skills gerada</p>
                          </div>
                        </Card>
                      ) : (
                        renderQuestionsList(
                          getFilteredQuestions(true, "hard_skills")
                        )
                      )}
                    </TabsContent>

                    <TabsContent className="mt-0" value="soft_skills">
                      {getFilteredQuestions(true, "soft_skills").length ===
                      0 ? (
                        <Card className="p-6">
                          <div className="text-center text-muted-foreground">
                            <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p>Nenhuma pergunta de Soft Skills gerada</p>
                          </div>
                        </Card>
                      ) : (
                        renderQuestionsList(
                          getFilteredQuestions(true, "soft_skills")
                        )
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </TabsContent>

              {/* Custom Questions Tab */}
              <TabsContent className="mt-0" value="custom">
                {customQuestions.length === 0 ? (
                  renderEmptyState(false)
                ) : (
                  <Tabs
                    onValueChange={(v) =>
                      setQuestionSkillTab(v as "hard_skills" | "soft_skills")
                    }
                    value={questionSkillTab}
                  >
                    <TabsList className="mb-4">
                      <TabsTrigger
                        className="flex items-center gap-2"
                        value="hard_skills"
                      >
                        <Briefcase className="h-4 w-4" />
                        Hard Skills
                        <Badge className="ml-1" variant="outline">
                          {getFilteredQuestions(false, "hard_skills").length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        className="flex items-center gap-2"
                        value="soft_skills"
                      >
                        <User className="h-4 w-4" />
                        Soft Skills
                        <Badge className="ml-1" variant="outline">
                          {getFilteredQuestions(false, "soft_skills").length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent className="mt-0" value="hard_skills">
                      {getFilteredQuestions(false, "hard_skills").length ===
                      0 ? (
                        <Card className="p-6">
                          <div className="text-center text-muted-foreground">
                            <Briefcase className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p>Nenhuma pergunta de Hard Skills personalizada</p>
                            <Button
                              onClick={() => setIsAddCustomQuestionOpen(true)}
                              size="sm"
                              variant="link"
                            >
                              Adicionar pergunta
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        renderQuestionsList(
                          getFilteredQuestions(false, "hard_skills")
                        )
                      )}
                    </TabsContent>

                    <TabsContent className="mt-0" value="soft_skills">
                      {getFilteredQuestions(false, "soft_skills").length ===
                      0 ? (
                        <Card className="p-6">
                          <div className="text-center text-muted-foreground">
                            <User className="mx-auto mb-2 h-8 w-8 opacity-50" />
                            <p>Nenhuma pergunta de Soft Skills personalizada</p>
                            <Button
                              onClick={() => setIsAddCustomQuestionOpen(true)}
                              size="sm"
                              variant="link"
                            >
                              Adicionar pergunta
                            </Button>
                          </div>
                        </Card>
                      ) : (
                        renderQuestionsList(
                          getFilteredQuestions(false, "soft_skills")
                        )
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos do Candidato
              </CardTitle>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documento
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="mb-2 font-medium text-lg">
                    Nenhum documento enviado
                  </p>
                  <p className="mb-4 text-sm">
                    Envie o currículo e outros documentos do candidato para
                    análise com IA
                  </p>
                  <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    variant="outline"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Primeiro Documento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Average adherence score card */}
                  {documents.some((d) => d.adherence_score !== null) && (
                    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-blue-100 p-2">
                              <BarChart3 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-blue-900 text-sm">
                                Nota Média de Aderência
                              </p>
                              <p className="text-blue-700 text-xs">
                                Baseado em{" "}
                                {
                                  documents.filter(
                                    (d) => d.adherence_score !== null
                                  ).length
                                }{" "}
                                documento(s) analisado(s)
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-3xl text-blue-600">
                              {Math.round(
                                documents
                                  .filter((d) => d.adherence_score !== null)
                                  .reduce(
                                    (acc, d) => acc + (d.adherence_score || 0),
                                    0
                                  ) /
                                  documents.filter(
                                    (d) => d.adherence_score !== null
                                  ).length
                              )}
                              <span className="font-normal text-lg">/100</span>
                            </p>
                          </div>
                        </div>
                        <Progress
                          className="mt-3 h-2"
                          value={
                            documents
                              .filter((d) => d.adherence_score !== null)
                              .reduce(
                                (acc, d) => acc + (d.adherence_score || 0),
                                0
                              ) /
                            documents.filter((d) => d.adherence_score !== null)
                              .length
                          }
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Documents list */}
                  {documents.map((doc) => {
                    const DocIcon = getDocumentIcon(doc.mime_type);
                    return (
                      <Card className="overflow-hidden" key={doc.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-1 items-start gap-3">
                              <div className="rounded-lg bg-gray-100 p-2">
                                <DocIcon className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="truncate font-medium">
                                    {doc.title}
                                  </h4>
                                  <Badge className="text-xs" variant="outline">
                                    {getDocumentTypeLabel(doc.document_type)}
                                  </Badge>
                                  {doc.adherence_score !== null && (
                                    <Badge
                                      className={cn(
                                        "text-xs",
                                        getAdherenceScoreColor(
                                          doc.adherence_score
                                        )
                                      )}
                                    >
                                      Aderência: {doc.adherence_score}%
                                    </Badge>
                                  )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-sm">
                                  {doc.file_name} •{" "}
                                  {formatFileSize(doc.file_size)}
                                </p>
                                <p className="mt-1 text-muted-foreground text-xs">
                                  Enviado em{" "}
                                  {new Date(doc.created_at).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                  {doc.analyzed_at && (
                                    <>
                                      {" "}
                                      • Analisado em{" "}
                                      {new Date(
                                        doc.analyzed_at
                                      ).toLocaleDateString("pt-BR")}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() =>
                                  window.open(doc.file_url, "_blank")
                                }
                                size="sm"
                                variant="outline"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              {/* CHANGE: Simplified AI button with hover glow and loading border animation */}
                              <button
                                className={cn(
                                  "relative inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm",
                                  "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400",
                                  "text-white shadow-md",
                                  "transition-all duration-300",
                                  "hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]",
                                  "disabled:cursor-not-allowed disabled:opacity-80",
                                  analyzingDocumentId === doc.id &&
                                    "animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                )}
                                disabled={analyzingDocumentId === doc.id}
                                onClick={() => handleAnalyzeDocument(doc.id)}
                              >
                                {analyzingDocumentId === doc.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Analisando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4" />
                                    <span>Insights da IA</span>
                                  </>
                                )}
                              </button>
                              <Button
                                className="bg-transparent text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteDocument(doc.id)}
                                size="sm"
                                variant="outline"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* AI Analysis section */}
                          {doc.ai_analysis && (
                            <div className="mt-4 border-t pt-4">
                              <Button
                                className="w-full justify-between"
                                onClick={() =>
                                  setExpandedAnalysis(
                                    expandedAnalysis === doc.id ? null : doc.id
                                  )
                                }
                                size="sm"
                                variant="ghost"
                              >
                                <span className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-500" />
                                  Análise da IA
                                </span>
                                {expandedAnalysis === doc.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              {expandedAnalysis === doc.id && (
                                <div className="mt-3 rounded-lg bg-purple-50 p-4">
                                  <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700 text-sm">
                                      {doc.ai_analysis}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Entrevistas</h2>
              <Button onClick={() => setIsScheduleDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agendar Entrevista
              </Button>
            </div>

            {/* Upcoming Interviews */}
            {upcomingInterviews.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium text-muted-foreground text-sm">
                  Próximas Entrevistas
                </h3>
                <div className="space-y-3">
                  {upcomingInterviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  interviewStatusColors[interview.status]
                                }
                              >
                                {interviewTypeLabels[
                                  interview.interview_type
                                ] || interview.interview_type}
                              </Badge>
                              <Badge variant="outline">
                                {interviewStatusLabels[interview.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(interview.scheduled_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {interview.duration_minutes} min
                              </div>
                            </div>
                            {interview.interviewer_name && (
                              <div className="flex items-center gap-1 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                {interview.interviewer_name}
                              </div>
                            )}
                            {interview.location && (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                {interview.location}
                              </div>
                            )}
                            {interview.meeting_link && (
                              <div className="flex items-center gap-1 text-sm">
                                <LinkIcon className="h-3 w-3 text-muted-foreground" />
                                <a
                                  className="text-primary hover:underline"
                                  href={interview.meeting_link}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  Link da Reunião
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleOpenFeedback(interview)}
                              size="sm"
                              variant="outline"
                            >
                              Feedback
                            </Button>
                            <Button
                              className="bg-transparent text-destructive"
                              onClick={() =>
                                handleCancelInterview(interview.id)
                              }
                              size="sm"
                              variant="outline"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Past Interviews */}
            {pastInterviews.length > 0 && (
              <div>
                <h3 className="mb-3 font-medium text-muted-foreground text-sm">
                  Entrevistas Anteriores
                </h3>
                <div className="space-y-3">
                  {pastInterviews.map((interview) => (
                    <Card className="opacity-75" key={interview.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {interviewTypeLabels[
                                  interview.interview_type
                                ] || interview.interview_type}
                              </Badge>
                              <Badge
                                className={
                                  interviewStatusColors[interview.status]
                                }
                              >
                                {interviewStatusLabels[interview.status]}
                              </Badge>
                              {interview.rating && (
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      className={cn(
                                        "h-3 w-3",
                                        star <= interview.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-muted-foreground"
                                      )}
                                      key={star}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(interview.scheduled_at)}
                              </div>
                              {interview.interviewer_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {interview.interviewer_name}
                                </div>
                              )}
                            </div>
                            {interview.feedback && (
                              <p className="mt-2 text-muted-foreground text-sm">
                                {interview.feedback}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleOpenFeedback(interview)}
                            size="sm"
                            variant="ghost"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {interviews.length === 0 && (
              <Card className="p-12">
                <div className="text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 font-medium text-lg">
                    Nenhuma entrevista agendada
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Agende a primeira entrevista com este candidato.
                  </p>
                  <Button onClick={() => setIsScheduleDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agendar Entrevista
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activities">
          <div className="space-y-6">
            {/* Add Note */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Adicionar Anotação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escreva uma anotação sobre o candidato..."
                    rows={3}
                    value={newNote}
                  />
                  <Button
                    disabled={isAddingNote || !newNote.trim()}
                    onClick={handleAddNote}
                  >
                    {isAddingNote ? "Salvando..." : "Adicionar Anotação"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Histórico de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Nenhuma atividade registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon =
                        activityIcons[activity.activity_type] ||
                        activityIcons.other;

                      return (
                        <div className="flex gap-3" key={activity.id}>
                          <div className="mt-0.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {activity.title}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {formatDateTime(activity.created_at)}
                              </span>
                            </div>
                            <p className="mt-1 text-muted-foreground text-sm">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Schedule Interview Dialog */}
      <Dialog
        onOpenChange={setIsScheduleDialogOpen}
        open={isScheduleDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Entrevista</DialogTitle>
            <DialogDescription>
              Agende uma entrevista com {candidate.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Data e Hora *</Label>
                <Input
                  className="mt-1"
                  onChange={(e) =>
                    setInterviewForm((f) => ({
                      ...f,
                      scheduled_at: e.target.value,
                    }))
                  }
                  type="datetime-local"
                  value={interviewForm.scheduled_at}
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select
                  onValueChange={(v) =>
                    setInterviewForm((f) => ({ ...f, interview_type: v }))
                  }
                  value={interviewForm.interview_type}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="in_person">Presencial</SelectItem>
                    <SelectItem value="technical">Técnica</SelectItem>
                    <SelectItem value="hr">RH</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duração (min)</Label>
                <Select
                  onValueChange={(v) =>
                    setInterviewForm((f) => ({ ...f, duration_minutes: v }))
                  }
                  value={interviewForm.duration_minutes}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Entrevistador</Label>
              <Input
                className="mt-1"
                onChange={(e) =>
                  setInterviewForm((f) => ({
                    ...f,
                    interviewer_name: e.target.value,
                  }))
                }
                placeholder="Nome do entrevistador"
                value={interviewForm.interviewer_name}
              />
            </div>
            <div>
              <Label>Email do Entrevistador</Label>
              <Input
                className="mt-1"
                onChange={(e) =>
                  setInterviewForm((f) => ({
                    ...f,
                    interviewer_email: e.target.value,
                  }))
                }
                placeholder="email@empresa.com"
                type="email"
                value={interviewForm.interviewer_email}
              />
            </div>
            <div>
              <Label>Local</Label>
              <Input
                className="mt-1"
                onChange={(e) =>
                  setInterviewForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Sala de reunião, endereço, etc."
                value={interviewForm.location}
              />
            </div>
            <div>
              <Label>Link da Reunião</Label>
              <Input
                className="mt-1"
                onChange={(e) =>
                  setInterviewForm((f) => ({
                    ...f,
                    meeting_link: e.target.value,
                  }))
                }
                placeholder="https://meet.google.com/..."
                value={interviewForm.meeting_link}
              />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                className="mt-1"
                onChange={(e) =>
                  setInterviewForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Notas sobre a entrevista..."
                rows={2}
                value={interviewForm.notes}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                checked={interviewForm.create_calendar_event}
                className="rounded border-gray-300"
                id="create_calendar_event"
                onChange={(e) =>
                  setInterviewForm((f) => ({
                    ...f,
                    create_calendar_event: e.target.checked,
                  }))
                }
                type="checkbox"
              />
              <Label
                className="font-normal text-sm"
                htmlFor="create_calendar_event"
              >
                Criar evento no calendário
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsScheduleDialogOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button disabled={isScheduling} onClick={handleScheduleInterview}>
              {isScheduling ? "Agendando..." : "Agendar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog onOpenChange={setFeedbackDialogOpen} open={feedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback da Entrevista</DialogTitle>
            <DialogDescription>
              Registre o feedback e avaliação da entrevista
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status</Label>
              <Select
                onValueChange={(v) =>
                  setFeedbackForm((f) => ({ ...f, status: v }))
                }
                value={feedbackForm.status}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="no_show">Não Compareceu</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Avaliação</Label>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    className="p-1 transition-transform hover:scale-110"
                    key={star}
                    onClick={() =>
                      setFeedbackForm((f) => ({ ...f, rating: star }))
                    }
                    type="button"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        star <= feedbackForm.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Feedback</Label>
              <Textarea
                className="mt-1"
                onChange={(e) =>
                  setFeedbackForm((f) => ({ ...f, feedback: e.target.value }))
                }
                placeholder="Escreva o feedback da entrevista..."
                rows={4}
                value={feedbackForm.feedback}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setFeedbackDialogOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveFeedback}>Salvar Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setIsDeleteDialogOpen}
        open={isDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Candidato</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {candidate.name} do pipeline? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog onOpenChange={setIsUploadDialogOpen} open={isUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Envie um documento do candidato para análise. Formatos aceitos:
              PDF, DOC, DOCX, imagens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Tipo de Documento</Label>
              <Select
                onValueChange={setUploadDocumentType}
                value={uploadDocumentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resume">Currículo</SelectItem>
                  <SelectItem value="certificate">Certificado</SelectItem>
                  <SelectItem value="portfolio">Portfólio</SelectItem>
                  <SelectItem value="reference">Carta de Referência</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-title">Título do Documento</Label>
              <Input
                id="document-title"
                onChange={(e) => setUploadDocumentTitle(e.target.value)}
                placeholder="Ex: Currículo Atualizado 2024"
                value={uploadDocumentTitle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-file">Arquivo</Label>
              <div className="rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50">
                <input
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  id="document-file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  type="file"
                />
                <label className="cursor-pointer" htmlFor="document-file">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        Clique para selecionar ou arraste um arquivo
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsUploadDialogOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              disabled={isUploadingDocument}
              onClick={handleUploadDocument}
            >
              {isUploadingDocument ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={setIsAddCustomQuestionOpen}
        open={isAddCustomQuestionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Pergunta Personalizada</DialogTitle>
            <DialogDescription>
              Crie uma pergunta de entrevista personalizada para este candidato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Pergunta</Label>
              <Select
                onValueChange={(v) =>
                  setCustomQuestionForm((prev) => ({
                    ...prev,
                    question_type: v as "hard_skills" | "soft_skills",
                  }))
                }
                value={customQuestionForm.question_type}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hard_skills">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Hard Skills (Técnica)
                    </div>
                  </SelectItem>
                  <SelectItem value="soft_skills">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Soft Skills (Comportamental)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pergunta *</Label>
              <Textarea
                className="mt-1"
                onChange={(e) =>
                  setCustomQuestionForm((prev) => ({
                    ...prev,
                    question: e.target.value,
                  }))
                }
                placeholder="Digite a pergunta que deseja fazer ao candidato..."
                rows={3}
                value={customQuestionForm.question}
              />
            </div>
            <div>
              <Label>Resposta Esperada (opcional)</Label>
              <Textarea
                className="mt-1"
                onChange={(e) =>
                  setCustomQuestionForm((prev) => ({
                    ...prev,
                    expected_answer: e.target.value,
                  }))
                }
                placeholder="Descreva o que seria uma boa resposta..."
                rows={2}
                value={customQuestionForm.expected_answer}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsAddCustomQuestionOpen(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              disabled={isAddingCustomQuestion}
              onClick={handleAddCustomQuestion}
            >
              {isAddingCustomQuestion ? "Adicionando..." : "Adicionar Pergunta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Regenerate All Questions Dialog */}
      <AlertDialog
        onOpenChange={setIsRegenerateAllDialogOpen}
        open={isRegenerateAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerar todas as perguntas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá excluir todas as {aiQuestions.length} perguntas
              geradas pela IA e criar novas perguntas. As respostas já
              registradas nas perguntas de IA serão perdidas. As perguntas
              personalizadas não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateAllQuestions}>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
