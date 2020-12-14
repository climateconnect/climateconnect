import React from "react";
import { Button, makeStyles } from "@material-ui/core";
import TuneIcon from "@material-ui/icons/Tune";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";

import FilterSearchBar from "../filter/FilterSearchBar";

const useStyles = makeStyles((theme) => {
  return {
    filterButton: {
      borderColor: "#707070",
      height: 40,
    },
    rightSidePlaceholder: {
      width: 100,
    },
    filterSectionFirstLine: {
      display: "flex",
      marginBottom: theme.spacing(2),
      maxWidth: 650,
      margin: "0 auto",
      justifyContent: "center",
    },
    searchBarContainer: {
      display: "flex",
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    filterSearchbar: {
      marginRight: theme.spacing(2),
      width: "100%",
      maxWidth: 650,
      margin: "0 auto",
      borderColor: "#000",
    },
    filterSectionTabsWithContent: {
      marginBottom: theme.spacing(3),
    },
    inputLabel: {
      color: "black !important",
      borderColor: "black !important",
    },
  };
});

const searchBarLabels = {
  projects: "Search for climate action projects",
  organizations: "Search for organizations fighting climate change",
  members: "Search for people active against climate change",
};

export default function FilterSection({ filtersExpanded, onSubmit, setFiltersExpanded, type }) {
  const classes = useStyles();

  const InputLabelClasses = {
    root: classes.inputLabel,
    notchedOutline: classes.inputLabel,
  };

  const onClickExpandFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <div className={classes.filterSection}>
      <div className={classes.filterSectionFirstLine}>
        <div className={classes.searchBarContainer}>
          <FilterSearchBar
            className={classes.filterSearchbar}
            InputLabelClasses={InputLabelClasses}
            label={searchBarLabels[type]}
            // Pass submit handler through to
            // the underlying search bar.
            onSubmit={onSubmit}
            type={type}
          />
        </div>
        <Button
          variant="outlined"
          className={classes.filterButton}
          onClick={onClickExpandFilters}
          startIcon={
            filtersExpanded ? <HighlightOffIcon color="primary" /> : <TuneIcon color="primary" />
          }
        >
          Filter
        </Button>
      </div>
    </div>
  );
}
