import React from "react";
import { Typography, Chip, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {
  return {
    selectedBlock: {
      display: "inline-flex",
      alignItems: "center",
      marginBottom: theme.spacing(1),
      marginRight: theme.spacing(4),
      flexWrap: "wrap",
    },
    selectedToolTip: {
      marginRight: theme.spacing(1),
    },
    selectedChip: {
      margin: theme.spacing(1),
    },
  };
});

export default function SelectedFilters({ currentFilters, possibleFilters, handleUnselectFilter }) {
  const classes = useStyles();

  // debugger;
  // Only show the "Selected Filters" title if there's at least one filter.
  // TODO: should probably refactor this to use .any
  const hasFilters = Object.keys(currentFilters).reduce((hasFilters, filter) => {
    if (currentFilters[filter] && currentFilters[filter].length) {
      hasFilters = true;
    }
    return hasFilters;
  }, false);

  return (
    <div>
      {hasFilters && <Typography>Selected Filters</Typography>}

      {/* Mapping over every filter...  */}
      {Object.keys(currentFilters).map((key) => {
        let currentFilterValue = currentFilters[key];

        if (!currentFilterValue || !currentFilterValue.length) {
          return null;
        }

        // TODO(piper): why does it have to be an array?
        // Only render the chip if the filter is an array
        // if (
        //   // &&
        //   // Array.isArray(currentFilterValue) &&
        //   // currentFilterValue.length
        // ) {

        if (Array.isArray(currentFilterValue)) {
          //
        } else {
          currentFilterValue = [currentFilterValue];
        }

        // Get the metadata associated with the filter (e.g. all the "Category")
        // data
        const filterMetadata = possibleFilters.find((f) => f.key === key);

        return (
          <div key={key} className={classes.selectedBlock}>
            {/* Icons */}
            <Tooltip title={filterMetadata.title} className={classes.selectedToolTip}>
              <filterMetadata.icon />
            </Tooltip>
            {/* Handle strings like "Energy" as being selected too */}
            {/* TODO: fix this  */}
            {currentFilterValue.map((filter) => (
              <Chip
                className={classes.selectedChip}
                key={filter}
                label={filter}
                onDelete={() => handleUnselectFilter(filter, filterMetadata.key)}
              />
            ))}
          </div>
        );
        // }
      })}
    </div>
  );
}
