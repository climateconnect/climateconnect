import React from "react";
import FilterFields from "./FilterFields";

export default function SearchOrganizationsContent({
  className,
  type,
  possibleFilters,
  applyFilters
}) {
  return (
    <FilterFields
      type={type}
      className={className}
      possibleFilters={possibleFilters}
      applyFilters={applyFilters}
    />
  );
}
