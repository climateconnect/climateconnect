import React, { useEffect } from "react";
import { Container, Tabs, Tab, Divider, useMediaQuery, makeStyles } from "@material-ui/core";
import FilterSection from "../indexPage/FilterSection";
import FilterContent from "../filter/FilterContent";
import ProjectPreviews from "../project/ProjectPreviews";
import ProfilePreviews from "../profile/ProfilePreviews";
import OrganizationPreviews from "../organization/OrganizationPreviews";
import possibleFilters from "../../../public/data/possibleFilters";
import NoItemsFound from "./NoItemsFound";
import Cookies from "universal-cookie";

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
  getProjects,
  getOrganizations,
  getMembers,
  membersObject,
  organizationsObject,
  projectsObject,
  applyNewFilters,
  filterChoices,
  loadMoreData,
  membersWithAdditionalInfo,
}) {
  const classes = useStyles();
  const token = new Cookies().get("token")
  const TYPES_BY_TAB_VALUE = ["projects", "organizations", "members"];
  const [hash, setHash] = React.useState(null);
  const [tabValue, setTabValue] = React.useState(hash ? TYPES_BY_TAB_VALUE.indexOf(hash) : 0);
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const initialState = {
    items: {
      projects: projectsObject ? [...projectsObject.projects] : [],
      organizations: organizationsObject ? [...organizationsObject.organizations] : [],
      members: membersObject ? membersWithAdditionalInfo(membersObject.members) : [],
    },
    hasMore: {
      projects: !!projectsObject && projectsObject.hasMore,
      organizations: !!organizationsObject && organizationsObject.hasMore,
      members: !!membersObject && membersObject.hasMore,
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
  const [state, setState] = React.useState(initialState);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) window.location.hash = "";
    else window.location.hash = TYPES_BY_TAB_VALUE[newValue];
  };

  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(TYPES_BY_TAB_VALUE.indexOf(window.location.hash.replace("#", "")));
    }
  });

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function TabContent({ value, index, children }) {
    return <div hidden={value !== index}>{children}</div>;
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
      const res = await loadMoreData(type, state.nextPages[type], state.urlEnding[type]);
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

  const handleApplyNewFilters = async (type, newFilters, closeFilters) => {
    const res = await applyNewFilters(type, newFilters, closeFilters, state.urlEnding[type]);
    if (res.closeFilters) setFiltersExpanded(false);
    if (res.filteredItemsObject) {
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
    <Container maxWidth="lg">
      <FilterSection
        filtersExpanded={filtersExpanded}
        setFiltersExpanded={setFiltersExpanded}
        typesByTabValue={TYPES_BY_TAB_VALUE}
        tabValue={tabValue}
        getProjects={getProjects}
        getOrganizations={getOrganizations}
        getMembers={getMembers}
        token={token}
        state={state}
        setState={setState}
        membersWithAdditionalInfo={membersWithAdditionalInfo}
      />
      <Tabs
        variant={isNarrowScreen ? "fullWidth" : "standard"}
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        centered={true}
      >
        <Tab label={capitalizeFirstLetter(TYPES_BY_TAB_VALUE[0])} className={classes.tab} />
        <Tab label={capitalizeFirstLetter(TYPES_BY_TAB_VALUE[1])} className={classes.tab} />
        <Tab label={capitalizeFirstLetter(TYPES_BY_TAB_VALUE[2])} className={classes.tab} />
      </Tabs>

      <Divider className={classes.mainContentDivider} />

      <TabContent value={tabValue} index={0}>
        {filtersExpanded && tabValue === 0 && (
          <FilterContent
            className={classes.tabContent}
            type={TYPES_BY_TAB_VALUE[0]}
            applyFilters={applyNewFilters}
            filtersExpanded={filtersExpanded}
            unexpandFilters={unexpandFilters}
            possibleFilters={possibleFilters(TYPES_BY_TAB_VALUE[0], filterChoices)}
          />
        )}
        {state && state.items && state.items.projects && state.items.projects.length ? (
          <ProjectPreviews
            projects={state.items.projects}
            loadFunc={loadMoreProjects}
            hasMore={state.hasMore.projects}
            parentHandlesGridItems
            className={classes.itemsContainer}
          />
        ) : (
          <NoItemsFound type="organizations" />
        )}
      </TabContent>
      <TabContent value={tabValue} index={1} className={classes.tabContent}>
        {filtersExpanded && tabValue === 1 && (
          <FilterContent
            className={classes.tabContent}
            type={TYPES_BY_TAB_VALUE[1]}
            applyFilters={handleApplyNewFilters}
            filtersExpanded={filtersExpanded}
            unexpandFilters={unexpandFilters}
            possibleFilters={possibleFilters(TYPES_BY_TAB_VALUE[1], filterChoices)}
          />
        )}
        {state && state.items && state.items.organizations && state.items.organizations.length ? (
          <OrganizationPreviews
            organizations={state.items.organizations}
            loadFunc={loadMoreOrganizations}
            hasMore={state.hasMore.organizations}
            showOrganizationType
            parentHandlesGridItems
          />
        ) : (
          <NoItemsFound type="organizations" />
        )}
      </TabContent>
      <TabContent value={tabValue} index={2} className={classes.tabContent}>
        {filtersExpanded && tabValue === 2 && (
          <FilterContent
            className={classes.tabContent}
            type={TYPES_BY_TAB_VALUE[2]}
            applyFilters={applyNewFilters}
            filtersExpanded={filtersExpanded}
            unexpandFilters={unexpandFilters}
            possibleFilters={possibleFilters(TYPES_BY_TAB_VALUE[2], filterChoices)}
          />
        )}
        {state && state.items && state.items.members && state.items.members.length ? (
          <ProfilePreviews
            profiles={state.items.members}
            loadFunc={loadMoreMembers}
            hasMore={state.hasMore.members}
            showAdditionalInfo
            parentHandlesGridItems
          />
        ) : (
          <NoItemsFound type="members" />
        )}
      </TabContent>
    </Container>
  );
}
