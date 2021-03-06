import React, { useCallback } from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import theme from "../../themes/theme";
import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";
import { persistFiltersInURL } from "../../../public/lib/urlOperations";
import { remove, update, merge } from "lodash";

export default function FilterContent({
  applyFilters,
  className,
  errorMessage,
  filtersExpanded,
  handleSetLocationOptionsOpen,
  locationInputRef,
  locationOptionsOpen,
  possibleFilters,
  type,
  unexpandFilters,
}) {
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("xs", "md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const possibleFiltersFirstHalf = possibleFilters.slice(0, Math.ceil(possibleFilters.length / 2));
  const possibleFiltersSecondHalf = possibleFilters.slice(
    Math.ceil(possibleFilters.length / 2),
    possibleFilters.length
  );

  const router = useRouter();

  // debugger;

  // TODO(piper): we combine the filters together from the
  // query param and.
  // Some types are arrays, need to handle appropriately

  const reducedPossibleFilters = possibleFilters.reduce((map, obj) => {
    if (obj.type === "multiselect") {
      map[obj.key] = [];
    } else {
      map[obj.key] = "";
    }
    return map;
  }, {});

  // for (key, value in Object.entries(reducedPossibleFilters))
  //   if (key === )
  // })

  // TODO: order here matters? And need to respect array types.
  let test = merge({}, reducedPossibleFilters);
  let test2 = merge(test, router.query);

  let initialFilters = test2;

  // initialFilters["status"].push("In test progress");

  //   // ...router.query,
  //   ...reducedPossibleFilters,
  // };

  // console.warn("test");
  // console.log(router.query);

  const [currentFilters, setCurrentFilters] = React.useState(initialFilters);

  console.warn("hi");

  console.log(currentFilters);

  const [open, setOpen] = React.useState({});

  const [selectedItems, setSelectedItems] = React.useState(
    possibleFilters.reduce((map, obj) => {
      if (obj.type === "openMultiSelectDialogButton") map[obj.key] = [];
      return map;
    }, {})
  );

  const handleClickDialogOpen = (prop) => {
    if (!open.prop) {
      setOpen({ ...open, [prop]: true });
    } else setOpen({ ...open, [prop]: !open[prop] });
  };

  const handleClickDialogClose = (prop, results) => {
    // TODO(piper): on "Save" of the dialog, we should
    // fetch new results, update URL, etc.

    if (results) {
      const updatedFilters = { ...currentFilters, [prop]: results.map((x) => x.name) };
      setCurrentFilters(updatedFilters);
      // console.log(currentFilters);
      console.warn("here");
      debugger;
      console.log(currentFilters);
      applyFilters(type, updatedFilters, isSmallScreen);
    }

    setOpen({ ...open, [prop]: false });
  };

  const handleValueChange = (key, newValue) => {
    // TODO(piper): we want to update and fetch data on any value change
    const updatedFilters = { ...currentFilters, [key]: newValue };
    // debugger;
    applyFilters(type, updatedFilters, isSmallScreen);
    setCurrentFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    applyFilters(type, currentFilters, isSmallScreen);
  };

  const handleUnselectFilter = (filterName, filterKey) => {
    const updatedFilters = {
      ...currentFilters,
      [filterKey]: currentFilters[filterKey].filter((f) => f !== filterName),
    };

    // When dismissing a selected filter chip, we also want to update the
    // window state to reflect the currently active filters, and fetch
    // the updated data from the server
    // persistFiltersInURL(updatedFilters);
    applyFilters(type, updatedFilters, isSmallScreen);

    setCurrentFilters(updatedFilters);

    if (selectedItems[filterKey]) {
      setSelectedItems({
        ...selectedItems,
        [filterKey]: selectedItems[filterKey].filter((i) => i.name !== filterName),
      });
    }
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
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            errorMessage={errorMessage}
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
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            errorMessage={errorMessage}
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
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
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
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          errorMessage={errorMessage}
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
