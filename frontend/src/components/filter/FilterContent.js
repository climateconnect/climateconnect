import React from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";
import theme from "../../themes/theme";
import { flatten } from "lodash";

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

  const reducedPossibleFilters = possibleFilters.reduce((map, obj) => {
    // Handle initializing to an array for multiselects, otherwise an empty string
    if (obj.type === "multiselect" || obj.type === "openMultiSelectDialogButton") {
      map[obj.key] = [];
    } else {
      map[obj.key] = "";
    }

    return map;
  }, {});

  // Combine the filters together from current filters
  // that are present in the query param in the URL.  Some
  // types are arrays and expected as such
  // downstream; need to handle appropriately both on initiailization
  // and when merging in parameters from query param
  const router = useRouter();
  Object.entries(router.query).forEach(([key, value]) => {
    // Handle specific types
    if (Array.isArray(reducedPossibleFilters[key])) {
      // Handle string values too. If there's something set, and it's strings concat'd -
      // we need to make an array out of them
      if (value && value.indexOf(",") > 0) {
        const splitItems = value.split(",");
        reducedPossibleFilters[key] = [...splitItems];
      } else {
        reducedPossibleFilters[key] = value;
      }
    } else if (typeof reducedPossibleFilters[key] === "string") {
      // Handle string values too. If there's something set, and it's strings concat'd -
      // we need to make an array out of them
      if (value && value.indexOf(",") > 0) {
        const splitItems = value.split(",");
        reducedPossibleFilters[key] = [...splitItems];
      } else {
        reducedPossibleFilters[key] = value;
      }
    }
  });

  const [open, setOpen] = React.useState({});
  const [currentFilters, setCurrentFilters] = React.useState(reducedPossibleFilters);

  /**
   * Util to return all potential items associated with
   * a given selected filter. Traverses itemsToChooseFrom, and sub categories
   * associated with that filter.
   */
  const findAllItems = (currentPossibleFilter, filtersToCheck) => {
    // Immediately just return the initial filter
    // if we don't need to traverse subcategories or other items to choose from
    if (!currentPossibleFilter.itemsToChooseFrom) {
      return currentPossibleFilter;
    }

    // Ensure we've accurate set membership, and iterate over all items to choose from...
    let items = [];
    currentPossibleFilter.itemsToChooseFrom.forEach((item) => {
      if (filtersToCheck.has(item.name)) {
        items.push(item);
      }

      // Check for subcategories as well
      item?.subcategories.forEach((subcategory) => {
        if (filtersToCheck.has(subcategory.name)) {
          items.push(subcategory);
        }
      });
    });

    return items;
  };

  const [selectedItems, setSelectedItems] = React.useState(
    // For initially selected items (from the query param), we want
    // to also propagate the complete filter object through
    // to the selected items, beyond just the "name" property. The
    // possibleFilters array includes other properties and
    // metadata (like icon, iconName, title, etc.) beyond what we persist
    // in the query params.
    possibleFilters.reduce((accumulator, currentPossibleFilter) => {
      if (currentPossibleFilter.type === "openMultiSelectDialogButton") {
        if (currentFilters && currentFilters[currentPossibleFilter.key]) {
          // Ensure the membership collection is built with an array if it's a single string
          // like "energy" for "category"
          let filtersToCheck;
          if (Array.isArray(currentFilters[currentPossibleFilter.key])) {
            filtersToCheck = new Set(currentFilters[currentPossibleFilter.key]);
          } else {
            filtersToCheck = new Set([currentFilters[currentPossibleFilter.key]]);
          }

          // If we currently have a filter set (e.g. category), then
          // make sure we search through the possible sub items associated
          // with that filter (e.g. itemsToChooseFrom, and subcategories)
          const potentialItems = findAllItems(currentPossibleFilter, filtersToCheck);
          accumulator[currentPossibleFilter.key] = potentialItems;
        } else {
          accumulator[currentPossibleFilter.key] = [];
        }
      }

      return accumulator;
    }, {})
  );

  const handleClickDialogOpen = (prop) => {
    if (!open.prop) {
      setOpen({ ...open, [prop]: true });
    } else setOpen({ ...open, [prop]: !open[prop] });
  };

  const handleClickDialogClose = (prop, results) => {
    if (results) {
      const updatedFilters = { ...currentFilters, [prop]: results.map((x) => x.name) };
      setCurrentFilters(updatedFilters);
      applyFilters(type, updatedFilters, isSmallScreen);
    }

    setOpen({ ...open, [prop]: false });
  };

  const handleValueChange = (key, newValue) => {
    const updatedFilters = { ...currentFilters, [key]: newValue };
    applyFilters(type, updatedFilters, isSmallScreen);
    setCurrentFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    applyFilters(type, currentFilters, isSmallScreen);
  };

  /**
   * Reapplies filters based on two given strings: the
   * name of the filter (e.g. "Energy") and its
   * key (e.g. "category").
   */
  const handleUnselectFilter = (filterName, filterKey) => {
    // Ensure that the filtered value is an array, e.g.
    // we can't filter on a raw string like "Energy".
    if (!Array.isArray(currentFilters[filterKey])) {
      currentFilters[filterKey] = [currentFilters[filterKey]];
    }

    const prunedFilters = currentFilters[filterKey].filter((f) => f !== filterName);
    const updatedFilters = {
      ...currentFilters,
      [filterKey]: prunedFilters,
    };

    // When dismissing a selected filter chip, we also want to update the
    // window state to reflect the currently active filters, and fetch
    // the updated data from the server
    applyFilters(type, updatedFilters, isSmallScreen);
    setCurrentFilters(updatedFilters);

    // Also re-select items
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
            currentFilters={currentFilters}
            errorMessage={errorMessage}
            filtersExpanded={filtersExpanded}
            handleApplyFilters={handleApplyFilters}
            handleClickDialogClose={handleClickDialogClose}
            handleClickDialogOpen={handleClickDialogOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            handleUnselectFilter={handleUnselectFilter}
            handleValueChange={handleValueChange}
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            open={open}
            possibleFilters={possibleFilters}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            unexpandFilters={unexpandFilters}
          />
        </>
      ) : isMediumScreen && possibleFilters.length > 3 ? (
        <>
          <Filters
            currentFilters={currentFilters}
            errorMessage={errorMessage}
            handleApplyFilters={handleApplyFilters}
            handleClickDialogClose={handleClickDialogClose}
            handleClickDialogOpen={handleClickDialogOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            handleValueChange={handleValueChange}
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            open={open}
            possibleFilters={possibleFiltersFirstHalf}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
          <Filters
            currentFilters={currentFilters}
            handleApplyFilters={handleApplyFilters}
            handleClickDialogClose={handleClickDialogClose}
            handleClickDialogOpen={handleClickDialogOpen}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            handleValueChange={handleValueChange}
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            open={open}
            possibleFilters={possibleFiltersSecondHalf}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
          />
        </>
      ) : (
        <Filters
          currentFilters={currentFilters}
          errorMessage={errorMessage}
          handleApplyFilters={handleApplyFilters}
          handleClickDialogClose={handleClickDialogClose}
          handleClickDialogOpen={handleClickDialogOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleValueChange={handleValueChange}
          justifyContent={type === "projects" ? "space-around" : "flex-start"}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          open={open}
          possibleFilters={possibleFilters}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      )}

      {
        <SelectedFilters
          currentFilters={currentFilters}
          handleUnselectFilter={handleUnselectFilter}
          possibleFilters={possibleFilters}
        />
      }
    </div>
  );
}
