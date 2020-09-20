import React from "react";
import { Button, makeStyles } from "@material-ui/core";
import TuneIcon from "@material-ui/icons/Tune";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import FilterSearchBar from "../filter/FilterSearchBar";

const useStyles = makeStyles(theme => {
  return {
    filterButton: {
      borderColor: "#707070",
      height: 40
    },
    rightSidePlaceholder: {
      width: 100
    },
    filterSectionFirstLine: {
      display: "flex",
      marginBottom: theme.spacing(2),
      maxWidth: 650,
      margin: "0 auto",
      justifyContent: "center"
    },
    searchBarContainer: {
      display: "flex",
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    filterSearchbar: {
      marginRight: theme.spacing(2),
      width: "100%",
      maxWidth: 650,
      margin: "0 auto",
      borderColor: "#000"
    },
    filterSectionTabsWithContent: {
      marginBottom: theme.spacing(3)
    },
    inputLabel: {
      color: "black !important",
      borderColor: "black !important"
    }
  };
});

const searchBarLabels = {
  projects: "Search for climate action projects",
  organizations: "Search for organizations fighting climate change",
  members: "Search for people active against climate change"
};

const buildUrlEndingFromSearch = searchValue => {
  return "&search=" + searchValue;
};

export default function FilterSection({
  filtersExpanded,
  setFiltersExpanded,
  typesByTabValue,
  tabValue,
  getProjects,
  getOrganizations,
  getMembers,
  membersWithAdditionalInfo,
  token,
  state,
  setState
}) {
  const classes = useStyles();
  const [searchFilters, setSearchFilters] = React.useState({
    projects: "",
    members: "",
    organizations: ""
  });

  const InputLabelClasses = {
    root: classes.inputLabel,
    notchedOutline: classes.inputLabel
  };

  const onClickExpandFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const onSearchValueChange = (type, newValue) => {
    setSearchFilters({ ...searchFilters, [type]: newValue });
  };

  const onSearchSubmit = async type => {
    const newUrlEnding = buildUrlEndingFromSearch(searchFilters[type]);
    if (state.urlEnding[type] != newUrlEnding) {
      try {
        let filteredItemsObject;
        if (type === "projects") filteredItemsObject = await getProjects(1, token, newUrlEnding);
        else if (type === "organizations")
          filteredItemsObject = await getOrganizations(1, token, newUrlEnding);
        else if (type === "members") {
          console.log("type is members!");
          filteredItemsObject = await getMembers(1, token, newUrlEnding);
          console.log(filteredItemsObject);
          filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members);
        } else {
          console.log("cannot find type!");
        }
        setState({
          ...state,
          items: { ...state.items, [type]: filteredItemsObject[type] },
          hasMore: { ...state.hasMore, [type]: filteredItemsObject.hasMore },
          urlEnding: { ...state.urlEnding, [type]: newUrlEnding },
          nextPages: { ...state.nextPages, [type]: 2 }
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <div className={classes.filterSection}>
      <div className={classes.filterSectionFirstLine}>
        <div className={classes.searchBarContainer}>
          <FilterSearchBar
            type={typesByTabValue[tabValue]}
            label={searchBarLabels[typesByTabValue[tabValue]]}
            className={classes.filterSearchbar}
            onSubmit={onSearchSubmit}
            onChange={onSearchValueChange}
            value={searchFilters[typesByTabValue[tabValue]]}
            InputLabelClasses={InputLabelClasses}
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
