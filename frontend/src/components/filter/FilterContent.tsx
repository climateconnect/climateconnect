import { Theme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { getLocationFilterKeys } from "../../../public/data/locationFilters";
import { getReducedPossibleFilters } from "../../../public/lib/parsingOperations";
import theme from "../../themes/theme";
import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";
import { FilterContext } from "../context/FilterContext";

/**
 * Util to return an array of all potential items associated with
 * a given selected filter. Traverses options, and subcategories
 * associated with that filter.
 */
export const findAllItems = (currentPossibleFilter, selectedFiltersToCheck) => {
  // Immediately just return the initial filter name,
  // if we don't need to traverse subcategories or other items to choose from.
  // I.e. there aren't nested items to look through
  if (!currentPossibleFilter.options || currentPossibleFilter?.options?.length === 0) {
    // Handle the case where it could be a single item
    return Array.from(selectedFiltersToCheck);
  }

  // Ensure we've accurate set membership, and iterate over all items to choose from...
  const items: any[] = [];
  currentPossibleFilter.options.forEach((item) => {
    if (selectedFiltersToCheck.has(item.name)) {
      items.push(item);
    }

    // Check for subcategories as well
    item?.subcategories?.forEach((subcategory) => {
      if (selectedFiltersToCheck.has(subcategory.name)) {
        items.push(subcategory);
      }
    });
  });

  return items;
};

/**
 * For initially selected items (from the query param), we want
 * to also propagate the complete filter object through
 * to the selected items, beyond just the "name" property. The
 * possibleFilters array includes other properties and
 * metadata (like icon, iconName, title, etc.) beyond what we persist
 * in the query params.
 */
export const reduceFilters = (currentFilters, possibleFilters) => {
  const reduced = possibleFilters.reduce((accumulator, currentPossibleFilter) => {
    if (currentPossibleFilter.type === "openMultiSelectDialogButton") {
      if (
        currentFilters &&
        currentFilters[currentPossibleFilter.key] &&
        // Handle "Skills" case where items need to be selected
        currentFilters[currentPossibleFilter.key]?.length > 0
      ) {
        // Ensure the membership collection is built with an array if it's a single string
        // like "energy" under the Category filter, or "crafts" under the Skills filter
        let filtersToCheck;
        if (Array.isArray(currentFilters[currentPossibleFilter.key])) {
          filtersToCheck = new Set(currentFilters[currentPossibleFilter.key]);
        } else {
          filtersToCheck = new Set([currentFilters[currentPossibleFilter.key]]);
        }

        // If we currently have a filter set (e.g. category), then
        // make sure we search through the possible sub items associated
        // with that filter (e.g. options, and subcategories)
        const potentialItems = findAllItems(currentPossibleFilter, filtersToCheck);
        accumulator[currentPossibleFilter.key] = potentialItems;
      } else {
        accumulator[currentPossibleFilter.key] = [];
      }
    }

    return accumulator;
  }, {});

  return reduced;
};

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
  initialLocationFilter,
  handleUpdateFilters,
  nonFilterParams,
}) {
  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));

  const reducedPossibleFilters = getReducedPossibleFilters(possibleFilters);

  // Update possible filters from current filters
  // that are present in the query param in the URL.  Some
  // types are arrays and expected as such
  // downstream; need to handle appropriately both on initiailization
  // and when merging in parameters from query param
  const router = useRouter();
  Object.entries(router.query).forEach(([key, value]) => {
    const locationQueryParams = getLocationFilterKeys();
    if (locationQueryParams.includes(key) && initialLocationFilter) {
      if (!reducedPossibleFilters.location) {
        reducedPossibleFilters.location = initialLocationFilter;
      }
    } else if (Array.isArray(reducedPossibleFilters[key])) {
      // If the query value is concat'd -
      // split into multiple items
      const splitItems = (value as string).split(",");
      reducedPossibleFilters[key] = [...splitItems];
    } else {
      reducedPossibleFilters[key] = value;
    }
  });

  const [open, setOpen] = useState<{ prop?: any }>({});
  const [initialized, setInitialized] = useState(false);

  const { filters } = useContext(FilterContext);
  const reduced = reduceFilters(filters, possibleFilters);

  const [selectedItems, setSelectedItems] = useState(reduced);

  //once the filters are initialized, initialize selectedItems
  useEffect(
    function () {
      if (!initialized) {
        if (Object.keys(reduced).filter((key) => reduced[key]?.length > 0)?.length > 0) {
          setSelectedItems(reduced);
          setInitialized(true);
        }
      }
    },
    [reduced]
  );

  const handleClickDialogOpen = (prop) => {
    if (!open.prop) {
      setOpen({ ...open, [prop]: true });
    } else {
      setOpen({ ...open, [prop]: !open[prop] });
    }
  };

  /**
   * The logic filtering and update logic
   * when we click "Apply" or "Save" in a
   * multi-level select dialog.
   */
  const handleClickDialogSave = (prop, results) => {
    if (results) {
      const updatedFilters = { ...filters, [prop]: results.map((x) => x.name) };
      handleUpdateFilters(updatedFilters);
      applyFilters({
        type: type,
        newFilters: updatedFilters,
        closeFilters: isSmallScreen,
        nonFilterParams: nonFilterParams,
      });
    }

    setOpen({ ...open, [prop]: false });
  };

  /**
   * Handler when dismissing or closing (clicking the "X")
   * a dialog or modal.
   */
  const handleClickDialogClose = (prop) => {
    setOpen({ ...open, [prop]: false });
  };

  const handleValueChange = (key, newValue) => {
    const updatedFilters = { ...filters, [key]: newValue };
    applyFilters({
      type: type,
      newFilters: updatedFilters,
      closeFilters: isSmallScreen,
      nonFilterParams: nonFilterParams,
    });
    handleUpdateFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    applyFilters({
      type: type,
      newFilters: filters,
      closeFilters: isSmallScreen,
      nonFilterParams: nonFilterParams,
    });
  };

  const getUpdatedFiltersAfterUnselect = (filterName, filterKey) => {
    //location is the only filter that can be unselected and is not supposed to be an array
    if (filterKey === "location") {
      const newFilters = {
        ...filters,
        [filterKey]: "",
      };
      const locationFilterKeys = getLocationFilterKeys();
      for (const key of locationFilterKeys) {
        newFilters[key] = "";
      }
      return newFilters;
    }
    // Ensure that the filtered value is an array, e.g.
    // we can't filter on a raw string like "Energy".
    if (!Array.isArray(filters[filterKey])) {
      filters[filterKey] = [filters[filterKey]];
    }
    const prunedFilters = filters[filterKey].filter((f) => f !== filterName);
    return {
      ...filters,
      [filterKey]: prunedFilters,
    };
  };

  /**
   * Reapplies filters based on two given strings: the
   * name of the filter (e.g. "Energy") and its
   * key (e.g. "category").
   */
  const handleUnselectFilter = (filterName, filterKey) => {
    const updatedFilters = getUpdatedFiltersAfterUnselect(filterName, filterKey);
    // When dismissing a selected filter chip, we also want to update the
    // window state to reflect the currently active filters, and fetch
    // the updated data from the server
    applyFilters({
      type: type,
      newFilters: updatedFilters,
      closeFilters: isSmallScreen,
      nonFilterParams: nonFilterParams,
    });
    handleUpdateFilters(updatedFilters);

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
            handleApplyFilters={handleApplyFilters}
            errorMessage={errorMessage}
            filtersExpanded={filtersExpanded}
            handleClickDialogSave={handleClickDialogSave}
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
      ) : (
        <Filters
          errorMessage={errorMessage}
          handleClickDialogSave={handleClickDialogSave}
          handleClickDialogClose={handleClickDialogClose}
          handleClickDialogOpen={handleClickDialogOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleValueChange={handleValueChange}
          justifyContent={"center"}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          open={open}
          possibleFilters={possibleFilters}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      )}
      {/* We pass currentFilters like this because if location is not an array, 
      a change in it doesn't cause a rerender and therefore the location chip is not shown */}
      <SelectedFilters
        handleUnselectFilter={handleUnselectFilter}
        possibleFilters={possibleFilters}
      />
    </div>
  );
}
