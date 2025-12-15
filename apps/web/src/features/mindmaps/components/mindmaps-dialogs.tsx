import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@acme/ui/base-ui/sheet";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { useNavigate } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { toast } from "sonner";

import { authClient } from "~/clients/auth-client";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { MindmapForm } from "./mindmap-form";
import { useMindmaps } from "./mindmaps-provider";

export function MindmapsDialogs() {
	const { open, setOpen, currentMindmap, setCurrentMindmap } = useMindmaps();
	const client = useClientQueries(schema);
	const navigate = useNavigate();
	const { data: session } = authClient.useSession();
	const { data: activeOrganization } = authClient.useActiveOrganization();

	// Mindmap mutations with optimistic updates
	const { mutate: createMindmap, isPending: isCreatingMindmap } =
		client.mindmap.useCreate({
			optimisticUpdate: true,
			onSuccess: (data) => {
				toast.success("Mapa mental criado com sucesso");
				setOpen(null);
				navigate({
					to: "/mindmaps/$mindmapId",
					params: { mindmapId: data.id },
				});
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	const { mutate: updateMindmap, isPending: isUpdatingMindmap } =
		client.mindmap.useUpdate({
			optimisticUpdate: true,
			onSuccess: () => {
				toast.success("Mapa mental atualizado com sucesso");
				setOpen(null);
				setTimeout(() => {
					setCurrentMindmap(null);
				}, 500);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		});

	const { mutateAsync: deleteMindmap } = client.mindmap.useDelete({
		optimisticUpdate: true,
		onSuccess: () => {
			toast.success("Mapa mental excluído com sucesso");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	// Mindmap handlers
	const handleMindmapSubmit = async (data: {
		title: string;
		description?: string;
	}) => {
		if (!session?.user?.id || !activeOrganization?.id) {
			toast.error("Por favor, faça login e selecione uma organização");
			return;
		}

		if (currentMindmap) {
			updateMindmap({
				data: {
					title: data.title,
					description: data.description || null,
				},
				where: { id: currentMindmap.id },
			});
		} else {
			// Create initial node
			const initialNodes = [
				{
					id: "1",
					type: "mindMapNode",
					position: { x: 400, y: 300 },
					data: { label: data.title, color: "#3b82f6" },
				},
			];

			createMindmap({
				data: {
					title: data.title,
					description: data.description || null,
					userId: session.user.id,
					nodes: initialNodes,
					edges: [],
					viewport: { x: 0, y: 0, zoom: 1 },
				},
			});
		}
	};

	const handleDeleteMindmap = async () => {
		if (!currentMindmap) return;
		await deleteMindmap({ where: { id: currentMindmap.id } });
		setOpen(null);
		setTimeout(() => {
			setCurrentMindmap(null);
		}, 500);
	};

	return (
		<>
			{/* Mindmap Dialogs */}
			<Sheet
				open={open === "create-mindmap" || open === "update-mindmap"}
				onOpenChange={(v) => {
					if (!v) {
						setOpen(null);
						if (!currentMindmap) {
							setTimeout(() => {
								setCurrentMindmap(null);
							}, 500);
						}
					}
				}}
			>
				<SheetContent className="flex flex-col">
					<SheetHeader className="text-start">
						<SheetTitle>
							{currentMindmap ? "Editar" : "Criar"} Mapa Mental
						</SheetTitle>
						<SheetDescription>
							{currentMindmap
								? "Atualize as informações do mapa mental."
								: "Crie um novo mapa mental para visualizar fluxos de trabalho"}
						</SheetDescription>
					</SheetHeader>
					<div className="flex-1 overflow-y-auto px-4 py-6">
						<MindmapForm
							defaultValues={
								currentMindmap
									? {
											title: currentMindmap.title,
											description: currentMindmap.description ?? undefined,
										}
									: undefined
							}
							onSubmit={handleMindmapSubmit}
							isSubmitting={isCreatingMindmap || isUpdatingMindmap}
						/>
					</div>
				</SheetContent>
			</Sheet>

			{currentMindmap && (
				<ConfirmDialog
					destructive
					open={open === "delete-mindmap"}
					onOpenChange={(v) => {
						if (!v) {
							setOpen(null);
							setTimeout(() => {
								setCurrentMindmap(null);
							}, 500);
						}
					}}
					handleConfirm={handleDeleteMindmap}
					className="max-w-md"
					title={`Excluir mapa mental: ${currentMindmap.title}?`}
					desc={
						<>
							Você está prestes a excluir o mapa mental{" "}
							<strong>{currentMindmap.title}</strong>. <br />
							Esta ação não pode ser desfeita.
						</>
					}
					confirmText="Excluir"
				/>
			)}
		</>
	);
}
