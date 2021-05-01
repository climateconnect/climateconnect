import React from "react";

import GenericDialog from "../dialogs/GenericDialog";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";

export default function FilterOverlay({
  currentFilters,
  errorMessage,
  filtersExpanded,
  handleApplyFilters,
  handleClickDialogClose,
  handleClickDialogOpen,
  handleClickDialogSave,
  handleSetLocationOptionsOpen,
  handleUnselectFilter,
  handleValueChange,
  locationInputRef,
  locationOptionsOpen,
  open,
  possibleFilters,
  selectedItems,
  setSelectedItems,
  unexpandFilters,
}) {
  const onClose = () => {
    unexpandFilters();
  };
  return (
    <GenericDialog
      applyText="Apply filters"
      fullScreen
      onApply={handleApplyFilters}
      onClose={onClose}
      open={filtersExpanded ? filtersExpanded : false}
      title="Filters"
      topBarFixed
      useApplyButton
    >
      <Filters
        possibleFilters={possibleFilters}
        handleApplyFilters={handleApplyFilters}
        handleValueChange={handleValueChange}
        currentFilters={currentFilters}
        handleClickDialogOpen={handleClickDialogOpen}
        open={open}
        handleClickDialogClose={handleClickDialogClose}
        handleClickDialogSave={handleClickDialogSave}
        isInOverlay
        selectedItems={selectedItems}
        // I believe this is only being used with the - MultiLevelSelectDialog?
        setSelectedItems={setSelectedItems}
        locationInputRef={locationInputRef}
        locationOptionsOpen={locationOptionsOpen}
        handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        errorMessage={errorMessage}
      />

      <SelectedFilters
        currentFilters={currentFilters}
        possibleFilters={possibleFilters}
        handleUnselectFilter={handleUnselectFilter}
      />
    </GenericDialog>
  );
}
