import { createContext } from "react";

const FeedbackContext = createContext<{
  message?: string | null;
  showFeedbackMessage?: (params: {
    message: string;
    promptLogIn?: boolean;
    action?: React.ReactNode;
    newHash?: string;
    error?: boolean;
    success?: boolean;
  }) => void;
  handleUpdateHash?: (newHash: string) => void;
}>({ message: null });

export default FeedbackContext;
