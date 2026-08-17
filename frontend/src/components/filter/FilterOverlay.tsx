import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import { FilterContext } from "../context/FilterContext";
import UserContext from "../context/UserContext";
import GenericDialog from "../dialogs/GenericDialog";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";

const useStyles = makeStyles((theme) => ({
  resetButtonRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

export default function FilterOverlay({
  activeFilterCount,
  draftFilters,
  draftSelectedItems,
  errorMessage,
  filtersExpanded,
  handleClickDialogClose,
  handleClickDialogOpen,
  handleResetDraftFilters,
  handleSetLocationOptionsOpen,
  handleStagedApply,
  handleStagedDialogSave,
  handleStagedUnselectFilter,
  handleStagedValueChange,
  locationInputRef,
  locationOptionsOpen,
  open,
  possibleFilters,
  setDraftSelectedItems,
  unexpandFilters,
}) {
  const classes = useStyles();
  const originalContext = useContext(FilterContext);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });

  const onClose = () => {
    unexpandFilters();
  };

  const draftContext = {
    ...originalContext,
    filters: draftFilters,
  };

  return (
    <GenericDialog
      activeFilterCount={activeFilterCount}
      applyText={texts.apply_filters}
      fullScreen
      onApply={handleStagedApply}
      onClose={onClose}
      open={filtersExpanded ? filtersExpanded : false}
      title={texts.filters}
      topBarFixed
      useApplyButton
    >
      <FilterContext.Provider value={draftContext}>
        <Filters
          errorMessage={errorMessage}
          handleApplyFilters={handleStagedApply}
          handleClickDialogClose={handleClickDialogClose}
          handleClickDialogOpen={handleClickDialogOpen}
          handleClickDialogSave={handleStagedDialogSave}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleValueChange={handleStagedValueChange}
          isInOverlay
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          open={open}
          possibleFilters={possibleFilters}
          selectedItems={draftSelectedItems}
          setSelectedItems={setDraftSelectedItems}
        />
        <SelectedFilters
          handleUnselectFilter={handleStagedUnselectFilter}
          possibleFilters={possibleFilters}
        />
      </FilterContext.Provider>
      <div className={classes.resetButtonRow}>
        <Button variant="outlined" color="primary" onClick={handleResetDraftFilters}>
          {texts.clear_all || "Clear all"}
        </Button>
      </div>
    </GenericDialog>
  );
}
