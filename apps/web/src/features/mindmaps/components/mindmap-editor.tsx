import type { Connection, Node, NodeTypes } from "@xyflow/react";
import {
	addEdge,
	Background,
	BackgroundVariant,
	Controls,
	MarkerType,
	MiniMap,
	Panel,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/base-ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@acme/ui/base-ui/dialog";
import { Input } from "@acme/ui/base-ui/input";
import { Label } from "@acme/ui/base-ui/label";
import { schema } from "@acme/zen-v3/zenstack/schema";
import { Link, useNavigate } from "@tanstack/react-router";
import { useClientQueries } from "@zenstackhq/tanstack-query/react";
import { ArrowLeft, Edit2, Plus, Save, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MindMapNode } from "./mindmap-node";

const nodeColors = [
	{ name: "Azul", value: "#3b82f6" },
	{ name: "Verde", value: "#22c55e" },
	{ name: "Amarelo", value: "#eab308" },
	{ name: "Vermelho", value: "#ef4444" },
	{ name: "Roxo", value: "#a855f7" },
	{ name: "Rosa", value: "#ec4899" },
	{ name: "Laranja", value: "#f97316" },
	{ name: "Ciano", value: "#06b6d4" },
];

const nodeTypes: NodeTypes = {
	mindMapNode: MindMapNode,
};

type MindmapEditorProps = {
	mindmapId: string;
};

export function MindmapEditor({ mindmapId }: MindmapEditorProps) {
	const client = useClientQueries(schema);
	const navigate = useNavigate();
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [isSaving, setIsSaving] = useState(false);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [isEditNodeOpen, setIsEditNodeOpen] = useState(false);
	const [editNodeLabel, setEditNodeLabel] = useState("");
	const [editNodeColor, setEditNodeColor] = useState("#3b82f6");
	const hasChanges = useRef(false);

	const { data: mindmap, isLoading } = client.mindmap.useFindUnique(
		{
			where: { id: mindmapId },
		},
		{
			enabled: !!mindmapId,
		},
	);

	useEffect(() => {
		if (mindmap) {
			const loadedNodes = Array.isArray(mindmap.nodes) ? mindmap.nodes : [];
			const loadedEdges = Array.isArray(mindmap.edges) ? mindmap.edges : [];
			setNodes(loadedNodes as Node[]);
			setEdges(loadedEdges);
			hasChanges.current = false;
		}
	}, [mindmap, setNodes, setEdges]);

	const { mutate: updateMindmap } = client.mindmap.useUpdate({
		optimisticUpdate: true,
		onSuccess: () => {
			hasChanges.current = false;
			toast.success("Mapa mental salvo com sucesso!");
		},
		onError: (error) => {
			toast.error(`Erro ao salvar mapa mental: ${error.message}`);
		},
	});

	const onConnect = useCallback(
		(params: Connection) => {
			hasChanges.current = true;
			setEdges((eds) =>
				addEdge(
					{
						...params,
						type: "smoothstep",
						animated: true,
						markerEnd: { type: MarkerType.ArrowClosed },
					},
					eds,
				),
			);
		},
		[setEdges],
	);

	const handleNodesChange = useCallback(
		(changes: unknown[]) => {
			hasChanges.current = true;
			onNodesChange(changes);
		},
		[onNodesChange],
	);

	const handleEdgesChange = useCallback(
		(changes: unknown[]) => {
			hasChanges.current = true;
			onEdgesChange(changes);
		},
		[onEdgesChange],
	);

	const handleSave = async () => {
		if (!mindmap) return;
		setIsSaving(true);
		try {
			updateMindmap({
				data: { nodes, edges },
				where: { id: mindmap.id },
			});
		} catch (error) {
			console.error("Error saving mindmap:", error);
			toast.error("Erro ao salvar mapa mental");
		} finally {
			setIsSaving(false);
		}
	};

	const handleAddNode = () => {
		const newId = `node-${Date.now()}`;
		const newNode: Node = {
			id: newId,
			type: "mindMapNode",
			position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
			data: { label: "Novo Nó", color: "#3b82f6" },
		};
		hasChanges.current = true;
		setNodes((nds) => [...nds, newNode]);
	};

	const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
		setSelectedNode(node);
	}, []);

	const handleEditNode = () => {
		if (!selectedNode) return;
		setEditNodeLabel(selectedNode.data.label);
		setEditNodeColor(selectedNode.data.color || "#3b82f6");
		setIsEditNodeOpen(true);
	};

	const handleSaveNodeEdit = () => {
		if (!selectedNode) return;
		hasChanges.current = true;
		setNodes((nds) =>
			nds.map((node) =>
				node.id === selectedNode.id
					? {
							...node,
							data: {
								...node.data,
								label: editNodeLabel,
								color: editNodeColor,
							},
						}
					: node,
			),
		);
		setIsEditNodeOpen(false);
		setSelectedNode(null);
	};

	const handleDeleteNode = () => {
		if (!selectedNode) return;
		hasChanges.current = true;
		setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
		setEdges((eds) =>
			eds.filter(
				(edge) =>
					edge.source !== selectedNode.id && edge.target !== selectedNode.id,
			),
		);
		setSelectedNode(null);
	};

	if (isLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
			</div>
		);
	}

	if (!mindmap) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold">Mapa mental não encontrado</h2>
					<p className="text-muted-foreground mt-2">
						O mapa mental que você está procurando não existe ou foi removido.
					</p>
					<Button asChild className="mt-4" variant="outline">
						<Link to="/mindmaps">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Voltar para mapas mentais
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col overflow-hidden">
			<div className="bg-background flex shrink-0 items-center justify-between border-b px-4 py-3">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate({ to: "/mindmaps" })}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-lg font-bold">{mindmap.title}</h1>
						{mindmap.description && (
							<p className="text-muted-foreground text-xs">
								{mindmap.description}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleAddNode}
						className="gap-2 bg-transparent"
					>
						<Plus className="h-4 w-4" />
						Adicionar Nó
					</Button>
					<Button
						size="sm"
						onClick={handleSave}
						disabled={isSaving}
						className="gap-2"
					>
						<Save className="h-4 w-4" />
						{isSaving ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</div>

			<div className="relative flex-1">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={handleNodesChange}
					onEdgesChange={handleEdgesChange}
					onConnect={onConnect}
					onNodeClick={handleNodeClick}
					nodeTypes={nodeTypes}
					fitView
					deleteKeyCode={["Backspace", "Delete"]}
					className="bg-gray-50"
				>
					<Controls />
					<MiniMap
						nodeColor={(node) => node.data.color || "#3b82f6"}
						maskColor="rgba(0,0,0,0.1)"
					/>
					<Background variant={BackgroundVariant.Dots} gap={20} size={1} />

					{selectedNode && (
						<Panel
							position="top-right"
							className="bg-background rounded-lg border p-3 shadow-lg"
						>
							<div className="flex items-center gap-2">
								<span className="max-w-[150px] truncate text-sm font-medium">
									{selectedNode.data.label}
								</span>
								<Button variant="outline" size="icon" onClick={handleEditNode}>
									<Edit2 className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									className="text-destructive bg-transparent"
									onClick={handleDeleteNode}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</Panel>
					)}
				</ReactFlow>
			</div>

			<Dialog open={isEditNodeOpen} onOpenChange={setIsEditNodeOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar Nó</DialogTitle>
						<DialogDescription>Altere o texto e a cor do nó</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="node-label">Texto</Label>
							<Input
								id="node-label"
								value={editNodeLabel}
								onChange={(e) => setEditNodeLabel(e.target.value)}
								placeholder="Digite o texto do nó"
							/>
						</div>
						<div className="space-y-2">
							<Label>Cor</Label>
							<div className="flex flex-wrap gap-2">
								{nodeColors.map((color) => (
									<button
										key={color.value}
										type="button"
										className={cn(
											"h-8 w-8 rounded-full border-2 transition-all",
											editNodeColor === color.value
												? "border-primary ring-primary/30 ring-2"
												: "border-transparent",
										)}
										style={{ backgroundColor: color.value }}
										onClick={() => setEditNodeColor(color.value)}
										title={color.name}
									/>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditNodeOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSaveNodeEdit}>Salvar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
