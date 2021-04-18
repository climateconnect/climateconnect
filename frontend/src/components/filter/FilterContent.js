import React from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";
import theme from "../../themes/theme";

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

  const [selectedItems, setSelectedItems] = React.useState(
    // For currently selected items (from the query param), we want
    // to also propagate the complete filter object through
    // to the selected items, beyond just the "name" property. The
    // possibleFilters array includes other properties and
    // metadata (like icon, iconName, title, etc.) beyond what we persist
    // in the query params.

    // We reduce those to a single object to determine the initial filters, and selected items.
    possibleFilters.reduce((accumulator, currentPossibleFilter) => {
      if (currentPossibleFilter.type === "openMultiSelectDialogButton") {
        if (currentFilters && currentFilters[currentPossibleFilter.key]) {
          if (Array.isArray(currentFilters[currentPossibleFilter.key])) {
            // If we currently have a filter set (e.g. category), then
            // make sure we search through the possible sub items associated
            // with that filter (e.g. itemsToChooseFrom, and subcategories)
            let possibleMultiFiltersToPass = [];
            if (currentPossibleFilter.itemsToChooseFrom) {
              const potentialCurrentFilterValues = new Set(
                currentFilters[currentPossibleFilter.key]
              );

              currentPossibleFilter.itemsToChooseFrom.forEach((item) => {
                if (potentialCurrentFilterValues.has(item.name)) {
                  possibleMultiFiltersToPass.push(item);
                }

                // Check for subcategories as well
                if (item.subcategories) {
                  item.subcategories.forEach((subcategory) => {
                    if (potentialCurrentFilterValues.has(subcategory.name)) {
                      possibleMultiFiltersToPass.push(subcategory);
                    }
                  });
                }
              });
            }

            // After we've searched through all possible filters,
            // we ensure the selected items state will have all information based on
            // what appears in the query param
            accumulator[currentPossibleFilter.key] = possibleMultiFiltersToPass;
          } else {
            // Not an array (e.g. a string like "energy"), need to handle differently.
            accumulator[currentPossibleFilter.key] = [];

            // For currently selected items (from the query param), we want
            // to also propagate the complete filter object through
            // to the selected items, beyond just the "name" property.
            let possibleFiltersToPass = [];

            // If the filter (e.g. "Category") has items to choose from, then
            // we have to find those items to pass along to the selectedItems state
            if (currentPossibleFilter.itemsToChooseFrom) {
              const potentialCurrentFilterValues = new Set(
                // Ensure it's an array if it's a single string
                [currentFilters[currentPossibleFilter.key]]
              );

              currentPossibleFilter.itemsToChooseFrom.forEach((item) => {
                if (potentialCurrentFilterValues.has(item.name)) {
                  possibleFiltersToPass.push(item);
                }

                // Check for subcategories as well
                if (item.subcategories) {
                  item.subcategories.forEach((subcategory) => {
                    if (potentialCurrentFilterValues.has(subcategory.name)) {
                      possibleFiltersToPass.push(subcategory);
                    }
                  });
                }
              });
            }

            accumulator[currentPossibleFilter.key] = possibleFiltersToPass;
          }
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

  const handleUnselectFilter = (filterName, filterKey) => {
    debugger;

    // Ensure that the filtered value is an array, e.g.
    // we can't filter on a string like "Energy".
    // TODO(piper): is this pointing to another bug?
    if (!Array.isArray(currentFilters[filterKey])) {
      currentFilters[filterKey] = [currentFilters[filterKey]];
    }

    const updatedFilters = {
      ...currentFilters,
      // Purge the selected filter
      [filterKey]: currentFilters[filterKey].filter((f) => f !== filterName),
    };

    // When dismissing a selected filter chip, we also want to update the
    // window state to reflect the currently active filters, and fetch
    // the updated data from the server
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
