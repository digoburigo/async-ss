import type { CitizenFeedback } from "@acme/zen-v3/zenstack/models";
import React, { useState } from "react";

import useDialogState from "~/hooks/use-dialog-state";

type FeedbackDialogType = "create" | "update" | "delete" | "view" | "status";

type FeedbackContextType = {
  open: FeedbackDialogType | null;
  setOpen: (str: FeedbackDialogType | null) => void;
  currentRow: CitizenFeedback | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<CitizenFeedback | null>>;
};

const FeedbackContext = React.createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<FeedbackDialogType>(null);
  const [currentRow, setCurrentRow] = useState<CitizenFeedback | null>(null);

  return (
    <FeedbackContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => {
  const feedbackContext = React.useContext(FeedbackContext);

  if (!feedbackContext) {
    throw new Error("useFeedback has to be used within <FeedbackProvider>");
  }

  return feedbackContext;
};
