import { createContext } from "react";

// Default to not loading anything
const LoadingContext = createContext({ spinning: false });

export default LoadingContext;
