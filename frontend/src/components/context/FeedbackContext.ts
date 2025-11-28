"use client";

import { createContext } from "react";

const FeedbackContext = createContext<{
  message?: string | null;
  showFeedbackMessage?: any;
  handleUpdateHash?: any;
}>({ message: null });

export default FeedbackContext;
