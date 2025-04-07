import { createContext } from "react";

interface FilterContextType {
  filters: any;
  tabsWhereFiltersWereApplied: any[];
  errorMessage: string;
  handleSetErrorMessage: (newMessage: any) => void;
  handleAddFilters: (newFilters: any) => void;
  handleSetTabsWhereFiltersWereApplied: (tabs: any) => void;
  handleApplyNewFilters: ({
    type,
    newFilters,
    closeFilters,
  }: {
    type: any;
    newFilters: any;
    closeFilters: any;
  }) => Promise<{
    closeFilters: any;
    filteredItemsObject: any;
    newUrlEnding: string;
  } | null>;
  handleUpdateFilterValues: (valuesToUpdate: any) => void;
}

export const FilterContext = createContext<FilterContextType>(null!); // it will break directly if not provided
