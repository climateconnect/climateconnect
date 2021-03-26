import React, { useCallback } from "react";
import { useRouter } from "next/router";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import theme from "../../themes/theme";
import FilterOverlay from "./FilterOverlay";
import Filters from "./Filters";
import SelectedFilters from "./SelectedFilters";
import { persistFiltersInURL } from "../../../public/lib/urlOperations";
import { remove, update, merge } from "lodash";
import { loadGetInitialProps } from "next/dist/next-server/lib/utils";

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
  const reducedPossibleFilters = possibleFilters.reduce((map, obj) => {
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

  // TODO: status needs to be an array at least
  // on the object shape
  let initialFilters = {};

  // debugger;

  // Combine the filters together from the query param.
  // Some types are arrays and expected as such
  // downstream; need to handle appropriately both on initiailization
  // and when merging in parameters from query param

  // TODO: this could be implified with the reduce likely
  Object.entries(router.query).forEach(([key, value]) => {
    // If there's something set...
    // Handle specific types
    if (Array.isArray(reducedPossibleFilters[key])) {
      reducedPossibleFilters[key].push(value);
    } else if (typeof reducedPossibleFilters[key] === "string") {
      // Handle string values too
      reducedPossibleFilters[key] = value;
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

  // console.log(router.query);

  const [currentFilters, setCurrentFilters] = React.useState(reducedPossibleFilters);
  // const [currentFilters, setCurrentFilters] = React.useState(initialFilters);

  const [open, setOpen] = React.useState({});

  // TODO(Piper): I believe the selected items is only being set by the multilevel?
  const [selectedItems, setSelectedItems] = React.useState(
    possibleFilters.reduce((map, obj) => {
      if (obj.type === "openMultiSelectDialogButton") {
        map[obj.key] = [];
      }
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
      console.warn("Handling click dialog close from: ");
      // debugger;
      console.log(currentFilters);
      applyFilters(type, updatedFilters, isSmallScreen);
    }

    setOpen({ ...open, [prop]: false });
  };

  const handleValueChange = (key, newValue) => {
    // TODO(piper): we want to update and fetch data on any value change
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
          possibleFilters={possibleFilters}
          handleUnselectFilter={handleUnselectFilter}
        />
      }
    </div>
  );
}
