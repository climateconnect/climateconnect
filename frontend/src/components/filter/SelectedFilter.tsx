import { Chip, Tooltip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { getLocationFilterKeys } from "../../../public/data/locationFilters";

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
  const locationFilterKeys = getLocationFilterKeys();
  const possibleFilterKeys = possibleFilters.map((entry) => entry.key);
  // Get the metadata associated with the filter (e.g. what type it is, like "Category")
  const filterMetadata = possibleFilters.find((f) => f.key === filterKey);
  //When the location is a string the filter is not submitted yet (the user is just typing)
  //Therefore only show location as a selected filter if it's an object
  if (filterMetadata?.type === "location") {
    if (typeof currentFilterValues !== "object" || locationFilterKeys.includes(filterKey)) {
      return <></>;
    }
  }
  if (filterMetadata?.type === "select") {
    return <></>;
  }
  if (filterKey === "search") {
    return <></>;
  }
  if (
    !currentFilterValues ||
    (typeof currentFilterValues !== "object" && !currentFilterValues.length)
  ) {
    return <></>;
  }

  if (!Array.isArray(currentFilterValues)) {
    currentFilterValues = [currentFilterValues];
  }
  return (
    <div key={filterKey} className={classes.selectedBlock}>
      {/* Handle strings like "Energy" as being selected too */}
      {possibleFilterKeys.includes(filterKey) &&
        currentFilterValues.map((filter) => {
          /*the location filter either has the 'name' or 'simple_name' prop set
          depending on whether it was caught as the initial location or not*/
          const filterName =
            typeof filter === "object" ? (filter.name ? filter.name : filter.simple_name) : filter;
          return (
            <Tooltip title={filterMetadata.title} key={filterName}>
              <Chip
                icon={<filterMetadata.icon name={filterMetadata.iconName} />}
                className={classes.selectedChip}
                label={filterName}
                color="secondary"
                onDelete={() => handleUnselectFilter(filter, filterMetadata.key)}
              />
            </Tooltip>
          );
        })}
    </div>
  );
}
