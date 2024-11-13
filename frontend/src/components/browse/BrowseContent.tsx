import makeStyles from "@mui/styles/makeStyles";
import { Container, Divider, Tab, Tabs, Theme, useMediaQuery } from "@mui/material";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import _ from "lodash";
import React, { Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { loadDataBasedOnNewFilters } from "../../../public/lib/filterOperations";
// import { loadMoreData } from "../../../public/lib/getDataOperations";
import { loadMoreData } from "../../../public/lib/getCachedDataOperations";
import { membersWithAdditionalInfo } from "../../../public/lib/getOptions";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";
import { getUserOrganizations } from "../../../public/lib/organizationOperations";
import getTexts from "../../../public/texts/texts";
import LoadingContext from "../context/LoadingContext";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import MobileBottomMenu from "./MobileBottomMenu";
import HubTabsNavigation from "../hub/HubTabsNavigation";
import { BrowseTabs, FilterChoices } from "../../types";
// import { useRouter } from "next/router";
import HubSupporters from "../hub/HubSupporters";

const FilterSection = React.lazy(() => import("../indexPage/FilterSection"));
// TODO: shall be deleted in future
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
  filterChoices: FilterChoices; // TODO (Karol): maybe rename it to filterOptions
  initialLocationFilter: any;

  // optional:
  hubsSubHeaderRef?: any;
  initialMembers?: any;
  initialOrganizations?: any;
  initialProjects?: any;
  // TODO: remove in the future
  initialIdeas?: any;
  customSearchBarLabels?: any;
  hideMembers?: boolean;
  hubName?: any;
  hubProjectsButtonRef?: any;
  hubQuickInfoRef?: any;
  nextStepTriggeredBy?: any;
  // TODO: remove in the future
  showIdeas?: boolean;
  allHubs?: any;
  initialIdeaUrlSlug?: string;
  // TODO: remove in the future (only used by Idea Board)
  hubLocation?: any;
  hubData?: any;
  hubUrl?: string;
  hubAmbassador?: any;
  contentRef?: any;
  hubSupporters?: any;
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
  hubData,

  // filter related values
  filterChoices, // dict. of possible filters and their values
  initialLocationFilter,

  hubUrl,
  hubAmbassador,
  contentRef,
  hubSupporters,
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
  // TOOD: good location for a custom hook that keeps the url hash and this state in sync
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

  const handleTabChange = (event, newValue) => {
    newValue = parseInt(newValue, 10);
    if (isNaN(newValue)) {
      return;
    }

    const newTab = TYPES_BY_TAB_VALUE[newValue];
    setHash(newTab);
    setTabValue(newValue);
    window.location.hash = newTab;

    loadDataBasedOnUrl(newTab);
  };

  // ###################################################
  // LOADING DATA FEATURES
  /**
   * Support the functionality of a user entering
   * a provided URL, that already has URL encoded
   * query params from a filter in it. In this use
   * case, we should automatically set the filters dynamically. Ensure
   * that this isn't invoked on extraneous renders.
   *
   * In fact, we use the url as the source of truth for the filters.
   * Thus, the FilterSection update the URL and onURLChange the BrowseeContent
   * will trigger a new query, await the data and distribute it to the
   * different tabs views / components.
   */

  const [errorMessage, setErrorMessage] = useState("");

  // load the hash from the URL on mount
  useEffect(() => {
    const newHash = window?.location?.hash.replace("#", "") as BrowseTabs;
    if (window.location.hash) {
      const tabIdx = TYPES_BY_TAB_VALUE.indexOf(newHash);
      if (tabIdx != -1) {
        setHash(newHash);
        setTabValue(tabIdx);
        loadDataBasedOnUrl(newHash);
      } else {
        setHash(TYPES_BY_TAB_VALUE[0]);
        setTabValue(0);
        loadDataBasedOnUrl(TYPES_BY_TAB_VALUE[0]);
      }
    }
  }, []);

  /**
   * Loads data based on the current URL or a new tab selection.
   * This method is/should be called on URL change and tab change.
   *
   * @param {BrowseTabs} [newTab] - The new tab to load data for.
   * If not provided, the current hash state is used.
   * This value in nessary if this function is called on tab change. As setState(hash) is async,
   * the hash state might not be updated yet.
   * @returns {Promise<void>} - A promise that resolves when the data loading is complete.
   */
  const loadDataBasedOnUrl = async (newTab?: BrowseTabs) => {
    // this method will be called on URL change and (!) on tab change
    // if the tab changed, the hash State will be updated via setState

    console.debug("[BrowseContent]: start filtering/loading");
    setIsFiltering(true);

    // clear current error message
    setErrorMessage("");
    // set the state to loading/filtering data
    setIsFiltering(true);
    // TODO: remove after rename
    const currentTab = newTab ? newTab : hash;

    const res = await loadDataBasedOnNewFilters(
      currentTab,
      // TODO: maybe be more carfull with "user input" (search params can be user/attacker controlled)
      window.location.search,
      filterChoices,
      locale,
      token,
      hubUrl
    );
    // adjust data based on the result of applyNewFilters
    if (res?.filteredItemsObject) {
      // TODO: is a copy needed, as setState is only triggered after updating everything
      const newState = state;

      newState.items[currentTab] = res.filteredItemsObject[currentTab];
      newState.hasMore[currentTab] = res.filteredItemsObject.hasMore;
      newState.nextPages[currentTab] = 2;
      newState.urlEnding = res.newUrlEnding ?? "";

      setState(newState);
      console.debug("[BrowseContent]: handle apply new filters: setting state success");
    }
    setIsFiltering(false);
  };

  // Handle an URL Change
  // extract filters and update data

  // TODO: use the useRouter Hook (next router) to listen for URL changes
  // TODO: this useEffect is not nessecary
  //https://react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store
  useEffect(() => {
    const handleURLChange = () => {
      const queryParams = new URLSearchParams(window.location.search);
      console.debug("[BrowseContent]: url update => new URLSearchParams:", queryParams);
      loadDataBasedOnUrl();
    };

    window.addEventListener("urlChange", handleURLChange);
    return () => {
      window.removeEventListener("urlChange", handleURLChange);
    };
  }, []);

  // We have 2 distinct loading procedures: filtering, and loading more data. For
  // each procedures, we want to treat the loading spinner a bit differently, hence
  // why we have two separate pieces of state

  const [isFiltering, setIsFiltering] = useState(false);
  const [isFetchingMoreData, setIsFetchingMoreData] = useState(false);
  const filterButtonRef = useRef(null);

  const handleLoadMoreData = async (type: BrowseTabs) => {
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

  // ###################################################
  // ###################################################
  // DATA LOADING ZONE
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
        {isNarrowScreen && hubSupporters && (
          <HubSupporters supportersList={hubSupporters} hubName={hubName} />
        )}
        <div ref={contentRef} className={classes.contentRef} />
        <Suspense fallback={null}>
          {/* TODO */}
          <FilterSection
            type={TYPES_BY_TAB_VALUE[tabValue]}
            customSearchBarLabels={customSearchBarLabels}
            filterButtonRef={filterButtonRef}
            applyBackgroundColor={hubData?.hub_type === "location hub"}
            errorMessage={errorMessage}
            filterChoices={filterChoices}
            handleSetLocationOptionsOpen={handleSetLocationOptionsOpen}
            initialLocationFilter={initialLocationFilter}
            locationInputRefs={locationInputRefs}
            locationOptionsOpen={locationOptionsOpen}
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

          {/* TODO: Idea Board shall be removed: handleUpdateIdeaRating is was already deleted, but this change might need to be
          revoked so that the idea board can be removed with a seperate PR */}
          {/* <TabContentWrapper type={"ideas"} {...tabContentWrapperProps}>
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
          </TabContentWrapper> */}
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
