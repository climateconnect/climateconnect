import React from "react";
import LoadingSpinner from "../general/LoadingSpinner";
import NoItemsFound from "./NoItemsFound";

export default function TabContentWrapper({
  tabValue,
  TYPES_BY_TAB_VALUE,
  type,
  isFiltering, // TODO: rename it to isLoading, as the real process itself is "is filtering"
  state, // TODO: maybe rename it to data
  children,
  hubName,
}) {
  return (
    <TabContent
      value={tabValue}
      index={TYPES_BY_TAB_VALUE.indexOf(type)}
      //TODO(unused) className={classes.tabContent}
    >
      {/*
        We have two loading spinner states: filtering, and fetching more data.
        When filtering, the spinner replaces the Previews components.
        When fetching more data, the spinner appears under the last row of the Previews components.
        Render the not found page if the object came back empty.
      */}
      {isFiltering ? (
        <LoadingSpinner />
      ) : (state?.items && state?.items[type]?.length) || type == "ideas" ? (
        <>{children}</>
      ) : (
        <NoItemsFound type={type} hubName={hubName} />
      )}
    </TabContent>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}
