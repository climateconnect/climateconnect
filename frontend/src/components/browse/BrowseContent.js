import { Container, Divider, makeStyles, Tab, Tabs, useMediaQuery } from "@material-ui/core";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState } from "react";
import possibleFilters from "../../../public/data/possibleFilters";
import { membersWithAdditionalInfo } from "../../../public/lib/getOptions";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";
import {
  getInfoMetadataByType,
  getReducedPossibleFilters
} from "../../../public/lib/parsingOperations";
import { getFilterUrl, getSearchParams } from "../../../public/lib/urlOperations";
import getTexts from "../../../public/texts/texts";
import LoadingContext from "../context/LoadingContext";
import UserContext from "../context/UserContext";
import FilterContent from "../filter/FilterContent";
import LoadingSpinner from "../general/LoadingSpinner";
import FilterSection from "../indexPage/FilterSection";
import OrganizationPreviews from "../organization/OrganizationPreviews";
import ProfilePreviews from "../profile/ProfilePreviews";
import ProjectPreviews from "../project/ProjectPreviews";
import Tutorial from "../tutorial/Tutorial";
import NoItemsFound from "./NoItemsFound";

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
  applyNewFilters,
  customSearchBarLabels,
  errorMessage,
  filterChoices,
  handleSetErrorMessage,
  hideMembers,
  hubName,
  hubProjectsButtonRef,
  hubQuickInfoRef,
  hubsSubHeaderRef,
  initialMembers,
  initialOrganizations,
  initialProjects,
  loadMoreData,
  nextStepTriggeredBy,
  initialLocationFilter,
  filters,
  handleUpdateFilterValues,
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
    urlEnding: "",
  };

  //saving these refs for the tutorial
  const firstProjectCardRef = useRef(null);
  const filterButtonRef = useRef(null);
  const organizationsTabRef = useRef(null);

  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";
  const classes = useStyles();
  const TYPES_BY_TAB_VALUE = hideMembers
    ? ["projects", "organizations"]
    : ["projects", "organizations", "members"];

  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const type_names = {
    projects: texts.projects,
    organizations: texts.organizations,
    members: texts.members,
  };
  const [hash, setHash] = useState(null);
  const [tabValue, setTabValue] = useState(hash ? TYPES_BY_TAB_VALUE.indexOf(hash) : 0);

  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const isMobileScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));

  // Always default to filters being expanded
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  // On mobile filters take up the whole screen so they aren't expanded by default
  const [filtersExandedOnMobile, setFiltersExpandedOnMobile] = useState(false);
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

  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(TYPES_BY_TAB_VALUE.indexOf(window.location.hash.replace("#", "")));
    }
  }, []);

  const hasQueryParams = (Object.keys(getSearchParams(window.location.search)).length === 0) !== 0;

  /**
   * Support the functionality of a user entering
   * a provided URL, that already has URL encoded
   * query params from a filter in it. In this use
   * case, we should automatically set the filters dynamically. Ensure
   * that this isn't invoked on extraneous renders.
   */
  const [hasFilteredByInitialQueryParams, setHasFilteredByInitialQueryParams] = useState(false);

  useEffect(() => {
    if (!hasFilteredByInitialQueryParams) {
      // Update the state of the visual filters, like Select, Dialog, etc
      // Then actually fetch the data. We need a way to map what's
      // in the query param, to what UI element is present on the screen. For
      // example, if we have a MultiLevelSelect dialog representing categories
      // and we have a ?&category=Food waste, then we need to update the
      // the MultiLevelSelect dialog's selection to that value somehow.

      // For each query param option, ensure that it's
      // split into array before spreading onto the new filters object.
      const queryObject = getQueryObject(getSearchParams(window.location.search));
      const newFilters = {
        ...queryObject,
      };

      const tabName = TYPES_BY_TAB_VALUE[tabValue];

      // Apply new filters with the query object immediately:
      handleApplyNewFilters(tabName, newFilters, false, state.urlEnding);

      // And then update state
      setHasFilteredByInitialQueryParams(true);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    if (hasQueryParams) {
      // Update the state of the visual filters, like Select, Dialog, etc
      // Then actually fetch the data. We need a way to map what's
      // in the query param, to what UI element is present on the screen. For
      // example, if we have a MultiLevelSelect dialog representing categories
      // and we have a ?&category=Food waste, then we need to update the
      // the MultiLevelSelect dialog's selection to that value somehow.

      // For each query param option, ensure that it's
      // split into array before spreading onto the new filters object.
      const emptyFilters = getReducedPossibleFilters(
        possibleFilters({
          key: TYPES_BY_TAB_VALUE[0],
          filterChoices: filterChoices,
          locale: locale,
        })
      );
      delete emptyFilters.location;
      const queryObject = getQueryObject(getSearchParams(window.location.search));
      //location is always set to "" here
      const newFilters = { ...emptyFilters, ...queryObject };
      const tabValue = TYPES_BY_TAB_VALUE[newValue];

      // Apply new filters with the query object immediately:
      handleApplyNewFilters(tabValue, newFilters, false, state.urlEnding);
    }

    window.location.hash = TYPES_BY_TAB_VALUE[newValue];
    setTabValue(newValue);
  };

  /* We always save filter values in the url in english. 
  Therefore we need to get the name in the current language
  when retrieving them from the query object */
  const getValueInCurrentLanguage = (metadata, value) => {
    return metadata.options.find((o) => o.original_name === value).name;
  };

  const getQueryObject = (query) => {
    const queryObject = _.cloneDeep(query);
    const possibleFiltersMetadata = possibleFilters({
      key: "all",
      filterChoices: filterChoices,
      locale: locale,
    });
    for (const [key, value] of Object.entries(queryObject)) {
      const metadata = possibleFiltersMetadata.find((f) => f.key === key);

      if (value.indexOf(",") > 0) {
        queryObject[key] = value.split(",").map((v) => getValueInCurrentLanguage(metadata, v));
      } else if (metadata?.type === "multiselect") {
        queryObject[key] = [getValueInCurrentLanguage(metadata, value)];
      }
    }
    return queryObject;
  };

  const unexpandFilters = () => {
    setFiltersExpanded(false);
  };

  const unexpandFiltersOnMobile = () => {
    setFiltersExpandedOnMobile(false);
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
      const res = await loadMoreData(type, state.nextPages[type], state.urlEnding);

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
   * state, and persists the new filters as query params in the URL.
   */
  const handleApplyNewFilters = async (type, newFilters, closeFilters) => {
    const newUrl = getFilterUrl({
      activeFilters: newFilters,
      infoMetadata: getInfoMetadataByType(type),
      filterChoices: filterChoices,
      locale: locale,
    });
    if (newUrl !== window?.location?.href) {
      window.history.pushState({}, "", newUrl);
    }
    // Only push state if there's a URL change. Be sure to account for the
    // hash link / fragment on the end of the URL (e.g. #skills).

    if (!legacyModeEnabled && newFilters.location && !isLocationValid(newFilters.location)) {
      indicateWrongLocation(
        locationInputRefs[type],
        setLocationOptionsOpen,
        handleSetErrorMessage,
        texts
      );
      return;
    }

    handleSetErrorMessage("");
    setIsFiltering(true);

    const res = await applyNewFilters(type, newFilters, closeFilters);
    if (res?.closeFilters) {
      if (isMobileScreen) setFiltersExpandedOnMobile(false);
      else setFiltersExpanded(false);
    }

    if (res?.filteredItemsObject) {
      setState({
        ...state,
        items: { ...state.items, [type]: res.filteredItemsObject[type] },
        hasMore: { ...state.hasMore, [type]: res.filteredItemsObject.hasMore },
        urlEnding: res.newUrlEnding,
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
    const newFilters = { ...filters, search: searchValue };
    const newUrl = getFilterUrl({
      activeFilters: newFilters,
      infoMetadata: getInfoMetadataByType(type),
      filterChoices: filterChoices,
      locale: locale,
    });
    const res = await applyNewFilters(type, newFilters, false);
    setIsFiltering(false);
    if (newUrl !== window?.location?.href) {
      window.history.pushState({}, "", newUrl);
    }

    if (res?.filteredItemsObject) {
      setState({
        ...state,
        items: { ...state.items, [type]: res.filteredItemsObject[type] },
        hasMore: { ...state.hasMore, [type]: res.filteredItemsObject.hasMore },
        urlEnding: res.newUrlEnding,
        nextPages: { ...state.nextPages, [type]: 2 },
      });
    }
  };

  /*This is specifically for location hubs:
    Sector hubs don't show members
    We only know whether a hub is a location hub after loading initial props
    Therefore we only catch members on location hubs after they are initialized.
  */
  useEffect(
    function () {
      if (initialMembers) {
        setState({
          ...state,
          items: { ...state.items, members: membersWithAdditionalInfo(initialMembers.members) },
          hasMore: { ...state.hasMore, members: initialMembers.hasMore },
        });
      }
    },
    [initialMembers]
  );

  return (
    <LoadingContext.Provider
      value={{
        spinning: isFetchingMoreData || isFiltering,
      }}
    >
      <Container maxWidth="lg">
        <FilterSection
          filtersExpanded={isMobileScreen ? filtersExandedOnMobile : filtersExpanded}
          onSubmit={handleSearchSubmit}
          setFiltersExpanded={isMobileScreen ? setFiltersExpandedOnMobile : setFiltersExpanded}
          type={TYPES_BY_TAB_VALUE[tabValue]}
          customSearchBarLabels={customSearchBarLabels}
          filterButtonRef={filterButtonRef}
          searchValue={filters.search}
        />
        <Tabs
          variant={isNarrowScreen ? "fullWidth" : "standard"}
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered={true}
        >
          {TYPES_BY_TAB_VALUE.map((t, index) => {
            const tabProps = {
              label: type_names[t],
              className: classes.tab,
            };
            if (index === 1) tabProps.ref = organizationsTabRef;
            return <Tab {...tabProps} key={index} />;
          })}
        </Tabs>

        <Divider className={classes.mainContentDivider} />

        <>
          <TabContent value={tabValue} index={0}>
            {filtersExpanded && tabValue === 0 && (
              <FilterContent
                applyFilters={handleApplyNewFilters}
                className={classes.tabContent}
                filters={filters}
                handleUpdateFilters={handleUpdateFilterValues}
                errorMessage={errorMessage}
                filtersExpanded={isMobileScreen ? filtersExandedOnMobile : filtersExpanded}
                handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
                locationInputRef={locationInputRefs[TYPES_BY_TAB_VALUE[0]]}
                locationOptionsOpen={locationOptionsOpen}
                possibleFilters={possibleFilters({
                  key: TYPES_BY_TAB_VALUE[0],
                  filterChoices: filterChoices,
                  locale: locale,
                })}
                type={TYPES_BY_TAB_VALUE[0]}
                unexpandFilters={isMobileScreen ? unexpandFiltersOnMobile : unexpandFilters}
                initialLocationFilter={initialLocationFilter}
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
                firstProjectCardRef={firstProjectCardRef}
              />
            ) : (
              <NoItemsFound type="projects" />
            )}
          </TabContent>

          <TabContent value={tabValue} index={1} className={classes.tabContent}>
            {filtersExpanded && tabValue === 1 && (
              <FilterContent
                applyFilters={handleApplyNewFilters}
                className={classes.tabContent}
                errorMessage={errorMessage}
                filters={filters}
                handleUpdateFilters={handleUpdateFilterValues}
                filtersExpanded={filtersExpanded}
                handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
                locationInputRef={locationInputRefs[TYPES_BY_TAB_VALUE[1]]}
                locationOptionsOpen={locationOptionsOpen}
                possibleFilters={possibleFilters({
                  key: TYPES_BY_TAB_VALUE[1],
                  filterChoices: filterChoices,
                  locale: locale,
                })}
                type={TYPES_BY_TAB_VALUE[1]}
                unexpandFilters={unexpandFilters}
                initialLocationFilter={initialLocationFilter}
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
                  filters={filters}
                  handleUpdateFilters={handleUpdateFilterValues}
                  applyFilters={handleApplyNewFilters}
                  filtersExpanded={filtersExpanded}
                  errorMessage={errorMessage}
                  unexpandFilters={unexpandFilters}
                  possibleFilters={possibleFilters({
                    key: TYPES_BY_TAB_VALUE[2],
                    filterChoices: filterChoices,
                    locale: locale,
                  })}
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
      <Tutorial
        fixedPosition
        pointerRefs={{
          projectCardRef: firstProjectCardRef,
          filterButtonRef: filterButtonRef,
          organizationsTabRef: organizationsTabRef,
          hubsSubHeaderRef: hubsSubHeaderRef,
          hubQuickInfoRef: hubQuickInfoRef,
          hubProjectsButtonRef: hubProjectsButtonRef,
        }}
        hubName={hubName}
        nextStepTriggeredBy={nextStepTriggeredBy}
      />
    </LoadingContext.Provider>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}
