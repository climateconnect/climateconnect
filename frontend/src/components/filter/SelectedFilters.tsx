import React from "react";
import SelectedFilter from "./SelectedFilter";
import { useFilters } from "../hooks/UseFilters";

export default function SelectedFilters({ possibleFilters, handleUnselectFilter }) {
  const { filters } = useFilters();

  const currentFilters = Object.keys(filters).reduce(function (obj, curKey) {
    obj[curKey] = filters[curKey];
    if (curKey === "location" && typeof filters[curKey] === "object")
      obj[curKey] = [filters[curKey]];
    return obj;
  }, {});

  // TODO: should probably refactor this to use .any
  // eslint-disable-next-line no-unused-vars
  const hasFilters = Object.keys(currentFilters).reduce((hasFilters, filter) => {
    if (currentFilters[filter] && currentFilters[filter].length) {
      hasFilters = true;
    }
    return hasFilters;
  }, false);

  if (!hasFilters) {
    return null;
  }

  return (
    <>
      {/* Now render a selected "Chip" component for every currently selected filter */}
      {currentFilters &&
        Object.keys(currentFilters).map((key, index) => (
          <SelectedFilter
            filterKey={key}
            key={index}
            currentFilters={currentFilters}
            possibleFilters={possibleFilters}
            handleUnselectFilter={handleUnselectFilter}
          />
        ))}
    </>
  );
}
