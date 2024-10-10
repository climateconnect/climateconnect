import { Button, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TuneIcon from "@mui/icons-material/Tune";
import React, { useContext, useEffect, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FilterSearchBar from "../filter/FilterSearchBar";
import FilterContent from "../filter/FilterContent";
import getFilters from "../../../public/data/possibleFilters";
import { getFilterUrl } from "../../../public/lib/urlOperations";
import { getInfoMetadataByType } from "../../../public/lib/parsingOperations";
import { BrowseTabs } from "../../types";
import { getInitialFilters } from "../../../public/lib/filterOperations";

type MakeStylesProps = {
  applyBackgroundColor?: boolean;
};

const useStyles = makeStyles((theme) => {
  return {
    filterButton: (props: MakeStylesProps) => ({
      borderColor: "#707070",
      height: 40,
      background: props.applyBackgroundColor ? "rgba(255, 255, 255, 0.9)" : "default",
    }),
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
    filterSearchbar: (props: MakeStylesProps) => ({
      marginRight: theme.spacing(2),
      width: "100%",
      maxWidth: 650,
      margin: "0 auto",
      borderColor: "#000",
      background: props.applyBackgroundColor ? "rgba(255, 255, 255, 0.9)" : "default",
    }),
    filterSectionTabsWithContent: {
      marginBottom: theme.spacing(3),
    },
    inputLabel: {
      color: "black !important",
      borderColor: "black !important",
    },
    tabContent: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  };
});

type Props = {
  // current page
  type: BrowseTabs;

  // customize search text
  customSearchBarLabels?: any;

  // handlers
  onSubmit: Function;

  // styles
  applyBackgroundColor: boolean;

  //deprecated
  //TODO: remove when Tutorial is removed
  filterButtonRef?: any;

  // FilterContent Dependencies:
  errorMessage: any;
  filters: any;
  filterChoices: any;
  handleSetLocationOptionsOpen: (bool: boolean) => void;
  initialLocationFilter: any;
  locationInputRefs: any;
  locationOptionsOpen: any;
  nonFilterParams: any;
  handleUpdateFilterValues: any;
  // new / after refactoring
  initalFilters?: any;
};

export default function FilterSection({
  onSubmit,
  type,
  customSearchBarLabels,
  // TODO: remove filterButtonRef if the tutorial is removed
  filterButtonRef,
  applyBackgroundColor,
  // FilterContent Dependencies
  errorMessage,
  // filters,
  filterChoices,
  // handleApplyNewFilters,
  handleSetLocationOptionsOpen,
  handleUpdateFilterValues,
  initialLocationFilter,
  locationInputRefs,
  locationOptionsOpen,
  nonFilterParams,
  initalFilters,
}: Props) {
  const classes = useStyles({
    applyBackgroundColor: applyBackgroundColor,
  });
  const { locale } = useContext(UserContext);

  // ##########################
  // Additional Filters Visibility
  // ##########################

  const isMobileScreenSize = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const isSmallScreenSize = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  // Attention: this default will be overwritten by the use Effect hook
  // Defaults: isSmallScreenSize => false, otherwise true
  // On mobile filters take up the whole screen, so they aren't expanded by default

  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const onClickExpandFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const unexpandFilters = () => {
    setFiltersExpanded(false);
  };

  useEffect(() => {
    if (isMobileScreenSize || isSmallScreenSize) {
      setFiltersExpanded(false);
    } else {
      setFiltersExpanded(true);
    }
  }, [isMobileScreenSize]);

  // ##########################
  // Filter Search Bar
  // ##########################

  const [searchValue, setSearchValue] = useState(initalFilters?.search ?? "");

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

  const handleChangeValue = (e) => {
    e.preventDefault();
    setSearchValue(e.target.value);
  };
  // #############################################################
  // Experiments: "noone" actually needs to share information about the state
  // state is saved in the urls searchbar and the searchparams are just passed down to the server
  // or is there an issue?
  // #############################################################

  const [filters, setFiters] = useState(
    getInitialFilters({
      filterChoices: filterChoices,
      locale: locale,
      initialLocationFilter: initialLocationFilter,
    })
  );
  const handleUpdateFilters = (updatedFilters: any) => {
    setFiters(updatedFilters);
  };

  const addFilter = (filter: string, value: string) => {};

  const applyNewFiltersToUrl = ({ type, newFilters, closeFilters, nonFilterParams }) => {
    const newUrl = getFilterUrl({
      activeFilters: newFilters,
      infoMetadata: getInfoMetadataByType(type),
      filterChoices: filterChoices,
      locale: locale,
      nonFilterParams: nonFilterParams,
    });

    // update url only if it differs from the current url
    if (newUrl !== window?.location?.href) {
      window.history.pushState({}, "", newUrl);

      // TODO: refactor into a custom lib function
      const urlChangeEvent = new CustomEvent("urlChange", {});
      window.dispatchEvent(urlChangeEvent);

      return true;
    }
    return false;
  };
  // #############################################################
  // #############################################################
  // #############################################################

  return (
    <div /*TODO(undefined) className={classes.filterSection} */>
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
            value={searchValue}
            onChange={handleChangeValue}
          />
        </div>
        <Button
          variant="outlined"
          color="grey"
          className={classes.filterButton}
          onClick={onClickExpandFilters}
          startIcon={
            filtersExpanded ? <HighlightOffIcon color="primary" /> : <TuneIcon color="primary" />
          }
          ref={filterButtonRef}
        >
          {/* TODO: put into texts */}
          {filtersExpanded ? "Hide filters" : "Show more filters"}
        </Button>
      </div>
      {filtersExpanded && (
        <FilterContent
          applyFilters={applyNewFiltersToUrl}
          className={classes.tabContent}
          errorMessage={errorMessage}
          filters={filters}
          filtersExpanded={filtersExpanded}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleUpdateFilters={applyNewFiltersToUrl}
          initialLocationFilter={initialLocationFilter}
          locationInputRef={locationInputRefs[type]}
          locationOptionsOpen={locationOptionsOpen}
          nonFilterParams={nonFilterParams}
          possibleFilters={getFilters({
            key: type,
            filterChoices: filterChoices,
            locale: locale,
          })}
          type={type}
          unexpandFilters={unexpandFilters}
        />
      )}
    </div>
  );
}
