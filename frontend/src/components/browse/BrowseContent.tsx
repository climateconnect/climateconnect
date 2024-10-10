import makeStyles from "@mui/styles/makeStyles";
import { Container, Divider, Tab, Tabs, Theme, useMediaQuery } from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import _ from "lodash";
import React, { Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "universal-cookie";
import getFilters from "../../../public/data/possibleFilters";
import {
  applyNewFilters,
  splitFiltersFromQueryObject,
  v2applyNewFilters,
} from "../../../public/lib/filterOperations";
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
import HubTabsNavigation from "../hub/HubTabsNavigation";
import { BrowseTabs } from "../../types";

const FilterSection = React.lazy(() => import("../indexPage/FilterSection"));
const IdeasBoard = React.lazy(() => import("../ideas/IdeasBoard"));
const OrganizationPreviews = React.lazy(() => import("../organization/OrganizationPreviews"));
const ProfilePreviews = React.lazy(() => import("../profile/ProfilePreviews"));
const ProjectPreviews = React.lazy(() => import("../project/ProjectPreviews"));
const Tutorial = React.lazy(() => import("../tutorial/Tutorial"));
const TabContentWrapper = React.lazy(() => import("./TabContentWrapper"));

const useStyles = makeStyles((theme) => {
  return {
    contentRefContainer: {
      paddingTop: theme.spacing(4),
      position: "relative",
      [theme.breakpoints.down("md")]: {
        paddingTop: theme.spacing(2),
      },
    },
    contentRef: {
      position: "absolute",
      top: -90,
    },
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
    hubsTabNavigation: {
      top: -45,
      left: 0,
      right: 0,
    },
  };
});

interface BrowseContentProps {
  initialFilters: any;
  filterChoices: any;
  initialLocationFilter: any;
  applyNewFilters: any;

  // optional:
  hubsSubHeaderRef?: any;
  initialMembers?: any;
  initialOrganizations?: any;
  initialProjects?: any;
  initialIdeas?: any;
  customSearchBarLabels?: any;
  hideMembers?: boolean;
  hubName?: any;
  hubProjectsButtonRef?: any;
  hubQuickInfoRef?: any;
  nextStepTriggeredBy?: any;
  showIdeas?: boolean;
  allHubs?: any;
  initialIdeaUrlSlug?: string;
  hubLocation?: any;
  hubData?: any;
  resetTabsWhereFiltersWereApplied?: any;
  hubUrl?: string;
  hubAmbassador?: any;
  contentRef?: any;
}

export default function BrowseContent({
  initialMembers,
  initialOrganizations,
  initialProjects,
  initialIdeas,
  customSearchBarLabels,
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

  // removed filter related params
  // applyNewFilters,
  // filters,
  // handleUpdateFilterValues,
  // initialLocationFilter,

  //

  // filter related values
  initialFilters, // dict. of initial filter setup
  filterChoices, // dict. of possible filters and their values
  initialLocationFilter,

  resetTabsWhereFiltersWereApplied,
  hubUrl,
  hubAmbassador,
  contentRef,
}: BrowseContentProps) {
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
  const organizationsTabRef = useRef(null);

  const legacyModeEnabled = process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true";
  const classes = useStyles();
  const TYPES_BY_TAB_VALUE: BrowseTabs[] = hideMembers
    ? ["projects", "organizations"] // TODO: add "events" here, after implementing event calendar
    : ["projects", "organizations", "members"]; // TODO: add "events" here, after implementing event calendar
  if (showIdeas) {
    TYPES_BY_TAB_VALUE.push("ideas");
  }
  const { locale } = useContext(UserContext);
  const texts = useMemo(() => getTexts({ page: "general", locale: locale }), [locale]);

  // TODO: maybe rename this "hash" to "currentTab"
  const [hash, setHash] = useState<BrowseTabs>(TYPES_BY_TAB_VALUE[0]);
  // TODO: maybe rename this "tabValue" to "currentIdx"
  const [tabValue, setTabValue] = useState(0);

  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const type_names = {
    projects: texts.projects,
    organizations: isNarrowScreen ? texts.orgs : texts.organizations,
    members: texts.members,
    ideas: texts.ideas,
  };

  const [state, setState] = useState(initialState);
  const locationInputRefs = {
    projects: useRef(null),
    organizations: useRef(null),
    members: useRef(null),
    ideas: useRef(null),
  };

  const [locationOptionsOpen, setLocationOptionsOpen] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<any>(null);
  const handleSetLocationOptionsOpen = (bool) => {
    setLocationOptionsOpen(bool);
  };
  //When switching to the ideas tab: catch the orgs the user is a part of.
  //This info is required to share an idea
  useEffect(() => {
    (async function () {
      if (tabValue === TYPES_BY_TAB_VALUE.indexOf("ideas") && userOrganizations === null) {
        setUserOrganizations("");
        const userOrgsFromServer = await getUserOrganizations(token, locale);
        setUserOrganizations(userOrgsFromServer || []);
      }
    })();
  });

  const { showFeedbackMessage } = useContext(FeedbackContext);
  /**
   * Support the functionality of a user entering
   * a provided URL, that already has URL encoded
   * query params from a filter in it. In this use
   * case, we should automatically set the filters dynamically. Ensure
   * that this isn't invoked on extraneous renders.
   */
  const [initialized, setInitialized] = useState(false);

  /**
   * -----------------------------------------
   * HANDLE FILTER SATE AND pushed down stuff
   */
  const [nonFilterParams, setNonFilterParams] = useState({});

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const newHash = window?.location?.hash.replace("#", "") as BrowseTabs;
    if (window.location.hash) {
      const tabIdx = TYPES_BY_TAB_VALUE.indexOf(newHash);
      if (tabIdx != -1) {
        setHash(newHash);
        setTabValue(tabIdx);
      } else {
        setHash(TYPES_BY_TAB_VALUE[0]);
        setTabValue(0);
      }
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

      loadDataBasedOnUrl();

      setInitialized(true);
      return;
      const tabKey = TYPES_BY_TAB_VALUE[tabValue];
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
        const locationFilter: any = possibleFilters.find((f) => f.type === "location");
        newFilters[locationFilter.key] = initialLocationFilter;
      }

      console.log("SET NEW FILTERS (1)", newFilters, splitQueryObject.nonFilters);
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

    if (tabKey === "events") {
      // TODO: add event calendar here!
    } else {
      const possibleFilters = getFilters({
        key: tabKey,
        filterChoices: filterChoices,
        locale: locale,
      });
      const locationFilter: any = possibleFilters.find((f) => f.type === "location");
      queryObject[locationFilter.key] = filters[locationFilter.key];
      const splitQueryObject = splitFiltersFromQueryObject(
        /*TODO(undefined) newFilters*/ queryObject,
        possibleFilters
      );

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

  // ###################################################
  // ###################################################
  // LAB ZONE
  // ###################################################
  // ###################################################
  const loadDataBasedOnUrl = async () => {
    console.log("start filtering/loading");
    setIsFiltering(true);

    // TODO: the following should never be needed. Instead use the state
    // and keep the state updated.
    // If you do not want to use the state (which is fine), remove the state
    // and use a service (util functions instead) to grab the current hash
    // !!!
    // I shall not rely on the state because this might lead to a race condition.
    // Instead parse out the hash as in the upper section
    // later during refactoring push it down to the other page
    //
    // const newHash = window?.location?.hash.replace("#", "");
    // if (window.location.hash) {
    //   setHash(newHash);
    //   setTabValue(TYPES_BY_TAB_VALUE.indexOf(newHash));
    // }
    // console.log("new hash", newHash);

    // const tabKey = newHash ? newHash : TYPES_BY_TAB_VALUE[0];
    // console.log("tabkey", tabKey);

    // TODO: this might be a dumb idea, but shouldn't I basicly just parse url
    // to the server?
    // no, because there hidden filters as well. But these should be fixed/come from my parent
    // there fore the access is simple

    // ----------------------------
    // Unwrapping the BrowseConent < handleApplyNewFilters >

    // TODO: ignoring the location indication for now. Maybe it does not belong to this
    // component anyways
    // if (!legacyModeEnabled && newFilters.location && !isLocationValid(newFilters.location)) {
    // hadnle

    // clear current error message
    setErrorMessage("");
    // set the state to loading/filtering data
    setIsFiltering(true);
    // TODO: remove after rename
    const currentTab = hash;

    // TODO: maybe be more carfull with "user input" (search params can be user/attacker controlled)
    const queryObject = getQueryObjectFromUrl(getSearchParams(window.location.search));

    // TODO: not sure if this is nessecary
    // const possibleFilters = getFilters({
    //   key: currentTab,
    //   filterChoices: filterChoices,
    //   locale: locale,
    // });
    // const splitQueryObject = splitFiltersFromQueryObject(queryObject, possibleFilters);

    const filters = { ...queryObject.filters };
    // TODO reimplement Caching
    // * Record the tabs in which the filters were applied already
    // * so one does not have to query them twice
    console.log("current filters:", filters);
    const res = await v2applyNewFilters({
      currentTab,
      filters,
      filterChoices,
      locale,
      token,
      hubUrl,
    });
    // adjust data based on the result of applyNewFilters
    if (res?.filteredItemsObject) {
      // TODO: is a copy needed, as setState is only triggered after updating everything
      const newState = state;

      newState.items[currentTab] = res.filteredItemsObject[currentTab];
      newState.hasMore[currentTab] = res.filteredItemsObject.hasMore;
      newState.urlEnding = res.newUrlEnding ?? "";
      newState.nextPages[currentTab] = 2;

      setState(newState);
      console.log("handle apply new filters: setting state success");
    }
    setIsFiltering(false);
  };

  // Handle an URL Change
  // extract filters and update data
  useEffect(() => {
    // one could install react-router dom to
    // listen for url updates, that do not navigate.
    // -----------
    // Another option is the following *hack*:
    //
    // Listener:
    //    window.addEventListener("popstate", ...);
    // or
    //    window.addEventListener("hashchange", ...);
    //
    // Sending Component
    //    window.history.pushState({}, "", newUrl);
    //    let tmp = window.location.hash;
    //    window.location.hash = "force update";
    //    window.location.hash = tmp;
    // -----------
    // another option is a "callback" function
    // -----------
    // I decided to implement the following solution as
    //    - it is lightweight
    //    - the filters will be safed in the URL anyways (UX reasons)
    //    - no additional dependency
    //    - "low" complexity (vanilla JS)

    const handleURLChange = () => {
      const queryParams = new URLSearchParams(window.location.search);
      console.log("new query params:", queryParams);
      loadDataBasedOnUrl();
    };

    window.addEventListener("urlChange", handleURLChange);
    return () => {
      window.removeEventListener("urlChange", handleURLChange);
    };
  }, []);

  // ###################################################
  // ###################################################
  // FILTER AND DATA LOADING ZONE
  // ###################################################
  // ###################################################
  // We have 2 distinct loading states: filtering, and loading more data. For
  // each state, we want to treat the loading spinner a bit differently, hence
  // why we have two separate pieces of state
  const [filters, setFilters] = useState(initialFilters ?? {});
  const handleUpdateFilterValues = (valuesToUpdate) => {
    setFilters({
      ...filters,
      ...valuesToUpdate,
    });
  };

  const [tabsWhereFiltersWereApplied, setTabsWhereFiltersWereApplied] = useState([]);

  const handleSetTabsWhereFiltersWereApplied = (tabs) => {
    setTabsWhereFiltersWereApplied(tabs);
  };

  const [isFiltering, setIsFiltering] = useState(false);
  const [isFetchingMoreData, setIsFetchingMoreData] = useState(false);
  const filterButtonRef = useRef(null);

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
    for (const [key, value] of Object.entries(splitQueryObject.filters) as any) {
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
    // TODO: creating a new URL is not nessescary
    // const newUrl = getFilterUrl({
    //   activeFilters: newFilters,
    //   infoMetadata: getInfoMetadataByType(type),
    //   filterChoices: filterChoices,
    //   locale: locale,
    //   nonFilterParams: nonFilterParams,
    // });
    // if (newUrl !== window?.location?.href) {
    //   window.history.pushState({}, "", newUrl);
    // }
    // TODO: end useless

    // Only push state if there's a URL change. Be sure to account for the
    // hash link / fragment on the end of the URL (e.g. #skills).
    console.log("handle apply new filters");
    if (!legacyModeEnabled && newFilters.location && !isLocationValid(newFilters.location)) {
      indicateWrongLocation(
        locationInputRefs[type],
        setLocationOptionsOpen,
        (errorMessage: string) => setErrorMessage(errorMessage),
        texts
      );
      console.log("handle apply new filters: return in first if");
      return;
    }
    console.log("handle apply new filters: skip first if");

    setErrorMessage("");
    setIsFiltering(true);
    console.log("handle apply new filters: start filtering");
    // const res = await applyNewFilters({
    //   type: type,
    //   newFilters: newFilters,
    //   closeFilters: closeFilters,
    //   nonFilterParams: nonFilterParams,
    // });
    console.log("handle apply new filters: filters");
    console.log(newFilters);

    const res = await applyNewFilters({
      type: type,
      filters: {}, // TODO: proper "last filter" => goal: caching
      newFilters: newFilters,
      closeFilters: closeFilters,
      filterChoices: filterChoices,
      locale: locale,
      token: token,
      handleAddFilters: (newFilters: any) => {}, // TODO: not really needed
      handleSetErrorMessage: () => {}, //TODO: handleSetErrorMessage,
      tabsWhereFiltersWereApplied,
      handleSetTabsWhereFiltersWereApplied: handleSetTabsWhereFiltersWereApplied,
    });

    console.log("handle apply new filters: download done");

    // TODO: this should be performed by the filters itself
    // if (res?.closeFilters) {
    //   if (isNarrowScreen) setFiltersExpandedOnMobile(false);
    //   else setFiltersExpanded(false);
    // }

    console.log("handle apply new filters: try setting state");
    console.log(res);
    if (res?.filteredItemsObject) {
      setState({
        ...state,
        items: { ...state.items, [type]: res.filteredItemsObject[type] },
        hasMore: { ...state.hasMore, [type]: res.filteredItemsObject.hasMore },
        urlEnding: res.newUrlEnding ?? "",
        nextPages: { ...state.nextPages, [type]: 2 },
      });
      console.log("handle apply new filters: setting state success");
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
      // TODO: I just hate my life. this filtering is interesting or just crazy
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
        urlEnding: res.newUrlEnding ?? "",
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

  // ###################################################
  // ###################################################
  // FILTER AND DATA LOADING ZONE
  // ENDS HERE
  // ###################################################
  // ###################################################

  const tabContentWrapperProps = {
    tabValue: tabValue,
    TYPES_BY_TAB_VALUE: TYPES_BY_TAB_VALUE,
    isFiltering: isFiltering,
    state: state,
    hubName: hubName,
  };

  // TODO: reduce it
  const filterContentProps = {
    errorMessage: errorMessage,
    filters: filters,
    // filtersExandedOnMobile: filtersExandedOnMobile,
    filterChoices: filterChoices,
    handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
    handleUpdateFilterValues: handleUpdateFilterValues,
    initialLocationFilter: initialLocationFilter,
    locationInputRefs: locationInputRefs,
    locationOptionsOpen: locationOptionsOpen,
    nonFilterParams: nonFilterParams,
  };

  return (
    <LoadingContext.Provider
      value={{
        spinning: isFetchingMoreData || isFiltering,
      }}
    >
      {hubData?.hub_type === "location hub" && (
        <HubTabsNavigation
          TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
          tabValue={tabValue}
          handleTabChange={handleTabChange}
          type_names={type_names}
          organizationsTabRef={organizationsTabRef}
          hubUrl={hubUrl}
          className={classes.hubsTabNavigation}
          allHubs={allHubs}
        />
      )}
      <Container maxWidth="lg" className={classes.contentRefContainer}>
        <div ref={contentRef} className={classes.contentRef} />
        <Suspense fallback={null}>
          {/* TODO */}
          <FilterSection
            // filtersExpanded={isNarrowScreen ? filtersExandedOnMobile : filtersExpanded}
            onSubmit={handleSearchSubmit}
            // setFiltersExpanded={isNarrowScreen ? setFiltersExpandedOnMobile : setFiltersExpanded}
            type={TYPES_BY_TAB_VALUE[tabValue]}
            customSearchBarLabels={customSearchBarLabels}
            filterButtonRef={filterButtonRef}
            // TODO: fitersection should get an initalState and then deal with the filters on
            // their own.
            // BrowseContent does not need to interfere with the filters, as
            // its resposibility is only the data display based on the URL
            // searchValue={filters.search}

            applyBackgroundColor={hubData?.hub_type === "location hub"}
            {...filterContentProps}
          />
        </Suspense>
        {/* Desktop screens: show tabs under the search bar */}
        {/* Mobile screens: show tabs fixed to the bottom of the screen */}
        {!isNarrowScreen && hubData?.hub_type !== "location hub" && (
          <Tabs
            variant={isNarrowScreen ? "fullWidth" : "standard"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered={true}
          >
            {TYPES_BY_TAB_VALUE.map((t, index) => {
              const tabProps: any = {
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
        )}
        {isNarrowScreen && (
          <MobileBottomMenu
            tabValue={tabValue}
            handleTabChange={handleTabChange}
            TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
            //TODO(unused) type_names={type_names}
            organizationsTabRef={organizationsTabRef}
            hubAmbassador={hubAmbassador}
          />
        )}

        {hubData?.hub_type !== "location hub" && <Divider className={classes.mainContentDivider} />}

        <Suspense fallback={<LoadingSpinner isLoading />}>
          <TabContentWrapper type={"projects"} {...tabContentWrapperProps}>
            <ProjectPreviews
              //TODO(unused) className={classes.itemsContainer}
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
