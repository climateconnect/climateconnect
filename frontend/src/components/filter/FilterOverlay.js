import React from "react";
import { Dialog, Button } from "@material-ui/core";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { makeStyles } from '@material-ui/core/styles';
import GenericDialog from '../dialogs/GenericDialog';

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
  unexpandFilters
}) {
  const classes = useStyles();
  const onClose = () => {
    console.log('test')
    unexpandFilters();
  }

  return (
    <GenericDialog
      fullScreen 
      open={filtersExpanded} 
      useApplyButton
      applyText="Apply filters"
      onClose={onClose}
    >
      test
    </GenericDialog>
    );
}
