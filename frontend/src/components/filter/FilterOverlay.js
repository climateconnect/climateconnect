import React from "react";
import GenericDialog from "../dialogs/GenericDialog";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";

export default function FilterOverlay({
  filtersExpanded,
  unexpandFilters,
  possibleFilters,
  handleApplyFilters,
  handleValueChange,
  currentFilters,
  handleClickDialogOpen,
  open,
  handleClickDialogClose,
  handleUnselectFilter,
  selectedItems,
  setSelectedItems
}) {
  const onClose = () => {
    unexpandFilters();
  };
  return (
    <GenericDialog
      fullScreen
      open={filtersExpanded ? filtersExpanded : false}
      useApplyButton
      applyText="Apply filters"
      onClose={onClose}
      title="Filters"
      onApply={handleApplyFilters}
      topBarFixed
    >
      <Filters
        possibleFilters={possibleFilters}
        handleApplyFilters={handleApplyFilters}
        handleValueChange={handleValueChange}
        currentFilters={currentFilters}
        handleClickDialogOpen={handleClickDialogOpen}
        open={open}
        handleClickDialogClose={handleClickDialogClose}
        isInOverlay
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      <SelectedFilters
        currentFilters={currentFilters}
        possibleFilters={possibleFilters}
        handleUnselectFilter={handleUnselectFilter}
      />
    </GenericDialog>
  );
}
