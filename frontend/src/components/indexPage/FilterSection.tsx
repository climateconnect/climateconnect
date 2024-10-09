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
  onSubmit: Function;
  type?: any;
  customSearchBarLabels?: any;
  filterButtonRef?: any;
  searchValue?: any;
  hideFilterButton?: boolean;
  applyBackgroundColor?: boolean;

  // FilterContent Dependencies:
  errorMessage: any;
  filters: any;
  filterChoices: any;
  handleApplyNewFilters: (newFilters: any) => void;
  handleUpdateFilterValues: (valuesToUpdate: any) => void;
  handleSetLocationOptionsOpen: (bool: boolean) => void;
  initialLocationFilter: any;
  locationInputRefs: any;
  locationOptionsOpen: any;
  nonFilterParams: any;
};

export default function FilterSection({
  onSubmit,
  type,
  customSearchBarLabels,
  filterButtonRef,
  searchValue,
  hideFilterButton,
  applyBackgroundColor,
  // FilterContent Dependencies
  errorMessage,
  filters,
  filterChoices,
  handleApplyNewFilters,
  handleSetLocationOptionsOpen,
  handleUpdateFilterValues,
  initialLocationFilter,
  locationInputRefs,
  locationOptionsOpen,
  nonFilterParams,
}: Props) {
  const classes = useStyles({
    applyBackgroundColor: applyBackgroundColor,
  });
  const { locale } = useContext(UserContext);
  const isMobileScreenSize = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const isSmallScreenSize = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  // State
  const [value, setValue] = useState(searchValue);

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

  useEffect(
    function () {
      setValue(searchValue);
    },
    [searchValue]
  );
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
    setValue(e.target.value);
  };

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
            value={value}
            onChange={handleChangeValue}
          />
        </div>
        {!hideFilterButton && (
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
        )}
      </div>
      {filtersExpanded && (
        <FilterContent
          applyFilters={handleApplyNewFilters}
          className={classes.tabContent}
          errorMessage={errorMessage}
          filters={filters}
          filtersExpanded={filtersExpanded}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleUpdateFilters={handleUpdateFilterValues}
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
