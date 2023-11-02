import { createContext } from "react";

const BrowseContext = createContext<{
  projectTypes?: any;
}>({});

export default BrowseContext;
