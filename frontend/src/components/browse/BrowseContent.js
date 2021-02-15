import React, { useEffect, useRef, useState } from "react";
import { Container, Tabs, Tab, Divider, useMediaQuery, makeStyles } from "@material-ui/core";

import FilterSection from "../indexPage/FilterSection";
import FilterContent from "../filter/FilterContent";
import ProjectPreviews from "../project/ProjectPreviews";
import ProfilePreviews from "../profile/ProfilePreviews";
import OrganizationPreviews from "../organization/OrganizationPreviews";
import possibleFilters from "../../../public/data/possibleFilters";
import NoItemsFound from "./NoItemsFound";
import { membersWithAdditionalInfo } from "../../../public/lib/getOptions";
import LoadingSpinner from "../general/LoadingSpinner";
import LoadingContext from "../context/LoadingContext";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";

const useStyles = makeStyles((theme) => {
  return {
    tab: {
      width: 200,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    tabContent: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    mainContentDivider: {
      marginBottom: theme.spacing(3),
    },
  };
});

export default function BrowseContent({
  initialMembers,
  initialOrganizations,
  initialProjects,
  applyNewFilters,
  filterChoices,
  loadMoreData,
  applySearch,
  hideMembers,
  customSearchBarLabels,
  handleSetErrorMessage,
  errorMessage,
}) {
  const initialState = {
    items: {
      projects: initialProjects ? [...initialProjects.projects] : [],
      organizations: initialOrganizations ? [...initialOrganizations.organizations] : [],
      members:
        initialMembers && !hideMembers ? membersWithAdditionalInfo(initialMembers.members) : [],
    },
    hasMore: {
      projects: !!initialProjects && initialProjects.hasMore,
      organizations: !!initialOrganizations && initialOrganizations.hasMore,
      members: !!initialMembers && initialMembers.hasMore,
    },
    nextPages: {
      projects: 2,
      members: 2,
      organizations: 2,
    },
    urlEnding: {
      projects: "",
      organizations: "",
      members: "",
    },
  };
  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true"
  const classes = useStyles();
  const TYPES_BY_TAB_VALUE = hideMembers
    ? ["projects", "organizations"]
    : ["projects", "organizations", "members"];
  const [hash, setHash] = useState(null);
  const [tabValue, setTabValue] = useState(hash ? TYPES_BY_TAB_VALUE.indexOf(hash) : 0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [state, setState] = useState(initialState);
  const locationInputRefs = {
    projects: useRef(null),
    organizations: useRef(null),
    members: useRef(null),
  };
  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };

  // We have 2 distinct loading states: filtering, and loading more data. For
  // each state, we want to treat the loading spinner a bit differently, hence
  // why we have two separate pieces of state
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFetchingMoreData, setIsFetchingMoreData] = useState(false);

  const handleTabChange = (event, newValue) => {
    window.location.hash = TYPES_BY_TAB_VALUE[newValue];
    setTabValue(newValue);
  };

  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(TYPES_BY_TAB_VALUE.indexOf(window.location.hash.replace("#", "")));
    }
  }, []);

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const unexpandFilters = () => {
    setFiltersExpanded(false);
  };

  const loadMoreProjects = async () => {
    await handleLoadMoreData("projects");
  };

  const loadMoreOrganizations = async () => {
    await handleLoadMoreData("organizations");
  };

  const loadMoreMembers = async () => {
    await handleLoadMoreData("members");
  };

  const handleLoadMoreData = async (type) => {
    try {
      setIsFetchingMoreData(true);
      const res = await loadMoreData(type, state.nextPages[type], state.urlEnding[type]);

      // TODO: these setState and hooks calls should likely be memoized and combined
      setIsFetchingMoreData(false);
      setState({
        ...state,
        nextPages: {
          ...state.nextPages,
          [type]: state.nextPages[type] + 1,
        },
        hasMore: {
          ...state.hasMore,
          [type]: res.hasMore,
        },
        items: {
          ...state.items,
          [type]: [...state.items[type], ...res.newData],
        },
      });
      return [...res.newData];
    } catch (e) {
      setState({
        ...state,
        hasMore: { ...state.hasMore, [type]: false },
      });
    }
  };

  /**
   * Sets loading state to true to until the results are
   * returned from applying the new filters. Then updates the
   * state.
   */
  const handleApplyNewFilters = async (type, newFilters, closeFilters) => {
    if (!legacyModeEnabled && newFilters.location && !isLocationValid(newFilters.location)) {
      indicateWrongLocation(locationInputRefs[type], setLocationOptionsOpen, handleSetErrorMessage);
      return;
    }
    handleSetErrorMessage("");
    setIsFiltering(true);
    const res = await applyNewFilters(type, newFilters, closeFilters, state.urlEnding[type]);
    if (res?.closeFilters) {
      setFiltersExpanded(false);
    }
    if (res?.filteredItemsObject) {
      setState({
        ...state,
        items: { ...state.items, [type]: res.filteredItemsObject[type] },
        hasMore: { ...state.hasMore, [type]: res.filteredItemsObject.hasMore },
        urlEnding: { ...state.urlEnding, [type]: res.newUrlEnding },
        nextPages: { ...state.nextPages, [type]: 2 },
      });
    }
    setIsFiltering(false);
  };

  /**
   * Asynchonously get new projects, orgs or members. We render
   * a loading spinner until the request is done.
   */
  const handleSearchSubmit = async (type, searchValue) => {
    setIsFiltering(true);
    const res = await applySearch(type, searchValue, state.urlEnding[type]);
    setIsFiltering(false);

    if (res?.filteredItemsObject) {
      setState({
        ...state,
        items: { ...state.items, [type]: res.filteredItemsObject[type] },
        hasMore: { ...state.hasMore, [type]: res.filteredItemsObject.hasMore },
        urlEnding: { ...state.urlEnding, [type]: res.newUrlEnding },
        nextPages: { ...state.nextPages, [type]: 2 },
      });
    }
  };

  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <LoadingContext.Provider
      value={{
        spinning: isFetchingMoreData || isFiltering,
      }}
    >
      <Container maxWidth="lg">
        <FilterSection
          filtersExpanded={filtersExpanded}
          onSubmit={handleSearchSubmit}
          setFiltersExpanded={setFiltersExpanded}
          type={TYPES_BY_TAB_VALUE[tabValue]}
          customSearchBarLabels={customSearchBarLabels}
        />
        <Tabs
          variant={isNarrowScreen ? "fullWidth" : "standard"}
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered={true}
        >
          {TYPES_BY_TAB_VALUE.map((t, index) => (
            <Tab label={capitalizeFirstLetter(t)} className={classes.tab} key={index} />
          ))}
        </Tabs>

        <Divider className={classes.mainContentDivider} />

        <>
          <TabContent value={tabValue} index={0}>
            {filtersExpanded && tabValue === 0 && (
              <FilterContent
                className={classes.tabContent}
                type={TYPES_BY_TAB_VALUE[0]}
                applyFilters={handleApplyNewFilters}
                filtersExpanded={filtersExpanded}
                errorMessage={errorMessage}
                unexpandFilters={unexpandFilters}
                possibleFilters={possibleFilters(TYPES_BY_TAB_VALUE[0], filterChoices)}
                locationInputRef={locationInputRefs[TYPES_BY_TAB_VALUE[0]]}
                locationOptionsOpen={locationOptionsOpen}
                handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
              />
            )}
            {/*
              We have two loading spinner states: filtering, and fetching more data.
              When filtering, the spinner replaces the Previews components.
              When fetching more data, the spinner appears under the last row of the Previews components.
              Render the not found page if the object came back empty.
            */}
            {isFiltering ? (
              <LoadingSpinner />
            ) : state?.items?.projects?.length ? (
              <ProjectPreviews
                className={classes.itemsContainer}
                hasMore={state.hasMore.projects}
                loadFunc={loadMoreProjects}
                parentHandlesGridItems
                projects={state.items.projects}
              />
            ) : (
              <NoItemsFound type="projects" />
            )}
          </TabContent>
          <TabContent value={tabValue} index={1} className={classes.tabContent}>
            {filtersExpanded && tabValue === 1 && (
              <FilterContent
                className={classes.tabContent}
                type={TYPES_BY_TAB_VALUE[1]}
                applyFilters={handleApplyNewFilters}
                errorMessage={errorMessage}
                filtersExpanded={filtersExpanded}
                unexpandFilters={unexpandFilters}
                possibleFilters={possibleFilters(TYPES_BY_TAB_VALUE[1], filterChoices)}
                locationInputRef={locationInputRefs[TYPES_BY_TAB_VALUE[1]]}
                locationOptionsOpen={locationOptionsOpen}
                handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
              />
            )}

            {/*
              We have two loading spinner states: filtering, and fetching more data.
              When filtering, the spinner replaces the Previews components.
              When fetching more data, the spinner appears under the last row of the Previews components.
              Render the not found page if the object came back empty.
            */}
            {isFiltering ? (
              <LoadingSpinner />
            ) : state?.items?.organizations?.length ? (
              <OrganizationPreviews
                hasMore={state.hasMore.organizations}
                loadFunc={loadMoreOrganizations}
                organizations={state.items.organizations}
                parentHandlesGridItems
                showOrganizationType
              />
            ) : (
              <NoItemsFound type="organizations" />
            )}
          </TabContent>

          {!hideMembers && (
            <TabContent value={tabValue} index={2} className={classes.tabContent}>
              {filtersExpanded && tabValue === 2 && (
                <FilterContent
                  className={classes.tabContent}
                  type={TYPES_BY_TAB_VALUE[2]}
                  applyFilters={handleApplyNewFilters}
                  filtersExpanded={filtersExpanded}
                  errorMessage={errorMessage}
                  unexpandFilters={unexpandFilters}
                  possibleFilters={possibleFilters(TYPES_BY_TAB_VALUE[2], filterChoices)}
                  locationInputRef={locationInputRefs[TYPES_BY_TAB_VALUE[2]]}
                  locationOptionsOpen={locationOptionsOpen}
                  handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
                />
              )}

              {/*
                We have two loading spinner states: filtering, and fetching more data.
                When filtering, the spinner replaces the Previews components.
                When fetching more data, the spinner appears under the last row of the Previews components.
                Render the not found page if the object came back empty.
              */}
              {isFiltering ? (
                <LoadingSpinner />
              ) : state?.items?.members?.length ? (
                <ProfilePreviews
                  hasMore={state.hasMore.members}
                  loadFunc={loadMoreMembers}
                  parentHandlesGridItems
                  profiles={state.items.members}
                  showAdditionalInfo
                />
              ) : (
                <NoItemsFound type="members" />
              )}
            </TabContent>
          )}
        </>
      </Container>
    </LoadingContext.Provider>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}
