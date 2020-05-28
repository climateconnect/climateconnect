import React from "react";
import { Dialog, Button } from "@material-ui/core";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { makeStyles } from '@material-ui/core/styles';
import GenericDialog from '../dialogs/GenericDialog';
import Filters from './Filters';
import SelectedFilters from './SelectedFilters';

const useStyles = makeStyles(theme => {
  return {
    filterButton: {
      borderColor: "#707070",
      height: 40
    }
  }
})

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
  handleUnselectFilter
}) {
  const classes = useStyles();
  const onClose = () => {
    unexpandFilters();
  }
  return (
    <GenericDialog
      fullScreen 
      open={filtersExpanded?filtersExpanded:false} 
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
      />
      <SelectedFilters
        currentFilters={currentFilters}
        possibleFilters={possibleFilters}
        handleUnselectFilter={handleUnselectFilter}
      />
    </GenericDialog>
    );
}
