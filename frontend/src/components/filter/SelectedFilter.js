import { Chip, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => {
  return {
    selectedBlock: {
      display: "inline-flex",
      alignItems: "center",
      marginBottom: theme.spacing(1),
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

export default function SelectedFilter({
  filterKey,
  currentFilters,
  possibleFilters,
  handleUnselectFilter,
}) {
  const classes = useStyles();
  let currentFilterValues = currentFilters[filterKey];
  const possibleFilterKeys = possibleFilters.map((entry) => entry.key);
  // Get the metadata associated with the filter (e.g. what type it is, like "Category")
  const filterMetadata = possibleFilters.find((f) => f.key === filterKey);
  //When the location is a string the filter is not submitted yet (the user is just typing)
  //Therefore only show location as a selected filter if it's an object
  if (filterMetadata?.type === "location" && typeof currentFilterValues !== "object") {
    return <></>;
  }
  if (filterMetadata?.type === "select") {
    return <></>;
  }
  if (filterKey === "search") {
    return <></>;
  }
  if (!currentFilterValues || !currentFilterValues.length) {
    return <></>;
  }

  if (!Array.isArray(currentFilterValues)) {
    currentFilterValues = [currentFilterValues];
  }

  return (
    <div key={filterKey} className={classes.selectedBlock}>
      {/* Handle strings like "Energy" as being selected too */}
      {possibleFilterKeys.includes(filterKey) &&
        currentFilterValues.map((filter) => (
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
