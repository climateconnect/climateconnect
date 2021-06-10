import { Button, makeStyles } from "@material-ui/core";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import TuneIcon from "@material-ui/icons/Tune";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
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

export default function FilterSection({
  filtersExpanded,
  onSubmit,
  setFiltersExpanded,
  type,
  customSearchBarLabels,
  filterButtonRef,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale });
  const searchBarLabels = {
    projects: texts.search_projects,
    organizations: texts.search_organizations,
    members: texts.search_active_people,
  };

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
            label={customSearchBarLabels ? customSearchBarLabels[type] : searchBarLabels[type]}
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
          ref={filterButtonRef}
        >
          Filter
        </Button>
      </div>
    </div>
  );
}
