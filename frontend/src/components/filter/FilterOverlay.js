import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
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
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  return (
    <GenericDialog
      applyText={texts.apply_filters}
      fullScreen
      onApply={handleApplyFilters}
      onClose={onClose}
      open={filtersExpanded ? filtersExpanded : false}
      title={texts.filters}
      topBarFixed
      useApplyButton
    >
      <Filters
        currentFilters={currentFilters}
        errorMessage={errorMessage}
        handleApplyFilters={handleApplyFilters}
        handleClickDialogClose={handleClickDialogClose}
        handleClickDialogOpen={handleClickDialogOpen}
        handleClickDialogSave={handleClickDialogSave}
        handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
        handleValueChange={handleValueChange}
        isInOverlay
        locationInputRef={locationInputRef}
        locationOptionsOpen={locationOptionsOpen}
        open={open}
        possibleFilters={possibleFilters}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
      {/* We pass currentFilters like this because if location is not an array, 
      a change in it doesn't cause a rerender and therefore the location chip is not shown */}
      <SelectedFilters
        currentFilters={Object.keys(currentFilters).reduce(function (obj, curKey) {
          obj[curKey] = currentFilters[curKey];
          if (curKey === "location" && typeof currentFilters[curKey] === "object")
            obj[curKey] = [currentFilters[curKey]];
          return obj;
        }, {})}
        handleUnselectFilter={handleUnselectFilter}
        possibleFilters={possibleFilters}
      />
    </GenericDialog>
  );
}
