import React from "react";

export type FilterType =
  | "text"
  | "select"
  | "multiselect"
  | "openMultiSelectDialogButton"
  | "location";

export interface FilterOption {
  name: string;
  value: string | number;
}

export interface ShowIfCondition {
  key: string;
  value: any;
}

export interface BaseFilter {
  key: string;
  title: string;
  icon: any; // React component
  type: FilterType;
  tooltipText?: string;
  showIf?: ShowIfCondition;
}

export interface TextFilter extends BaseFilter {
  type: "text";
}

export interface SelectFilter extends BaseFilter {
  type: "select" | "multiselect";
  options: FilterOption[];
}

export interface MultiSelectDialogFilter extends BaseFilter {
  type: "openMultiSelectDialogButton";
  options: any[];
  itemType: string;
}

export interface LocationFilter extends BaseFilter {
  type: "location";
}

export type Filter = TextFilter | SelectFilter | MultiSelectDialogFilter | LocationFilter;

export interface FiltersProps {
  errorMessage?: string;
  handleClickDialogClose: (_key: string) => void;
  handleClickDialogOpen: (_key: string) => void;
  handleClickDialogSave: (_key: string, _items: any[]) => void;
  handleSetLocationOptionsOpen: (_open: boolean) => void;
  handleValueChange: (_key: string, _value: any) => void;
  isInOverlay?: boolean;
  justifyContent?: string;
  locationInputRef: React.RefObject<any>;
  locationOptionsOpen: boolean;
  open: Record<string, boolean>;
  possibleFilters: Filter[];
  selectedItems: Record<string, any[]>;
  setSelectedItems: (_items: Record<string, any[]>) => void;
}
