import { cn } from "@acme/ui";
import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

interface MindMapNodeData {
  label: string;
  color?: string;
}

export function MindMapNode({ data, selected }: NodeProps<MindMapNodeData>) {
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
        className="!h-3 !w-3 !border-2 !border-gray-400 !bg-white"
        position={Position.Top}
        type="target"
      />
      <span className="font-medium text-sm">{data.label}</span>
      <Handle
        className="!h-3 !w-3 !border-2 !border-gray-400 !bg-white"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}
