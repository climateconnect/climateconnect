import React from "react";
import { Chip } from "@material-ui/core";
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

  // TODO: should probably refactor this to use .any
  const hasFilters = Object.keys(currentFilters).reduce((hasFilters, filter) => {
    if (currentFilters[filter] && currentFilters[filter].length) {
      hasFilters = true;
    }
    return hasFilters;
  }, false);

  if (!hasFilters) {
    return null;
  }

  return (
    <React.Fragment>
      {/* Now render a selected "Chip" component for every currently selected filter */}
      {Object.keys(currentFilters).map((key) => {
        let currentFilterValues = currentFilters[key];

        if (!currentFilterValues || !currentFilterValues.length) {
          return null;
        }

        if (!Array.isArray(currentFilterValues)) {
          currentFilterValues = [currentFilterValues];
        }

        // Get the metadata associated with the filter (e.g. all the "Category") data
        const filterMetadata = possibleFilters.find((f) => f.key === key);
        return (
          <div key={key} className={classes.selectedBlock}>
            {/* Handle strings like "Energy" as being selected too */}
            {currentFilterValues.map((filter) => (
              <Chip
                className={classes.selectedChip}
                key={filter}
                label={filter}
                onDelete={() => handleUnselectFilter(filter, filterMetadata.key)}
              />
            ))}
          </div>
        );
      })}
    </React.Fragment>
  );
}
