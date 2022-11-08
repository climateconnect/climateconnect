import { makeStyles } from "@material-ui/core/styles";
import { Container, Divider, Tab, Tabs, useMediaQuery } from "@material-ui/core";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import _ from "lodash";
import React, { useContext, useEffect, useRef, useState, Suspense, useMemo } from "react";
import Cookies from "universal-cookie";
import getFilters from "../../../public/data/possibleFilters";
import { splitFiltersFromQueryObject } from "../../../public/lib/filterOperations";
import { loadMoreData } from "../../../public/lib/getDataOperations";
import { membersWithAdditionalInfo } from "../../../public/lib/getOptions";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";
import { getUserOrganizations } from "../../../public/lib/organizationOperations";
import {
  getInfoMetadataByType,
  getReducedPossibleFilters,
} from "../../../public/lib/parsingOperations";
import {
  findOptionByNameDeep,
  getFilterUrl,
  getSearchParams,
} from "../../../public/lib/urlOperations";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
import LoadingContext from "../context/LoadingContext";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import MobileBottomMenu from "./MobileBottomMenu";

const FilterSection = React.lazy(() => import("../indexPage/FilterSection"));
const IdeasBoard = React.lazy(() => import("../ideas/IdeasBoard"));
const OrganizationPreviews = React.lazy(() => import("../organization/OrganizationPreviews"));
const ProfilePreviews = React.lazy(() => import("../profile/ProfilePreviews"));
const ProjectPreviews = React.lazy(() => import("../project/ProjectPreviews"));
const Tutorial = React.lazy(() => import("../tutorial/Tutorial"));
const TabContentWrapper = React.lazy(() => import("./TabContentWrapper"));

const useStyles = makeStyles((theme) => {
  return {
    tab: {
      width: 200,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    mainContentDivider: {
      marginBottom: theme.spacing(3),
    },
    ideasTabLabel: {
      display: "flex",
      alignItems: "center",
    },
    ideasIcon: {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  };
});

export default function BrowseContent({
  initialMembers,
  initialOrganizations,
  initialProjects,
  initialIdeas,
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
  nextStepTriggeredBy,
  showIdeas,
  allHubs,
  initialIdeaUrlSlug,
  hubLocation,
  hubData,
  filters,
  handleUpdateFilterValues,
  initialLocationFilter,
  resetTabsWhereFiltersWereApplied,
  hubUrl,
  hubAmbassador,
}) {
  const initialState = {
    items: {
      projects: initialProjects ? [...initialProjects.projects] : [],
      organizations: initialOrganizations ? [...initialOrganizations.organizations] : [],
      ideas: initialIdeas ? [...initialIdeas.ideas] : [],
      members:
        initialMembers && !hideMembers ? membersWithAdditionalInfo(initialMembers.members) : [],
    },
    hasMore: {
      projects: initialProjects ? initialProjects.hasMore : true,
      organizations: initialOrganizations ? initialOrganizations.hasMore : true,
      members: initialMembers ? initialMembers.hasMore : true,
      ideas: initialIdeas ? initialIdeas.hasMore : true,
    },
    nextPages: {
      projects: 2,
      members: 2,
      organizations: 2,
      ideas: 2,
    },
    urlEnding: "",
  };

  const token = new Cookies().get("auth_token");
  //saving these refs for the tutorial
  const firstProjectCardRef = useRef(null);
  const filterButtonRef = useRef(null);
  const organizationsTabRef = useRef(null);

  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";
  const classes = useStyles();
  const TYPES_BY_TAB_VALUE = hideMembers
    ? ["projects", "organizations"]
    : ["projects", "organizations", "members"];
  if (showIdeas) {
    TYPES_BY_TAB_VALUE.push("ideas");
  }
  const { locale } = useContext(UserContext);
  const texts = useMemo(() => getTexts({ page: "general", locale: locale }), [locale]);
  const type_names = {
    projects: texts.projects,
    organizations: isNarrowScreen ? texts.orgs : texts.organizations,
    members: texts.members,
    ideas: texts.ideas,
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
    ideas: useRef(null),
  };

  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState(null);
  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };
  //When switching to the ideas tab: catch the orgs the user is a part of.
  //This info is required to share an idea
  useEffect(async function () {
    if (tabValue === TYPES_BY_TAB_VALUE.indexOf("ideas") && userOrganizations === null) {
      setUserOrganizations("");
      const userOrgsFromServer = await getUserOrganizations(token, locale);
      setUserOrganizations(userOrgsFromServer || []);
    }
  });
  // We have 2 distinct loading states: filtering, and loading more data. For
  // each state, we want to treat the loading spinner a bit differently, hence
  // why we have two separate pieces of state
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFetchingMoreData, setIsFetchingMoreData] = useState(false);

  const hasQueryParams = (Object.keys(getSearchParams(window.location.search)).length === 0) !== 0;

  const { showFeedbackMessage } = useContext(FeedbackContext);
  /**
   * Support the functionality of a user entering
   * a provided URL, that already has URL encoded
   * query params from a filter in it. In this use
   * case, we should automatically set the filters dynamically. Ensure
   * that this isn't invoked on extraneous renders.
   */
  const [initialized, setInitialized] = useState(false);

  const [nonFilterParams, setNonFilterParams] = useState({});

  useEffect(() => {
    const newHash = window?.location?.hash.replace("#", "");
    if (window.location.hash) {
      setHash(newHash);
      setTabValue(TYPES_BY_TAB_VALUE.indexOf(newHash));
    }
    if (!initialized) {
      // Update the state of the visual filters, like Select, Dialog, etc
      // Then actually fetch the data. We need a way to map what's
      // in the query param, to what UI element is present on the screen. For
      // example, if we have a MultiLevelSelect dialog representing categories
      // and we have a ?&category=Food waste, then we need to update the
      // the MultiLevelSelect dialog's selection to that value somehow.

      // For each query param option, ensure that it's
      // split into array before spreading onto the new filters object.
      const tabKey = newHash ? newHash : TYPES_BY_TAB_VALUE[0];
      const possibleFilters = getFilters({
        key: tabKey,
        filterChoices: filterChoices,
        locale: locale,
      });
      const queryObject = getQueryObjectFromUrl(getSearchParams(window.location.search));
      const splitQueryObject = splitFiltersFromQueryObject(queryObject, possibleFilters);
      const newFilters = {
        ...queryObject.filters,
      };
      setNonFilterParams(splitQueryObject.nonFilters);
      if (splitQueryObject?.nonFilters?.message) {
        showFeedbackMessage({
          message: splitQueryObject.nonFilters.message,
        });
      }

      if (initialLocationFilter) {
        const locationFilter = possibleFilters.find((f) => f.type === "location");
        newFilters[locationFilter.key] = initialLocationFilter;
      }
      // Apply new filters with the query object immediately:
      handleApplyNewFilters({
        type: tabKey,
        newFilters: newFilters,
        closeFilters: false,
        nonFilterParams: splitQueryObject.nonFilters,
      });

      // And then update state
      setInitialized(true);
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
        getFilters({
          key: TYPES_BY_TAB_VALUE[0],
          filterChoices: filterChoices,
          locale: locale,
        })
      );
      delete emptyFilters.location;
      const queryObject = getQueryObjectFromUrl(getSearchParams(window.location.search));
      //location is always set to "" here

      //persist the old location filter when switching tabs
      const tabKey = TYPES_BY_TAB_VALUE[newValue];
      const possibleFilters = getFilters({
        key: tabKey,
        filterChoices: filterChoices,
        locale: locale,
      });
      const locationFilter = possibleFilters.find((f) => f.type === "location");
      queryObject[locationFilter.key] = filters[locationFilter.key];
      const splitQueryObject = splitFiltersFromQueryObject(newFilters, possibleFilters);

      const newFilters = { ...emptyFilters, ...splitQueryObject.filters };
      const tabValue = TYPES_BY_TAB_VALUE[newValue];
      // Apply new filters with the query object immediately:
      handleApplyNewFilters({
        type: tabValue,
        newFilters: newFilters,
        closeFilters: false,
        nonFilterParams: splitQueryObject.nonFilters,
      });
    }

    window.location.hash = TYPES_BY_TAB_VALUE[newValue];
    setTabValue(newValue);
  };

  /* We always save filter values in the url in english.
  Therefore we need to get the name in the current language
  when retrieving them from the query object */
  const getValueInCurrentLanguage = (metadata, value) => {
    return findOptionByNameDeep({
      filterChoices: metadata.options,
      propertyToFilterBy: "original_name",
      valueToFilterBy: value,
    }).name;
  };

  const getQueryObjectFromUrl = (query) => {
    const queryObject = _.cloneDeep(query);
    const possibleFiltersMetadata = getFilters({
      key: "all",
      filterChoices: filterChoices,
      locale: locale,
    });
    const splitQueryObject = splitFiltersFromQueryObject(queryObject, possibleFiltersMetadata);
    for (const [key, value] of Object.entries(splitQueryObject.filters)) {
      const metadata = possibleFiltersMetadata.find((f) => f.key === key);

      if (value.indexOf(",") > 0) {
        queryObject[key] = value.split(",").map((v) => getValueInCurrentLanguage(metadata, v));
      } else if (
        metadata?.type === "multiselect" ||
        metadata?.type === "openMultiSelectDialogButton"
      ) {
        queryObject[key] = [getValueInCurrentLanguage(metadata, value)];
      } else if (key === "radius") {
        queryObject[key] = value + "km";
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

  const handleLoadMoreData = async (type) => {
    try {
      setIsFetchingMoreData(true);
      const res = await loadMoreData({
        type: type,
        page: state.nextPages[type],
        urlEnding: state.urlEnding,
        token: token,
        locale: locale,
        hubUrl: hubData?.url_slug,
      });

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
  const handleApplyNewFilters = async ({ type, newFilters, closeFilters, nonFilterParams }) => {
    const newUrl = getFilterUrl({
      activeFilters: newFilters,
      infoMetadata: getInfoMetadataByType(type),
      filterChoices: filterChoices,
      locale: locale,
      nonFilterParams: nonFilterParams,
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
    const res = await applyNewFilters({
      type: type,
      newFilters: newFilters,
      closeFilters: closeFilters,
      nonFilterParams: nonFilterParams,
    });
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
      nonFilterParams: nonFilterParams,
    });
    const res = await applyNewFilters({
      type: type,
      newFilters: newFilters,
      closeFilters: false,
    });
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

  const handleUpdateIdeaRating = (idea, newRating) => {
    const ideaInState = state.items.ideas.find((si) => si.url_slug === idea.url_slug);
    const ideaIndex = state.items.ideas.indexOf(ideaInState);
    setState({
      ...state,
      items: {
        ...state.items,
        ideas: [
          ...state.items.ideas.slice(0, ideaIndex),
          {
            ...idea,
            rating: newRating,
          },
          ...state.items.ideas.slice(ideaIndex + 1),
        ],
      },
    });
  };

  const tabContentWrapperProps = {
    tabValue: tabValue,
    TYPES_BY_TAB_VALUE: TYPES_BY_TAB_VALUE,
    filtersExpanded: filtersExpanded,
    handleApplyNewFilters: handleApplyNewFilters,
    filters: filters,
    handleUpdateFilterValues: handleUpdateFilterValues,
    errorMessage: errorMessage,
    isMobileScreen: isMobileScreen,
    filtersExandedOnMobile: filtersExandedOnMobile,
    handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
    locationInputRefs: locationInputRefs,
    locationOptionsOpen: locationOptionsOpen,
    filterChoices: filterChoices,
    unexpandFiltersOnMobile: unexpandFiltersOnMobile,
    unexpandFilters: unexpandFilters,
    initialLocationFilter: initialLocationFilter,
    isFiltering: isFiltering,
    state: state,
    hubName: hubName,
    nonFilterParams: nonFilterParams,
  };
  return (
    <LoadingContext.Provider
      value={{
        spinning: isFetchingMoreData || isFiltering,
      }}
    >
      <Container maxWidth="lg">
        <Suspense fallback={null}>
          <FilterSection
            filtersExpanded={isMobileScreen ? filtersExandedOnMobile : filtersExpanded}
            onSubmit={handleSearchSubmit}
            setFiltersExpanded={isMobileScreen ? setFiltersExpandedOnMobile : setFiltersExpanded}
            type={TYPES_BY_TAB_VALUE[tabValue]}
            customSearchBarLabels={customSearchBarLabels}
            filterButtonRef={filterButtonRef}
            searchValue={filters.search}
            hideFilterButton={tabValue === TYPES_BY_TAB_VALUE.indexOf("ideas")}
          />
        </Suspense>
        {/* Desktop screens: show tabs under the search bar */}
        {/* Mobile screens: show tabs fixed to the bottom of the screen */}
        {!isNarrowScreen ? (
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
              if (index === TYPES_BY_TAB_VALUE.indexOf("ideas")) {
                tabProps.label = (
                  <div className={classes.ideasTabLabel}>
                    <EmojiObjectsIcon className={classes.ideasIcon} /> {type_names[t]}
                  </div>
                );
              }
              if (index === 1) tabProps.ref = organizationsTabRef;
              return <Tab {...tabProps} key={index} />;
            })}
          </Tabs>
        ) : (
          <MobileBottomMenu
            tabValue={tabValue}
            handleTabChange={handleTabChange}
            TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
            type_names={type_names}
            organizationsTabRef={organizationsTabRef}
            hubAmbassador={hubAmbassador}
          />
        )}

        <Divider className={classes.mainContentDivider} />

        <Suspense fallback={<LoadingSpinner isLoading />}>
          <TabContentWrapper type={"projects"} {...tabContentWrapperProps}>
            <ProjectPreviews
              className={classes.itemsContainer}
              hasMore={state.hasMore.projects}
              loadFunc={() => handleLoadMoreData("projects")}
              parentHandlesGridItems
              projects={state.items.projects}
              firstProjectCardRef={firstProjectCardRef}
              hubUrl={hubUrl}
            />
          </TabContentWrapper>
          <TabContentWrapper type={"organizations"} {...tabContentWrapperProps}>
            <OrganizationPreviews
              hasMore={state.hasMore.organizations}
              loadFunc={() => handleLoadMoreData("organizations")}
              organizations={state.items.organizations}
              parentHandlesGridItems
            />
          </TabContentWrapper>
          {!hideMembers && (
            <TabContentWrapper type={"members"} {...tabContentWrapperProps}>
              <ProfilePreviews
                hasMore={state.hasMore.members}
                loadFunc={() => handleLoadMoreData("members")}
                parentHandlesGridItems
                profiles={state.items.members}
                showAdditionalInfo
              />
            </TabContentWrapper>
          )}
          <TabContentWrapper type={"ideas"} {...tabContentWrapperProps}>
            <IdeasBoard
              hasMore={state.hasMore.ideas}
              loadFunc={() => handleLoadMoreData("ideas")}
              ideas={state.items.ideas}
              allHubs={allHubs}
              userOrganizations={userOrganizations}
              onUpdateIdeaRating={handleUpdateIdeaRating}
              initialIdeaUrlSlug={initialIdeaUrlSlug}
              hubLocation={hubLocation}
              hubData={hubData}
              filters={filters}
              resetTabsWhereFiltersWereApplied={resetTabsWhereFiltersWereApplied}
              filterChoices={filterChoices}
            />
          </TabContentWrapper>
        </Suspense>
      </Container>
      <Suspense fallback={null}>
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
          handleTabChange={handleTabChange}
          typesByTabValue={TYPES_BY_TAB_VALUE}
        />
      </Suspense>
    </LoadingContext.Provider>
  );
}
