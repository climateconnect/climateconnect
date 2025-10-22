import makeStyles from "@mui/styles/makeStyles";
import React, { ReactNode, useContext } from "react";
import getFilters from "../../../public/data/possibleFilters";
import UserContext from "../context/UserContext";
import FilterContent from "../filter/FilterContent";
import LoadingSpinner from "../general/LoadingSpinner";
import NoItemsFound from "./NoItemsFound";
import { Theme, useMediaQuery } from "@mui/material";
import { LinkedHub } from "../../types";
import HubLinkButton from "../hub/HubLinkButton";

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

type tabContentWrapperProps = {
  tabValue: number;
  TYPES_BY_TAB_VALUE: any;
  type: any;
  filtersExpanded: any;
  handleApplyNewFilters: any;
  handleUpdateFilterValues: any;
  errorMessage: any;
  isMobileScreen: any;
  filtersExandedOnMobile: any;
  handleSetLocationOptionsOpen: any;
  locationInputRefs: any;
  locationOptionsOpen: any;
  filterChoices: any;
  unexpandFiltersOnMobile: any;
  unexpandFilters: any;
  initialLocationFilter: any;
  isFiltering: boolean;
  state: any;
  children: ReactNode;
  hubName: string;
  nonFilterParams: any;
  linkedHubs: LinkedHub[];
};

export default function TabContentWrapper({
  tabValue,
  TYPES_BY_TAB_VALUE,
  type,
  filtersExpanded,
  handleApplyNewFilters,
  handleUpdateFilterValues,
  errorMessage,
  isMobileScreen,
  filtersExandedOnMobile,
  handleSetLocationOptionsOpen,
  locationInputRefs,
  locationOptionsOpen,
  filterChoices,
  unexpandFiltersOnMobile,
  unexpandFilters,
  initialLocationFilter,
  isFiltering,
  state,
  children,
  hubName,
  nonFilterParams,
  linkedHubs,
}: tabContentWrapperProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  return (
    <TabContent
      value={tabValue}
      index={TYPES_BY_TAB_VALUE.indexOf(type)}
      //TODO(unused) className={classes.tabContent}
    >
      {filtersExpanded && tabValue === TYPES_BY_TAB_VALUE.indexOf(type) && (
        <FilterContent
          className={classes.tabContent}
          type={TYPES_BY_TAB_VALUE[TYPES_BY_TAB_VALUE.indexOf(type)]}
          applyFilters={handleApplyNewFilters}
          handleUpdateFilters={handleUpdateFilterValues}
          errorMessage={errorMessage}
          filtersExpanded={isMobileScreen ? filtersExandedOnMobile : filtersExpanded}
          handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
          locationInputRef={locationInputRefs[TYPES_BY_TAB_VALUE[TYPES_BY_TAB_VALUE.indexOf(type)]]}
          locationOptionsOpen={locationOptionsOpen}
          possibleFilters={getFilters({
            key: TYPES_BY_TAB_VALUE[TYPES_BY_TAB_VALUE.indexOf(type)],
            filterChoices: filterChoices,
            locale: locale,
          })}
          unexpandFilters={isMobileScreen ? unexpandFiltersOnMobile : unexpandFilters}
          initialLocationFilter={initialLocationFilter}
          nonFilterParams={nonFilterParams}
        />
      )}
      {/* Show the linked hubs only on desktop screens */}
      {!isNarrowScreen && linkedHubs?.length > 0 && (
        <div className={classes.linkedHubsContainer}>
          {linkedHubs.map((linkedHub) => (
            <HubLinkButton hub={linkedHub} />
          ))}
        </div>
      )}

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
