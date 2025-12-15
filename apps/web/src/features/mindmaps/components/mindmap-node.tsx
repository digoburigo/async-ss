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
					? "border-primary ring-primary/30 ring-2"
					: "border-transparent",
			)}
			style={{ backgroundColor: bgColor, color: "#fff" }}
		>
			<Handle
				type="target"
				position={Position.Top}
				className="!h-3 !w-3 !border-2 !border-gray-400 !bg-white"
			/>
			<span className="text-sm font-medium">{data.label}</span>
			<Handle
				type="source"
				position={Position.Bottom}
				className="!h-3 !w-3 !border-2 !border-gray-400 !bg-white"
			/>
		</div>
	);
}
