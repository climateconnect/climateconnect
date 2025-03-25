import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TuneIcon from "@mui/icons-material/Tune";
import React, { useContext, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FilterSearchBar from "../filter/FilterSearchBar";
import { BrowseTab } from "../../types";
import { FilterContext } from "../context/FilterContext";

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
    inputLabel: {
      color: "black !important",
      borderColor: "black !important",
    },
    icon: {
      color: theme.palette.background.default_contrastText,
    },
  };
});

type Props = {
  filtersExpanded: boolean;
  onSubmit: Function;
  setFiltersExpanded: Function;
  type: BrowseTab;
  customSearchBarLabels: any;
  hideFilterButton: boolean;
  applyBackgroundColor: boolean;
};

export default function FilterSection({
  filtersExpanded,
  onSubmit,
  setFiltersExpanded,
  type,
  customSearchBarLabels,
  hideFilterButton,
  applyBackgroundColor,
}: Props) {
  const classes = useStyles({
    applyBackgroundColor: applyBackgroundColor,
  });
  const { locale } = useContext(UserContext);
  const { filters } = useContext(FilterContext);
  const [value, setValue] = useState(filters.search || "");

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

  const handleChangeValue = (e) => {
    e.preventDefault();
    setValue(e.target.value);
  };

  return (
    <>
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
              filtersExpanded ? (
                <HighlightOffIcon className={classes.icon} />
              ) : (
                <TuneIcon className={classes.icon} />
              )
            }
          >
            Filter
          </Button>
        )}
      </div>
    </>
  );
}
