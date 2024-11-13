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
import { BrowseTabs, FilterChoices } from "../../types";
import {
  getFiltersFromSearchString,
  getInitialFilters,
} from "../../../public/lib/filterOperations";

interface MakeStylesProps {
  applyBackgroundColor?: boolean;
}

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

  // styles
  applyBackgroundColor: boolean;

  //deprecated
  //TODO: remove when Tutorial is removed
  filterButtonRef?: any;

  // errorMessage state
  errorMessage: any;

  // initial values for filters (ssr)
  initialLocationFilter: any;

  // TODO: rename to filterOption Definition
  filterChoices: FilterChoices;

  // Location Filter stuff // TODO: refactor them as well
  handleSetLocationOptionsOpen: (bool: boolean) => void;
  locationInputRefs: any;
  locationOptionsOpen: any;
};

export default function FilterSection({
  type,
  customSearchBarLabels,
  // TODO: remove filterButtonRef if the tutorial is removed
  filterButtonRef,
  applyBackgroundColor,
  // FilterContent Dependencies
  errorMessage,
  // filters,
  filterChoices, // TODO: rename to filterOptionDefinitions
  initialLocationFilter,

  // handleApplyNewFilters,
  handleSetLocationOptionsOpen,
  locationInputRefs,
  locationOptionsOpen,
}: Props) {
  const classes = useStyles({
    applyBackgroundColor: applyBackgroundColor,
  });
  const { locale } = useContext(UserContext);

  // Additional Filters Visibility
  const isMobileScreenSize = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const isSmallScreenSize = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  // Attention: this default will be overwritten by the use Effect hook:
  // If isSmallScreenSize then false, otherwise true
  // Reason: On mobile filters take up the whole screen, so they aren't expanded by default
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

  // #############################################################
  // load initial filters from URL
  //
  // Idea: maybe a custom use hook would suit this case:
  // e.g. useFilters() that returns the filters and nonFilters states
  // but deals with the inital load?
  // #############################################################

  const ret = getFiltersFromSearchString(type, window.location.search, filterChoices, locale);
  const filtersFromURL = ret.filters;
  const nonFiltersFromURL = ret.nonFilters;
  const initialEmptyFilters = getInitialFilters({
    filterChoices: filterChoices,
    locale: locale,
    initialLocationFilter: initialLocationFilter,
  });

  // filters State
  const [filters, setFilters] = useState({ ...initialEmptyFilters, ...filtersFromURL });

  const handleAddFiltersByMerging = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // other URL params
  const [nonFilterParams, setNonFilterParams] = useState(nonFiltersFromURL);

  const handleOnSumbitSearchBar = (searchValue: string) => {
    // setting a value via
    // > filters.search = searchValue;
    // does not work, as
    // the filters reference is not changing => useEffect will not run

    // TODO: shouldn't this be a merge? (technically it is already a merge :D)
    const updatedFilters = { ...filters, search: searchValue };
    setFilters(updatedFilters);
  };

  const handleUpdateFilters = (updatedFilters: any) => {
    // TODO: shouldn't this be a merge?
    // currently it works, but I am not sure where the merge is performed
    setFilters(updatedFilters);
  };

  // TODO (Karol): closeFilters is unused, did I miss something during refactoring?
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

      // TODO: refactor with react-router after upgrade
      const urlChangeEvent = new CustomEvent("urlChange", {});
      window.dispatchEvent(urlChangeEvent);

      return true;
    }
    return false;
  };

  useEffect(() => {
    console.debug("[FilterSection]: Filters changed => applying to URL");
    applyNewFiltersToUrl({
      type,
      newFilters: filters,
      closeFilters: false,
      nonFilterParams: {},
    });
  }, [filters]);

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
            type={type}
            onSubmit={handleOnSumbitSearchBar}
            initialValue={filters?.search ?? ""}
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
          handleUpdateFilters={handleUpdateFilters}
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
