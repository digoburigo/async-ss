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
        "min-w-[120px] rounded-lg border-2 px-4 py-2 text-center shadow-md transition-all",
        selected
          ? "border-primary ring-2 ring-primary/30"
          : "border-transparent"
      )}
      style={{ backgroundColor: bgColor, color: "#fff" }}
    >
      <Handle
        className="!bg-white !border-2 !border-gray-400 !w-3 !h-3"
        position={Position.Top}
        type="target"
      />
      <span className="font-medium text-sm">{data.label}</span>
      <Handle
        className="!bg-white !border-2 !border-gray-400 !w-3 !h-3"
        position={Position.Bottom}
        type="source"
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
          eds
        )
      );
    },
    [setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      hasChanges.current = true;
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      hasChanges.current = true;
      onEdgesChange(changes);
    },
    [onEdgesChange]
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
          : node
      )
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
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    );
    setSelectedNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!mindmap) {
    return null;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/mapas-mentais")}
            size="icon"
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-xl">{mindmap.title}</h1>
            {mindmap.description && (
              <p className="text-muted-foreground text-sm">
                {mindmap.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="gap-2 bg-transparent"
            onClick={handleAddNode}
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Adicionar Nó
          </Button>
          <Button className="gap-2" disabled={isSaving} onClick={handleSave}>
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          className="bg-gray-50"
          deleteKeyCode={["Backspace", "Delete"]}
          edges={edges}
          fitView
          nodes={nodes}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          onEdgesChange={handleEdgesChange}
          onNodeClick={handleNodeClick}
          onNodesChange={handleNodesChange}
        >
          <Controls />
          <MiniMap
            maskColor="rgba(0,0,0,0.1)"
            nodeColor={(node) => node.data.color || "#3b82f6"}
          />
          <Background gap={20} size={1} variant={BackgroundVariant.Dots} />

          {selectedNode && (
            <Panel
              className="rounded-lg border bg-background p-3 shadow-lg"
              position="top-right"
            >
              <div className="flex items-center gap-2">
                <span className="max-w-[150px] truncate font-medium text-sm">
                  {selectedNode.data.label}
                </span>
                <Button onClick={handleEditNode} size="icon" variant="outline">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  className="bg-transparent text-destructive"
                  onClick={handleDeleteNode}
                  size="icon"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      <Dialog onOpenChange={setIsEditNodeOpen} open={isEditNodeOpen}>
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
                onChange={(e) => setEditNodeLabel(e.target.value)}
                placeholder="Digite o texto do nó"
                value={editNodeLabel}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {nodeColors.map((color) => (
                  <button
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      editNodeColor === color.value
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent"
                    )}
                    key={color.value}
                    onClick={() => setEditNodeColor(color.value)}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsEditNodeOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSaveNodeEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
