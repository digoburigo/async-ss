import type { Mindmap } from "@acme/zen-v3/zenstack/models";
import React, { useState } from "react";

import useDialogState from "~/hooks/use-dialog-state";

type MindmapDialogType = "create-mindmap" | "update-mindmap" | "delete-mindmap";

type MindmapsContextType = {
	open: MindmapDialogType | null;
	setOpen: (str: MindmapDialogType | null) => void;
	currentMindmap: Mindmap | null;
	setCurrentMindmap: React.Dispatch<React.SetStateAction<Mindmap | null>>;
};

const MindmapsContext = React.createContext<MindmapsContextType | null>(null);

export function MindmapsProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useDialogState<MindmapDialogType>(null);
	const [currentMindmap, setCurrentMindmap] = useState<Mindmap | null>(null);

	return (
		<MindmapsContext.Provider
			value={{
				open,
				setOpen,
				currentMindmap,
				setCurrentMindmap,
			}}
		>
			{children}
		</MindmapsContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMindmaps = () => {
	const mindmapsContext = React.useContext(MindmapsContext);

	if (!mindmapsContext) {
		throw new Error("useMindmaps has to be used within <MindmapsProvider>");
	}

	return mindmapsContext;
};
