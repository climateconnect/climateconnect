import makeStyles from "@mui/styles/makeStyles";
import React, { ReactNode, useContext } from "react";
import { Theme, useMediaQuery } from "@mui/material";
import getFilters from "../../../public/data/possibleFilters";
import UserContext from "../context/UserContext";
import FilterContent from "../filter/FilterContent";
import LoadingSpinner from "../general/LoadingSpinner";
import NoItemsFound from "./NoItemsFound";
import HubLinkButton from "../hub/HubLinkButton";
import { LinkedHub } from "../../types";

const useStyles = makeStyles((theme) => ({
  tabContent: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
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
  handleApplyNewFilters: () => void;
  handleUpdateFilterValues: (filters: any) => void;
  unexpandFilters: () => void;
  unexpandFiltersOnMobile: () => void;

  // Location handling
  locationInputRefs: any;
  locationOptionsOpen: boolean;
  handleSetLocationOptionsOpen: (isOpen: boolean) => void;

  // Content state
  isFiltering: boolean;
  state: any;
  errorMessage: string;

  // Display props
  isMobileScreen: boolean;
  hubName: string;
  linkedHubs: LinkedHub[];
  children: ReactNode;
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
}: TabContentWrapperProps) {
  const classes = useStyles();
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
  const shouldShowContent = !isFiltering && hasItems;
  const shouldShowNoItems = !isFiltering && !hasItems;
  const shouldShowLinkedHubs = !isNarrowScreen && linkedHubs?.length > 0;

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
        />
      )}

      {shouldShowLinkedHubs && (
        <div className={classes.linkedHubsContainer}>
          {linkedHubs.map((linkedHub) => (
            <HubLinkButton key={linkedHub.hubUrl} hub={linkedHub} />
          ))}
        </div>
      )}

      {isFiltering && <LoadingSpinner />}
      {shouldShowContent && children}
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
