import makeStyles from "@mui/styles/makeStyles";
import React, { ReactNode, useContext, useRef } from "react";
import { Theme, useMediaQuery } from "@mui/material";
import getFilters from "../../../public/data/possibleFilters";
import UserContext from "../context/UserContext";
import FilterContent from "../filter/FilterContent";
import NoItemsFound from "./NoItemsFound";
import LoadingSpinner from "../general/LoadingSpinner";
import HubLinkButton from "../hub/HubLinkButton";
import { LinkedHub } from "../../types";

const useStyles = makeStyles<Theme, { is600to718breakpoint: any }>((theme) => ({
  tabContent: (props) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingLeft: props.is600to718breakpoint ? 0 : theme.spacing(1),
  }),
  linkedHubsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
}));

type TabContentWrapperProps = {
  // Tab and type management
  tabValue: number;
  TYPES_BY_TAB_VALUE: any;
  type: any;

  // Filter state and handlers
  filtersExpanded: boolean;
  filtersExandedOnMobile: boolean;
  filterChoices: any;
  initialLocationFilter: any;
  nonFilterParams: any;
  handleApplyNewFilters: any;
  handleUpdateFilterValues: (_filters: any) => void;
  unexpandFilters: () => void;
  unexpandFiltersOnMobile: () => void;

  // Location handling
  locationInputRefs: any;
  locationOptionsOpen: boolean;
  handleSetLocationOptionsOpen: (_isOpen: boolean) => void;

  // Content state
  isFiltering: boolean;
  state: any;
  errorMessage: string;

  // Display props
  isMobileScreen: boolean;
  hubName: string;
  linkedHubs: LinkedHub[];
  children: ReactNode;
  eventsContent?: ReactNode;

  // Search handler
  handleSearchSubmit: any;
};

export default function TabContentWrapper({
  tabValue,
  TYPES_BY_TAB_VALUE,
  type,
  filtersExpanded,
  filtersExandedOnMobile,
  filterChoices,
  initialLocationFilter,
  nonFilterParams,
  handleApplyNewFilters,
  handleUpdateFilterValues,
  unexpandFilters,
  unexpandFiltersOnMobile,
  locationInputRefs,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  isFiltering,
  state,
  errorMessage,
  isMobileScreen,
  hubName,
  linkedHubs,
  children,
  eventsContent,
  handleSearchSubmit,
}: TabContentWrapperProps) {
  const is600to718breakpoint = useMediaQuery("(min-width:600px) and (max-width:718px)");
  const classes = useStyles({ is600to718breakpoint: is600to718breakpoint });
  const { locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  // Calculate current tab index
  const currentTabIndex = TYPES_BY_TAB_VALUE.indexOf(type);
  const isCurrentTab = tabValue === currentTabIndex;

  // Determine which filter expansion state to use
  const shouldShowFilters = filtersExpanded && isCurrentTab;
  const effectiveFiltersExpanded = isMobileScreen ? filtersExandedOnMobile : filtersExpanded;
  const effectiveUnexpandFilters = isMobileScreen ? unexpandFiltersOnMobile : unexpandFilters;

  // Check if content should be displayed
  const hasItems = state?.items?.[type]?.length > 0 || type === "ideas";
  const shouldShowLinkedHubs = !isNarrowScreen && linkedHubs?.length > 0;

  // Keep children mounted once they've been rendered to avoid mount/unmount
  // flicker during re-filtering. Use opacity to indicate loading state.
  const childrenRenderedRef = useRef(false);
  if (hasItems) childrenRenderedRef.current = true;
  const showChildren = hasItems || (isFiltering && childrenRenderedRef.current);
  const shouldShowNoItems = !isFiltering && !hasItems;

  return (
    <TabContent value={tabValue} index={currentTabIndex}>
      {shouldShowFilters && (
        <FilterContent
          className={classes.tabContent}
          type={type}
          applyFilters={handleApplyNewFilters}
          handleUpdateFilters={handleUpdateFilterValues}
          errorMessage={errorMessage}
          filtersExpanded={effectiveFiltersExpanded}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          locationInputRef={locationInputRefs[type]}
          locationOptionsOpen={locationOptionsOpen}
          possibleFilters={getFilters({
            key: type,
            filterChoices: filterChoices,
            locale: locale,
          })}
          unexpandFilters={effectiveUnexpandFilters}
          initialLocationFilter={initialLocationFilter}
          nonFilterParams={nonFilterParams}
          searchSubmit={handleSearchSubmit}
        />
      )}
      {shouldShowLinkedHubs && (
        <div className={classes.linkedHubsContainer}>
          {linkedHubs.map((linkedHub) => (
            <HubLinkButton key={linkedHub.hubUrl} hub={linkedHub} />
          ))}
        </div>
      )}

      {eventsContent}
      {isFiltering && !childrenRenderedRef.current && <LoadingSpinner isLoading />}
      <div style={{ opacity: isFiltering && showChildren ? 0.5 : 1, transition: "opacity 150ms" }}>
        {showChildren && children}
      </div>
      {shouldShowNoItems && <NoItemsFound type={type} hubName={hubName} />}
    </TabContent>
  );
}

interface TabContentProps {
  value: number;
  index: number;
  children: ReactNode;
}

function TabContent({ value, index, children }: TabContentProps) {
  return <div hidden={value !== index}>{children}</div>;
}
