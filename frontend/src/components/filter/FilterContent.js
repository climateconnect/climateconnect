import React, { useCallback } from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { remove, update, merge, initial, uniq, indexOf } from "lodash";
import { loadGetInitialProps } from "next/dist/next-server/lib/utils";

import theme from "../../themes/theme";
import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";

import { persistFiltersInURL } from "../../../public/lib/urlOperations";

export default function FilterContent({
  applyFilters,
  className,
  errorMessage,
  filtersExpanded,
  handleSetLocationOptionsOpen,
  // TODO(piper): pass this all the way down...
  handleSelectedListItemToFilters,
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

  /**
    {
      "location": "",
      "status": [],
      "organization_type": [],
      "category": "",
      "collaboration": "",
      "skills": ""
    }
   */

  // possibleFilters is an array of objects, which include various properties
  // like icon, iconName, title, etc. on it. We reduce those to a single object
  // to determine the initial filters, and selected items...
  const reducedPossibleFilters = possibleFilters.reduce((map, obj) => {
    // Need to set an empty array for multiselects, otherwise set
    // this key to a string
    if (obj.type === "multiselect") {
      map[obj.key] = [];
    } else {
      map[obj.key] = "";
    }

    return map;
  }, {});

  // TODO: order here matters? And need to respect array types.
  // let test = merge({}, reducedPossibleFilters);
  // let test2 = merge(test, router.query);

  // TODO: status needs to be an array at least on the object shape
  let initialFilters = {};

  // Combine the filters together from the query param.
  // Some types are arrays and expected as such
  // downstream; need to handle appropriately both on initiailization
  // and when merging in parameters from query param

  // TODO: this could be implified with the reduce likely
  Object.entries(router.query).forEach(([key, value]) => {
    // debugger;

    // Handle specific types
    if (Array.isArray(reducedPossibleFilters[key])) {
      reducedPossibleFilters[key].push(value);
    } else if (typeof reducedPossibleFilters[key] === "string") {
      // Handle string values too

      // If there's something set, and it's strings concat'd -
      // we need to make an array out of them
      if (value && value.indexOf(",") > 0) {
        const splitItems = value.split(",");
        reducedPossibleFilters[key] = [...splitItems];
      } else {
        reducedPossibleFilters[key] = value;
      }
    }
  });

  /**
   * TODO: temp
   *
   * {location: "", status: Array(1), organization_type: Array(0), category: "Lowering food waste", collaboration: "", …}
    category: "Lowering food waste"
    collaboration: ""
    location: ""
    organization_type: []
    skills: ""
    status: ["In Progress"]
   */

  // initialFilters["status"].push("In test progress");

  //   // ...router.query,
  //   ...reducedPossibleFilters,
  // };

  const [open, setOpen] = React.useState({});

  const [currentFilters, setCurrentFilters] = React.useState(reducedPossibleFilters);
  // const [currentFilters, setCurrentFilters] = React.useState(initialFilters);

  // TODO(Piper): I believe the selected items is only being set by the multilevel?
  // Could merge the initialProjeccategories here and then pass that down as well!
  const [selectedItems, setSelectedItems] = React.useState(
    possibleFilters.reduce((accumulator, currentValue) => {
      // console.log(currentValue);

      // All we're doing is initializing an empty array here.
      if (currentValue.type === "openMultiSelectDialogButton") {
        // And if we have selected items in the query param, then we populate this...
        // E.g., if currentFilters["category"] is already set, we also
        // select this item

        // debugger;
        // TODO(piper): test for multiple categories
        if (currentFilters && currentFilters[currentValue.key]) {
          if (Array.isArray(currentFilters[currentValue.key])) {
            accumulator[currentValue.key] = currentFilters[currentValue.key];
          } else {
            // Not an array, need to handle differently.

            // Only one item in the array,
            accumulator[currentValue.key] = [];

            // TODO
            // Ensure we've an array for multiple items
            const splitItems = currentFilters[currentValue.key].split(",");

            // Have to transform to a name property, so that the items can render the name
            const selectedCategory = {
              // Old just a string
              // name: currentFilters[currentValue.key],
              name: splitItems,
            };

            accumulator[currentValue.key].push(selectedCategory);
          }
        } else {
          accumulator[currentValue.key] = [];
        }
      }

      return accumulator;
    }, {})
  );

  // debugger;

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
      console.warn("Handling click dialog close from: ");
      // debugger;
      console.log(currentFilters);
      applyFilters(type, updatedFilters, isSmallScreen);
    }

    setOpen({ ...open, [prop]: false });
  };

  const handleValueChange = (key, newValue) => {
    // TODO(piper): we want to update and fetch data on any value change
    // debugger;
    const updatedFilters = { ...currentFilters, [key]: newValue };
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
            // TODO: pasing this all the way through...
            handleSelectedListItemToFilters={handleSelectedListItemToFilters}
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
            handleSelectedListItemToFilters={handleSelectedListItemToFilters}
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
      {/* Selected... */}
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
