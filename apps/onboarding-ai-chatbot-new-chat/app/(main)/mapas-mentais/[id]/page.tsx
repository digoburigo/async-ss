"use client";

import {
	addEdge,
	Background,
	BackgroundVariant,
	type Connection,
	Controls,
	Handle,
	MarkerType,
	MiniMap,
	type Node,
	type NodeTypes,
	Panel,
	Position,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Edit2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

interface MindMapNodeData {
	label: string;
	color?: string;
}

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

function MindMapNode({
	data,
	selected,
}: {
	data: MindMapNodeData;
	selected: boolean;
}) {
	const bgColor = data.color || "#3b82f6";

	return (
		<div
			className={cn(
				"px-4 py-2 rounded-lg shadow-md border-2 transition-all min-w-[120px] text-center",
				selected
					? "border-primary ring-2 ring-primary/30"
					: "border-transparent",
			)}
			style={{ backgroundColor: bgColor, color: "#fff" }}
		>
			<Handle
				type="target"
				position={Position.Top}
				className="!bg-white !border-2 !border-gray-400 !w-3 !h-3"
			/>
			<span className="font-medium text-sm">{data.label}</span>
			<Handle
				type="source"
				position={Position.Bottom}
				className="!bg-white !border-2 !border-gray-400 !w-3 !h-3"
			/>
		</div>
	);
}

const nodeTypes: NodeTypes = {
	mindMapNode: MindMapNode,
};

export default function MindMapEditorPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [mindmap, setMindmap] = useState<{
		id: string;
		title: string;
		description: string;
	} | null>(null);
	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);
	const [isEditNodeOpen, setIsEditNodeOpen] = useState(false);
	const [editNodeLabel, setEditNodeLabel] = useState("");
	const [editNodeColor, setEditNodeColor] = useState("#3b82f6");
	const hasChanges = useRef(false);

	useEffect(() => {
		fetchMindmap();
	}, [id]);

	const fetchMindmap = async () => {
		try {
			const response = await fetch(`/api/mindmaps/${id}`);
			if (!response.ok) {
				if (response.status === 404) {
					toast.error("Mapa mental não encontrado");
					router.push("/mapas-mentais");
					return;
				}
				throw new Error("Failed to fetch mindmap");
			}
			const data = await response.json();
			setMindmap({
				id: data.id,
				title: data.title,
				description: data.description,
			});
			setNodes(data.nodes || []);
			setEdges(data.edges || []);
		} catch (error) {
			console.error("Error fetching mindmap:", error);
			toast.error("Erro ao carregar mapa mental");
		} finally {
			setIsLoading(false);
		}
	};

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
		(changes: any) => {
			hasChanges.current = true;
			onNodesChange(changes);
		},
		[onNodesChange],
	);

	const handleEdgesChange = useCallback(
		(changes: any) => {
			hasChanges.current = true;
			onEdgesChange(changes);
		},
		[onEdgesChange],
	);

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch(`/api/mindmaps/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ nodes, edges }),
			});

			if (!response.ok) throw new Error("Failed to save mindmap");

			hasChanges.current = false;
			toast.success("Mapa mental salvo com sucesso!");
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
			<div className="flex items-center justify-center h-[calc(100vh-64px)]">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!mindmap) {
		return null;
	}

	return (
		<div className="h-[calc(100vh-64px)] flex flex-col">
			<div className="flex items-center justify-between p-4 border-b bg-background">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/mapas-mentais")}
					>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-xl font-bold">{mindmap.title}</h1>
						{mindmap.description && (
							<p className="text-sm text-muted-foreground">
								{mindmap.description}
							</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleAddNode}
						className="gap-2 bg-transparent"
					>
						<Plus className="h-4 w-4" />
						Adicionar Nó
					</Button>
					<Button onClick={handleSave} disabled={isSaving} className="gap-2">
						<Save className="h-4 w-4" />
						{isSaving ? "Salvando..." : "Salvar"}
					</Button>
				</div>
			</div>

			<div className="flex-1">
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
							className="bg-background border rounded-lg p-3 shadow-lg"
						>
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium truncate max-w-[150px]">
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
										className={cn(
											"w-8 h-8 rounded-full border-2 transition-all",
											editNodeColor === color.value
												? "border-primary ring-2 ring-primary/30"
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
