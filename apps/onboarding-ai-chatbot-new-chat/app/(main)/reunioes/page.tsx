"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	Calendar,
	Clock,
	Edit,
	FileText,
	MapPin,
	Mic,
	Plus,
	Repeat,
	Search,
	Trash2,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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

interface Meeting {
	id: string;
	title: string;
	description: string | null;
	meeting_date: string;
	duration_minutes: number;
	location: string | null;
	participants: string[] | null;
	notes: string | null;
	transcript: string | null;
	status: "scheduled" | "in_progress" | "completed" | "cancelled";
	rrule: string | null;
	created_at: string;
	updated_at: string;
}

const statusConfig = {
	scheduled: { label: "Agendada", color: "bg-blue-100 text-blue-800" },
	in_progress: {
		label: "Em Andamento",
		color: "bg-yellow-100 text-yellow-800",
	},
	completed: { label: "Concluída", color: "bg-green-100 text-green-800" },
	cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

const recurrenceOptions = [
	{ value: "none", label: "Não repetir" },
	{ value: "FREQ=DAILY", label: "Diariamente" },
	{ value: "FREQ=WEEKLY", label: "Semanalmente" },
	{ value: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR", label: "Dias úteis" },
	{ value: "FREQ=MONTHLY", label: "Mensalmente" },
	{ value: "FREQ=YEARLY", label: "Anualmente" },
];

export default function MeetingsPage() {
	const router = useRouter();
	const [meetings, setMeetings] = useState<Meeting[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

	// Form state
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		meeting_date: "",
		meeting_time: "",
		duration_minutes: 60,
		location: "",
		participants: "",
		recurrence: "none",
		recurrence_count: 10,
		create_calendar_event: true,
	});

	useEffect(() => {
		loadMeetings();
	}, [statusFilter]);

	const loadMeetings = async () => {
		try {
			const url =
				statusFilter === "all"
					? "/api/meetings"
					: `/api/meetings?status=${statusFilter}`;
			const response = await fetch(url);
			if (!response.ok) throw new Error("Failed to fetch meetings");
			const data = await response.json();
			setMeetings(data);
		} catch (error) {
			console.error("Error loading meetings:", error);
			toast.error("Erro ao carregar reuniões");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const meetingDateTime = new Date(
				`${formData.meeting_date}T${formData.meeting_time}`,
			);
			const participantsArray = formData.participants
				? formData.participants
						.split(",")
						.map((p) => p.trim())
						.filter(Boolean)
				: [];

			// Build rrule string with count
			let rrule: string | null = null;
			if (formData.recurrence !== "none") {
				rrule = `${formData.recurrence};COUNT=${formData.recurrence_count}`;
			}

			const payload = {
				title: formData.title,
				description: formData.description || null,
				meeting_date: meetingDateTime.toISOString(),
				duration_minutes: formData.duration_minutes,
				location: formData.location || null,
				participants: participantsArray.length > 0 ? participantsArray : null,
				status: "scheduled",
				rrule,
				create_calendar_event: formData.create_calendar_event,
			};

			const url = editingMeeting
				? `/api/meetings/${editingMeeting.id}`
				: "/api/meetings";
			const method = editingMeeting ? "PATCH" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error("Failed to save meeting");

			toast.success(editingMeeting ? "Reunião atualizada!" : "Reunião criada!");
			setIsDialogOpen(false);
			resetForm();
			loadMeetings();
		} catch (error) {
			console.error("Error saving meeting:", error);
			toast.error("Erro ao salvar reunião");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir esta reunião?")) return;

		try {
			const response = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
			if (!response.ok) throw new Error("Failed to delete meeting");
			toast.success("Reunião excluída!");
			loadMeetings();
		} catch (error) {
			console.error("Error deleting meeting:", error);
			toast.error("Erro ao excluir reunião");
		}
	};

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			meeting_date: "",
			meeting_time: "",
			duration_minutes: 60,
			location: "",
			participants: "",
			recurrence: "none",
			recurrence_count: 10,
			create_calendar_event: true,
		});
		setEditingMeeting(null);
	};

	const openEditDialog = (meeting: Meeting) => {
		const date = new Date(meeting.meeting_date);

		// Parse rrule to extract recurrence type and count
		let recurrence = "none";
		let recurrence_count = 10;
		if (meeting.rrule) {
			const parts = meeting.rrule.split(";");
			const countPart = parts.find((p) => p.startsWith("COUNT="));
			if (countPart) {
				recurrence_count = Number.parseInt(countPart.replace("COUNT=", ""), 10);
			}
			// Find matching recurrence option
			const rruleWithoutCount = parts
				.filter((p) => !p.startsWith("COUNT="))
				.join(";");
			const match = recurrenceOptions.find(
				(opt) => opt.value === rruleWithoutCount,
			);
			if (match) {
				recurrence = match.value;
			}
		}

		setFormData({
			title: meeting.title,
			description: meeting.description || "",
			meeting_date: format(date, "yyyy-MM-dd"),
			meeting_time: format(date, "HH:mm"),
			duration_minutes: meeting.duration_minutes,
			location: meeting.location || "",
			participants: meeting.participants?.join(", ") || "",
			recurrence,
			recurrence_count,
			create_calendar_event: false, // Don't create new calendar event when editing
		});
		setEditingMeeting(meeting);
		setIsDialogOpen(true);
	};

	const getRecurrenceLabel = (rrule: string | null) => {
		if (!rrule) return null;
		const parts = rrule.split(";");
		const rruleWithoutCount = parts
			.filter((p) => !p.startsWith("COUNT="))
			.join(";");
		const match = recurrenceOptions.find(
			(opt) => opt.value === rruleWithoutCount,
		);
		return match?.label || "Recorrente";
	};

	const filteredMeetings = meetings.filter(
		(meeting) =>
			meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			meeting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			meeting.location?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold">Atas de Reunião</h1>
					<p className="text-muted-foreground">
						Gerencie e transcreva suas reuniões presenciais
					</p>
				</div>

				<Dialog
					open={isDialogOpen}
					onOpenChange={(open) => {
						setIsDialogOpen(open);
						if (!open) resetForm();
					}}
				>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Nova Reunião
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingMeeting ? "Editar Reunião" : "Nova Reunião"}
							</DialogTitle>
							<DialogDescription>
								Preencha os dados da reunião presencial
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Título *</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									placeholder="Ex: Reunião de Alinhamento Semanal"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Descrição</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="Pauta e objetivos da reunião..."
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="meeting_date">Data *</Label>
									<Input
										id="meeting_date"
										type="date"
										value={formData.meeting_date}
										onChange={(e) =>
											setFormData({ ...formData, meeting_date: e.target.value })
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="meeting_time">Horário *</Label>
									<Input
										id="meeting_time"
										type="time"
										value={formData.meeting_time}
										onChange={(e) =>
											setFormData({ ...formData, meeting_time: e.target.value })
										}
										required
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="duration">Duração (min)</Label>
									<Input
										id="duration"
										type="number"
										min={15}
										step={15}
										value={formData.duration_minutes}
										onChange={(e) =>
											setFormData({
												...formData,
												duration_minutes: Number.parseInt(e.target.value),
											})
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="location">Local</Label>
									<Input
										id="location"
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										placeholder="Sala de reunião, escritório..."
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="participants">Participantes</Label>
								<Input
									id="participants"
									value={formData.participants}
									onChange={(e) =>
										setFormData({ ...formData, participants: e.target.value })
									}
									placeholder="Separados por vírgula: João, Maria, Pedro..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="recurrence">Recorrência</Label>
								<Select
									value={formData.recurrence}
									onValueChange={(value) =>
										setFormData({ ...formData, recurrence: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Selecione a recorrência" />
									</SelectTrigger>
									<SelectContent>
										{recurrenceOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{formData.recurrence !== "none" && (
								<div className="space-y-2">
									<Label htmlFor="recurrence_count">
										Número de ocorrências
									</Label>
									<Input
										id="recurrence_count"
										type="number"
										min={1}
										max={100}
										value={formData.recurrence_count}
										onChange={(e) =>
											setFormData({
												...formData,
												recurrence_count: Number.parseInt(e.target.value),
											})
										}
									/>
									<p className="text-xs text-muted-foreground">
										Quantas vezes a reunião deve se repetir
									</p>
								</div>
							)}

							{!editingMeeting && (
								<div className="flex items-center space-x-2">
									<Checkbox
										id="create_calendar_event"
										checked={formData.create_calendar_event}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												create_calendar_event: checked as boolean,
											})
										}
									/>
									<Label
										htmlFor="create_calendar_event"
										className="text-sm font-normal cursor-pointer"
									>
										Adicionar ao calendário
									</Label>
								</div>
							)}

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting
										? "Salvando..."
										: editingMeeting
											? "Salvar"
											: "Criar"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar reuniões..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-full sm:w-48">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Todos os status</SelectItem>
						<SelectItem value="scheduled">Agendadas</SelectItem>
						<SelectItem value="in_progress">Em Andamento</SelectItem>
						<SelectItem value="completed">Concluídas</SelectItem>
						<SelectItem value="cancelled">Canceladas</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Meetings List */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			) : filteredMeetings.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 text-center">
						<FileText className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							Nenhuma reunião encontrada
						</h3>
						<p className="text-muted-foreground mb-4">
							{searchQuery
								? "Tente buscar por outro termo"
								: "Crie sua primeira reunião para começar"}
						</p>
						{!searchQuery && (
							<Button onClick={() => setIsDialogOpen(true)}>
								<Plus className="h-4 w-4 mr-2" />
								Nova Reunião
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{filteredMeetings.map((meeting) => (
						<Card
							key={meeting.id}
							className="hover:shadow-md transition-shadow cursor-pointer"
							onClick={() => router.push(`/reunioes/${meeting.id}`)}
						>
							<CardHeader className="pb-2">
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 min-w-0">
										<CardTitle className="text-lg truncate">
											{meeting.title}
										</CardTitle>
										{meeting.description && (
											<CardDescription className="line-clamp-2 mt-1">
												{meeting.description}
											</CardDescription>
										)}
									</div>
									<div className="flex items-center gap-2">
										{meeting.rrule && (
											<Badge
												variant="outline"
												className="flex items-center gap-1"
											>
												<Repeat className="h-3 w-3" />
												{getRecurrenceLabel(meeting.rrule)}
											</Badge>
										)}
										<Badge className={statusConfig[meeting.status].color}>
											{statusConfig[meeting.status].label}
										</Badge>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="h-4 w-4" />
										{format(
											new Date(meeting.meeting_date),
											"dd 'de' MMMM 'de' yyyy",
											{ locale: ptBR },
										)}
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										{format(new Date(meeting.meeting_date), "HH:mm")} (
										{meeting.duration_minutes}min)
									</div>
									{meeting.location && (
										<div className="flex items-center gap-1">
											<MapPin className="h-4 w-4" />
											{meeting.location}
										</div>
									)}
									{meeting.participants && meeting.participants.length > 0 && (
										<div className="flex items-center gap-1">
											<Users className="h-4 w-4" />
											{meeting.participants.length} participante(s)
										</div>
									)}
									{meeting.transcript && (
										<div className="flex items-center gap-1 text-green-600">
											<Mic className="h-4 w-4" />
											Transcrita
										</div>
									)}
								</div>

								<div
									className="flex items-center gap-2 mt-4"
									onClick={(e) => e.stopPropagation()}
								>
									<Button
										variant="outline"
										size="sm"
										onClick={() => openEditDialog(meeting)}
									>
										<Edit className="h-4 w-4 mr-1" />
										Editar
									</Button>
									<Button
										variant="outline"
										size="sm"
										className="text-destructive hover:text-destructive bg-transparent"
										onClick={() => handleDelete(meeting.id)}
									>
										<Trash2 className="h-4 w-4 mr-1" />
										Excluir
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
