import React, { useEffect, useState } from "react";
import { Container, Tabs, Tab, Divider, useMediaQuery, makeStyles } from "@material-ui/core";
import FilterSection from "../indexPage/FilterSection";
import FilterContent from "../filter/FilterContent";
import ProjectPreviews from "../project/ProjectPreviews";
import ProfilePreviews from "../profile/ProfilePreviews";
import OrganizationPreviews from "../organization/OrganizationPreviews";
import possibleFilters from "../../../public/data/possibleFilters";
import NoItemsFound from "./NoItemsFound";
import { membersWithAdditionalInfo } from "../../../public/lib/getOptions";

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
  const classes = useStyles();
  const TYPES_BY_TAB_VALUE = hideMembers
    ? ["projects", "organizations"]
    : ["projects", "organizations", "members"];
  const [hash, setHash] = useState(null);
  const [tabValue, setTabValue] = useState(hash ? TYPES_BY_TAB_VALUE.indexOf(hash) : 0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [state, setState] = useState(initialState);
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
    if (res?.closeFilters) setFiltersExpanded(false);
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

  const handleSearchSubmit = async (type, searchValue) => {
    const res = await applySearch(type, searchValue, state.urlEnding[type]);
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

      <TabContent value={tabValue} index={0}>
        {filtersExpanded && tabValue === 0 && (
          <FilterContent
            className={classes.tabContent}
            type={TYPES_BY_TAB_VALUE[0]}
            applyFilters={handleApplyNewFilters}
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
      {!hideMembers && (
        <TabContent value={tabValue} index={2} className={classes.tabContent}>
          {filtersExpanded && tabValue === 2 && (
            <FilterContent
              className={classes.tabContent}
              type={TYPES_BY_TAB_VALUE[2]}
              applyFilters={handleApplyNewFilters}
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
      )}
    </Container>
  );
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}
