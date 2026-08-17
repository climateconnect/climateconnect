import { Theme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getLocationFilterKeys } from "../../../public/data/locationFilters";
import { getActiveFilterCount } from "../../../public/lib/filterOperations";
import { getReducedPossibleFilters } from "../../../public/lib/parsingOperations";
import theme from "../../themes/theme";
import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";
import { FilterContext } from "../context/FilterContext";

export const findAllItems = (currentPossibleFilter, selectedFiltersToCheck) => {
  if (!currentPossibleFilter.options || currentPossibleFilter?.options?.length === 0) {
    return Array.from(selectedFiltersToCheck);
  }

  const items: any[] = [];
  currentPossibleFilter.options.forEach((item) => {
    if (selectedFiltersToCheck.has(item.name)) {
      items.push(item);
    }

    item?.subcategories?.forEach((subcategory) => {
      if (selectedFiltersToCheck.has(subcategory.name)) {
        items.push(subcategory);
      }
    });
  });

  return items;
};

export const reduceFilters = (currentFilters, possibleFilters) => {
  const reduced = possibleFilters.reduce((accumulator, currentPossibleFilter) => {
    if (currentPossibleFilter.type === "openMultiSelectDialogButton") {
      if (
        currentFilters &&
        currentFilters[currentPossibleFilter.key] &&
        currentFilters[currentPossibleFilter.key]?.length > 0
      ) {
        let filtersToCheck;
        if (Array.isArray(currentFilters[currentPossibleFilter.key])) {
          filtersToCheck = new Set(currentFilters[currentPossibleFilter.key]);
        } else {
          filtersToCheck = new Set([currentFilters[currentPossibleFilter.key]]);
        }

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
  searchSubmit,
}) {
  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));

  const reducedPossibleFilters = getReducedPossibleFilters(possibleFilters);

  const router = useRouter();
  Object.entries(router.query).forEach(([key, value]) => {
    const locationQueryParams = getLocationFilterKeys();
    if (locationQueryParams.includes(key) && initialLocationFilter) {
      if (!reducedPossibleFilters.location) {
        reducedPossibleFilters.location = initialLocationFilter;
      }
    } else if (Array.isArray(reducedPossibleFilters[key])) {
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

  // --- Draft state for mobile staged apply ---
  const [draftFilters, setDraftFilters] = useState(filters);
  const [draftSelectedItems, setDraftSelectedItems] = useState(selectedItems);
  const overlayOpenRef = useRef(false);

  // Snapshot applied filters into draft when the overlay opens
  useEffect(() => {
    if (filtersExpanded && isSmallScreen && !overlayOpenRef.current) {
      setDraftFilters({ ...filters });
      setDraftSelectedItems({ ...selectedItems });
      overlayOpenRef.current = true;
    }
    if (!filtersExpanded) {
      overlayOpenRef.current = false;
    }
  }, [filtersExpanded, isSmallScreen]);

  const activeFilterCount = getActiveFilterCount(filters, possibleFilters);

  // --- Handlers ---

  const handleClickDialogOpen = (prop) => {
    if (!open.prop) {
      setOpen({ ...open, [prop]: true });
    } else {
      setOpen({ ...open, [prop]: !open[prop] });
    }
  };

  // Desktop: immediate apply (unchanged)
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

  const handleClickDialogClose = (prop) => {
    setOpen({ ...open, [prop]: false });
  };

  // Desktop: immediate value change (unchanged)
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

  const getUpdatedFiltersAfterUnselect = (filterName, filterKey, baseFilters?) => {
    const src = baseFilters || filters;
    if (filterKey === "location") {
      const newFilters = {
        ...src,
        [filterKey]: "",
      };
      const locationFilterKeys = getLocationFilterKeys();
      for (const key of locationFilterKeys) {
        newFilters[key] = "";
      }
      return newFilters;
    }
    const srcCopy = { ...src };
    if (!Array.isArray(srcCopy[filterKey])) {
      srcCopy[filterKey] = [srcCopy[filterKey]];
    }
    const prunedFilters = srcCopy[filterKey].filter((f) => f !== filterName);
    return {
      ...srcCopy,
      [filterKey]: prunedFilters,
    };
  };

  // Desktop: unselect filter (unchanged)
  const handleUnselectFilter = (filterName, filterKey) => {
    const updatedFilters = getUpdatedFiltersAfterUnselect(filterName, filterKey);
    applyFilters({
      type: type,
      newFilters: updatedFilters,
      closeFilters: isSmallScreen,
      nonFilterParams: nonFilterParams,
    });
    handleUpdateFilters(updatedFilters);

    if (selectedItems[filterKey]) {
      setSelectedItems({
        ...selectedItems,
        [filterKey]: selectedItems[filterKey].filter((i) => i.name !== filterName),
      });
    }
  };

  // --- Mobile staged handlers ---

  const handleStagedValueChange = useCallback((key, newValue) => {
    setDraftFilters((prev) => ({ ...prev, [key]: newValue }));
  }, []);

  const handleStagedDialogSave = useCallback((prop, results) => {
    if (results) {
      setDraftFilters((prev) => ({ ...prev, [prop]: results.map((x) => x.name) }));
    }
    setOpen((prev) => ({ ...prev, [prop]: false }));
  }, []);

  const handleStagedUnselectFilter = useCallback((filterName, filterKey) => {
    setDraftFilters((prev) => {
      const updated = getUpdatedFiltersAfterUnselect(filterName, filterKey, prev);
      return updated;
    });
    setDraftSelectedItems((prev) => {
      if (prev[filterKey]) {
        return {
          ...prev,
          [filterKey]: prev[filterKey].filter((i) => i.name !== filterName),
        };
      }
      return prev;
    });
  }, []);

  const handleStagedApply = useCallback(() => {
    handleUpdateFilters(draftFilters);
    setSelectedItems(draftSelectedItems);
    applyFilters({
      type: type,
      newFilters: draftFilters,
      closeFilters: true,
      nonFilterParams: nonFilterParams,
    });
  }, [draftFilters, draftSelectedItems, type, nonFilterParams]);

  const handleResetDraftFilters = useCallback(() => {
    const resetFilters: Record<string, any> = {};
    for (const pf of possibleFilters) {
      if (pf.type === "location") {
        resetFilters[pf.key] = "";
        for (const lk of getLocationFilterKeys()) {
          resetFilters[lk] = "";
        }
      } else if (pf.type === "openMultiSelectDialogButton" || pf.type === "multiselect") {
        resetFilters[pf.key] = [];
      } else if (pf.type === "select" || pf.type === "text") {
        resetFilters[pf.key] = "";
      }
    }
    setDraftFilters((prev) => ({ ...prev, ...resetFilters }));
    setDraftSelectedItems({});
  }, [possibleFilters]);

  return (
    <div className={className}>
      {isSmallScreen ? (
        <FilterOverlay
          activeFilterCount={activeFilterCount}
          draftFilters={draftFilters}
          draftSelectedItems={draftSelectedItems}
          errorMessage={errorMessage}
          filtersExpanded={filtersExpanded}
          handleClickDialogClose={handleClickDialogClose}
          handleClickDialogOpen={handleClickDialogOpen}
          handleResetDraftFilters={handleResetDraftFilters}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleStagedApply={handleStagedApply}
          handleStagedDialogSave={handleStagedDialogSave}
          handleStagedUnselectFilter={handleStagedUnselectFilter}
          handleStagedValueChange={handleStagedValueChange}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          open={open}
          possibleFilters={possibleFilters}
          setDraftSelectedItems={setDraftSelectedItems}
          unexpandFilters={unexpandFilters}
        />
      ) : (
        <Filters
          errorMessage={errorMessage}
          handleClickDialogSave={handleClickDialogSave}
          handleClickDialogClose={handleClickDialogClose}
          handleClickDialogOpen={handleClickDialogOpen}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          handleValueChange={handleValueChange}
          justifyContent={"flex-start"}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          open={open}
          possibleFilters={possibleFilters}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          searchType={type}
          searchSubmit={searchSubmit}
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
