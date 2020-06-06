import React from "react";
import { Typography, Chip, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    selectedBlock: {
      display: "inline-flex",
      alignItems: "center",
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(4),
      flexWrap: "wrap"
    },
    selectedToolTip: {
      marginRight: theme.spacing(1)
    },
    selectedChip: {
      margin: theme.spacing(1)
    }
  };
});

export default function SelectedFilters({ currentFilters, possibleFilters, handleUnselectFilter }) {
  const classes = useStyles();
  const hasFilters = Object.keys(currentFilters).reduce((hasFilters, filter) => {
    if (currentFilters[filter] && currentFilters[filter].length) hasFilters = true;
    return hasFilters;
  }, false);
  return (
    <div>
      {hasFilters && <Typography>Selected Filters</Typography>}
      {Object.keys(currentFilters).map(key => {
        if (
          currentFilters[key] &&
          Array.isArray(currentFilters[key]) &&
          currentFilters[key].length
        ) {
          const filterMetadata = possibleFilters.find(f => f.key === key);
          return (
            <div key={key} className={classes.selectedBlock}>
              <Tooltip title={filterMetadata.title} className={classes.selectedToolTip}>
                <filterMetadata.icon />
              </Tooltip>
              {currentFilters[key].map(filter => (
                <Chip
                  className={classes.selectedChip}
                  key={filter}
                  label={filter}
                  onDelete={() => handleUnselectFilter(filter, filterMetadata.key)}
                />
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}
