import React from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import theme from "../../themes/theme";
import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";

export default function FilterContent({
  type,
  className,
  applyFilters,
  possibleFilters,
  filtersExpanded,
  unexpandFilters
}) {
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xs", "md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const possibleFiltersFirstHalf = possibleFilters.slice(0, Math.ceil(possibleFilters.length / 2));
  const possibleFiltersSecondHalf = possibleFilters.slice(
    Math.ceil(possibleFilters.length / 2),
    possibleFilters.length
  );

  const [currentFilters, setCurrentFilters] = React.useState(
    possibleFilters.reduce((map, obj) => {
      if (obj.type === "multiselect") map[obj.key] = [];
      else map[obj.key] = "";
      return map;
    }, {})
  );

  const [open, setOpen] = React.useState({});

  const [selectedItems, setSelectedItems] = React.useState(
    possibleFilters.reduce((map, obj) => {
      if (obj.type === "openMultiSelectDialogButton") map[obj.key] = [];
      return map;
    }, {})
  );

  const handleClickDialogOpen = prop => {
    if (!open.prop) {
      setOpen({ ...open, [prop]: true });
    } else setOpen({ ...open, [prop]: !open[prop] });
  };

  const handleClickDialogClose = (prop, results) => {
    if (results) {
      setCurrentFilters({ ...currentFilters, [prop]: results.map(x => x.name) });
    }
    setOpen({ ...open, [prop]: false });
  };

  const handleValueChange = (key, newValue) => {
    setCurrentFilters({ ...currentFilters, [key]: newValue });
  };

  const handleApplyFilters = () => {
    applyFilters(type, currentFilters, isSmallScreen);
  };

  const handleUnselectFilter = (filterName, filterKey) => {
    setCurrentFilters({
      ...currentFilters,
      [filterKey]: currentFilters[filterKey].filter(f => f !== filterName)
    });
    console.log(selectedItems);
    console.log(filterName);
    console.log(filterKey);
    if (selectedItems[filterKey])
      setSelectedItems({
        ...selectedItems,
        [filterKey]: selectedItems[filterKey].filter(i => i.name !== filterName)
      });
  };
  return (
    <div className={className}>
      {isSmallScreen ? (
        <>
          <FilterOverlay
            possibleFilters={possibleFilters}
            handleApplyFilters={handleApplyFilters}
            handleValueChange={handleValueChange}
            currentFilters={currentFilters}
            withApplyButton={true}
            handleClickDialogOpen={handleClickDialogOpen}
            open={open}
            handleClickDialogClose={handleClickDialogClose}
            filtersExpanded={filtersExpanded}
            unexpandFilters={unexpandFilters}
            handleUnselectFilter={handleUnselectFilter}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </>
      ) : isMediumScreen && possibleFilters.length > 3 ? (
        <>
          <Filters
            possibleFilters={possibleFiltersFirstHalf}
            handleApplyFilters={handleApplyFilters}
            handleValueChange={handleValueChange}
            currentFilters={currentFilters}
            handleClickDialogOpen={handleClickDialogOpen}
            open={open}
            handleClickDialogClose={handleClickDialogClose}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
          <Filters
            possibleFilters={possibleFiltersSecondHalf}
            handleApplyFilters={handleApplyFilters}
            handleValueChange={handleValueChange}
            currentFilters={currentFilters}
            withApplyButton={true}
            applyButtonFixedWidth={true}
            handleClickDialogOpen={handleClickDialogOpen}
            open={open}
            handleClickDialogClose={handleClickDialogClose}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </>
      ) : (
        <Filters
          possibleFilters={possibleFilters}
          handleApplyFilters={handleApplyFilters}
          handleValueChange={handleValueChange}
          currentFilters={currentFilters}
          withApplyButton={true}
          handleClickDialogOpen={handleClickDialogOpen}
          open={open}
          handleClickDialogClose={handleClickDialogClose}
          justifyContent={type === "projects" ? "space-around" : "flex-start"}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      )}
      {
        <SelectedFilters
          currentFilters={currentFilters}
          possibleFilters={possibleFilters}
          handleUnselectFilter={handleUnselectFilter}
        />
      }
    </div>
  );
}
