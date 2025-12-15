"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	Clock,
	Edit2,
	Map,
	MoreHorizontal,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MindMap {
	id: string;
	title: string;
	description: string;
	nodes: unknown[];
	edges: unknown[];
	created_at: string;
	updated_at: string;
}

export default function MindMapsPage() {
	const router = useRouter();
	const [mindmaps, setMindmaps] = useState<MindMap[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [newDescription, setNewDescription] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		fetchMindmaps();
	}, []);

	const fetchMindmaps = async () => {
		try {
			const response = await fetch("/api/mindmaps");
			if (!response.ok) throw new Error("Failed to fetch mindmaps");
			const data = await response.json();
			setMindmaps(data);
		} catch (error) {
			console.error("Error fetching mindmaps:", error);
			toast.error("Erro ao carregar mapas mentais");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreate = async () => {
		if (!newTitle.trim()) {
			toast.error("O título é obrigatório");
			return;
		}

		setIsCreating(true);
		try {
			const response = await fetch("/api/mindmaps", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: newTitle.trim(),
					description: newDescription.trim(),
				}),
			});

			if (!response.ok) throw new Error("Failed to create mindmap");

			const data = await response.json();
			toast.success("Mapa mental criado com sucesso!");
			setIsCreateOpen(false);
			setNewTitle("");
			setNewDescription("");
			router.push(`/mapas-mentais/${data.id}`);
		} catch (error) {
			console.error("Error creating mindmap:", error);
			toast.error("Erro ao criar mapa mental");
		} finally {
			setIsCreating(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteId) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/mindmaps/${deleteId}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete mindmap");

			setMindmaps((prev) => prev.filter((m) => m.id !== deleteId));
			toast.success("Mapa mental excluído com sucesso!");
		} catch (error) {
			console.error("Error deleting mindmap:", error);
			toast.error("Erro ao excluir mapa mental");
		} finally {
			setIsDeleting(false);
			setDeleteId(null);
		}
	};

	const filteredMindmaps = mindmaps.filter(
		(m) =>
			m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			m.description?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold">Mapas Mentais</h1>
					<p className="text-muted-foreground mt-1">
						Visualize e organize os fluxos de trabalho da empresa
					</p>
				</div>
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild>
						<Button className="gap-2">
							<Plus className="h-4 w-4" />
							Novo Mapa Mental
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Criar Novo Mapa Mental</DialogTitle>
							<DialogDescription>
								Crie um novo mapa mental para visualizar fluxos de trabalho
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="title">Título</Label>
								<Input
									id="title"
									placeholder="Ex: Fluxo de Onboarding"
									value={newTitle}
									onChange={(e) => setNewTitle(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Descrição (opcional)</Label>
								<Textarea
									id="description"
									placeholder="Descreva o propósito deste mapa mental..."
									value={newDescription}
									onChange={(e) => setNewDescription(e.target.value)}
									rows={3}
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setIsCreateOpen(false)}>
								Cancelar
							</Button>
							<Button onClick={handleCreate} disabled={isCreating}>
								{isCreating ? "Criando..." : "Criar Mapa Mental"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			<div className="mb-6">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Buscar mapas mentais..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{isLoading ? (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader>
								<div className="h-5 bg-muted rounded w-2/3" />
								<div className="h-4 bg-muted rounded w-1/2 mt-2" />
							</CardHeader>
							<CardContent>
								<div className="h-4 bg-muted rounded w-full" />
							</CardContent>
						</Card>
					))}
				</div>
			) : filteredMindmaps.length === 0 ? (
				<Card className="border-dashed">
					<CardContent className="flex flex-col items-center justify-center py-16">
						<Map className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-semibold mb-2">
							{searchTerm
								? "Nenhum mapa mental encontrado"
								: "Nenhum mapa mental ainda"}
						</h3>
						<p className="text-muted-foreground text-center mb-4 max-w-sm">
							{searchTerm
								? "Tente buscar por outro termo"
								: "Crie seu primeiro mapa mental para visualizar os fluxos de trabalho da empresa"}
						</p>
						{!searchTerm && (
							<Button onClick={() => setIsCreateOpen(true)} className="gap-2">
								<Plus className="h-4 w-4" />
								Criar Mapa Mental
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredMindmaps.map((mindmap) => (
						<Card
							key={mindmap.id}
							className="group cursor-pointer hover:shadow-md transition-shadow"
							onClick={() => router.push(`/mapas-mentais/${mindmap.id}`)}
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="flex-1 min-w-0">
										<CardTitle className="text-lg truncate">
											{mindmap.title}
										</CardTitle>
										{mindmap.description && (
											<CardDescription className="mt-1 line-clamp-2">
												{mindmap.description}
											</CardDescription>
										)}
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger
											asChild
											onClick={(e) => e.stopPropagation()}
										>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={(e) => {
													e.stopPropagation();
													router.push(`/mapas-mentais/${mindmap.id}`);
												}}
											>
												<Edit2 className="mr-2 h-4 w-4" />
												Editar
											</DropdownMenuItem>
											<DropdownMenuItem
												className="text-destructive"
												onClick={(e) => {
													e.stopPropagation();
													setDeleteId(mindmap.id);
												}}
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Excluir
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-4 text-sm text-muted-foreground">
									<div className="flex items-center gap-1">
										<Map className="h-4 w-4" />
										<span>{mindmap.nodes?.length || 0} nós</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										<span>
											{formatDistanceToNow(new Date(mindmap.updated_at), {
												addSuffix: true,
												locale: ptBR,
											})}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir mapa mental?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta ação não pode ser desfeita. O mapa mental será
							permanentemente excluído.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Excluindo..." : "Excluir"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
