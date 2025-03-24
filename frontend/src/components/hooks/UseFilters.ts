import { useContext } from "react";
import { FilterContext } from "../context/FilterContext";

// Custom hook for using the filter context
export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
