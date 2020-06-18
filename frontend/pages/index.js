import React from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import About from "./about";
import { Divider, Button, Tab, Tabs } from "@material-ui/core";
import TuneIcon from "@material-ui/icons/Tune";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { makeStyles } from "@material-ui/core/styles";
import FilterSearchBar from "../src/components/filter/FilterSearchBar";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import FilterContent from "../src/components/filter/FilterContent";
import possibleFilters from "./../public/data/possibleFilters";
import OrganizationPreviews from "../src/components/organization/OrganizationPreviews";
import ProfilePreviews from "../src/components/profile/ProfilePreviews";
import LocationOnIcon from "@material-ui/icons/LocationOn";

import fakeProjectData from "../public/data/projects.json";
import fakeOrganizationData from "../public/data/organizations.json";
import fakeProfileData from "../public/data/profiles.json";

import Cookies from "next-cookies";
import tokenConfig from "../public/config/tokenConfig";
import axios from "axios";

const useStyles = makeStyles(theme => {
  return {
    filterButton: {
      borderColor: "#707070",
      height: 40
    },
    filterSectionFirstLine: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: theme.spacing(2)
    },
    searchBarContainer: {
      flexGrow: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    filterSearchbar: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      width: "100%",
      maxWidth: 650,
      margin: "0 auto"
    },
    filterSectionTabsWithContent: {
      marginBottom: theme.spacing(3)
    },
    tab: {
      textTransform: "none",
      width: 130
    },
    tabContent: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  };
});

export default function Index({ projectsObject, organizationsObject, membersObject, token }) {
  const [hasMore, setHasMore] = React.useState({
    projects: true,
    organizations: true,
    members: true
  });
  const classes = useStyles();
  //Django starts counting at page 1 and we always catch the first page on load.
  const [nextPages, setNextPages] = React.useState({
    projects: 2,
    members: 2,
    organizations: 2
  });
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = React.useState(0);
  const typesByTabValue = ["projects", "organizations", "members"];
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [filters, setFilters] = React.useState({
    projects: {},
    members: {},
    organizations: {}
  });
  const searchBarLabels = {
    projects: "Search for the most effective climate projects",
    organizations: "Search for organizations fighting climate change",
    members: "Search for people active against climate change"
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const onClickExpandFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const unexpandFilters = () => {
    setFiltersExpanded(false);
  };

  const loadMoreProjects = async page => {
    const newProjectsObject = await getProjects(nextPages.projects, token);
    setNextPages({ ...nextPages, projects: nextPages.projects + 1 });
    const newProjects = newProjectsObject.projects;
    setHasMore({ ...hasMore, projects: newProjectsObject.hasMore });
    return [...newProjects];
  };

  const loadMoreOrganizations = async page => {
    const newOrganizationsObject = await getOrganizations(page);
    const newOrganizations = newOrganizationsObject.organizations;
    setHasMore({ ...hasMore, organizations: newOrganizationsObject.hasMore });
    return [...newOrganizations];
  };

  const loadMoreMembers = async page => {
    const newMembersObject = await getMembers(page);
    const newMembers = membersWithAdditionalInfo(newMembersObject.members);
    setHasMore({ ...hasMore, members: newMembersObject.hasMore });
    return [...newMembers];
  };

  const membersWithAdditionalInfo = members => {
    return members.map(p => {
      return {
        ...p,
        additionalInfo: [
          {
            text: p.info.location,
            icon: LocationOnIcon,
            iconName: "LocationOnIcon",
            importance: "high"
          }
        ]
      };
    });
  };

  const applyNewFilters = (type, newFilters, closeFilters) => {
    setFilters({ ...filters, [type]: newFilters });
    if (closeFilters) setFiltersExpanded(false);
  };

  return (
    <>
      {process.env.PRE_LAUNCH === "true" ? (
        <About />
      ) : (
        <Layout title="Work on the most effective climate projects">
          <div className={classes.filterSection}>
            <div className={classes.filterSectionFirstLine}>
              <Button
                variant="outlined"
                className={classes.filterButton}
                onClick={onClickExpandFilters}
                startIcon={
                  filtersExpanded ? (
                    <HighlightOffIcon color="primary" />
                  ) : (
                    <TuneIcon color="primary" />
                  )
                }
              >
                Filter
              </Button>
              <div className={classes.searchBarContainer}>
                <FilterSearchBar
                  label={searchBarLabels[typesByTabValue[tabValue]]}
                  className={classes.filterSearchbar}
                />
              </div>
            </div>
          </div>
          <Divider className={classes.mainDivider} />
          <Tabs
            variant={isNarrowScreen ? "fullWidth" : "standard"}
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={capitalizeFirstLetter(typesByTabValue[0])} className={classes.tab} />
            <Tab label={capitalizeFirstLetter(typesByTabValue[1])} className={classes.tab} />
            <Tab label={capitalizeFirstLetter(typesByTabValue[2])} className={classes.tab} />
          </Tabs>
          <Divider />
          <TabContent value={tabValue} index={0}>
            {filtersExpanded && tabValue === 0 && (
              <FilterContent
                className={classes.tabContent}
                type={typesByTabValue[0]}
                applyFilters={applyNewFilters}
                filtersExpanded={filtersExpanded}
                unexpandFilters={unexpandFilters}
                possibleFilters={possibleFilters[typesByTabValue[0]]}
              />
            )}
            <ProjectPreviews
              projects={projectsObject.projects}
              loadFunc={loadMoreProjects}
              hasMore={hasMore.projects}
            />
          </TabContent>
          <TabContent value={tabValue} index={1} className={classes.tabContent}>
            {filtersExpanded && tabValue === 1 && (
              <FilterContent
                className={classes.tabContent}
                type={typesByTabValue[1]}
                applyFilters={applyNewFilters}
                filtersExpanded={filtersExpanded}
                unexpandFilters={unexpandFilters}
                possibleFilters={possibleFilters[typesByTabValue[1]]}
              />
            )}
            <OrganizationPreviews
              organizations={organizationsObject.organizations}
              loadFunc={loadMoreOrganizations}
              hasMore={hasMore.organizations}
              showOrganizationType
            />
          </TabContent>
          <TabContent value={tabValue} index={2} className={classes.tabContent}>
            {filtersExpanded && tabValue === 2 && (
              <FilterContent
                className={classes.tabContent}
                type={typesByTabValue[2]}
                applyFilters={applyNewFilters}
                filtersExpanded={filtersExpanded}
                unexpandFilters={unexpandFilters}
                possibleFilters={possibleFilters[typesByTabValue[2]]}
              />
            )}
            <ProfilePreviews
              profiles={membersWithAdditionalInfo(membersObject.members)}
              loadFunc={loadMoreMembers}
              hasMore={hasMore.members}
              showAdditionalInfo
            />
          </TabContent>
        </Layout>
      )}
    </>
  );
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}

Index.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    projectsObject: await getProjects(1, token),
    organizationsObject: await getOrganizations(1, token),
    membersObject: await getMembers(1, token),
    token: token
  };
};

async function getProjects(page, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/projects/?page=" + page,
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      console.log(resp.data);
      return { projects: parseProjects(resp.data.results), hasMore: !!resp.data.next };
    }
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data);
    else console.log(err);
    return null;
  }
}

//TODO replace by db call. console.log is just there to pass lint
async function getOrganizations(page) {
  console.log(page);
  const organizations = fakeOrganizationData.organizations;
  return { organizations: [...organizations, ...organizations], hasMore: true };
}

//TODO replace by db call. console.log is just there to pass lint
async function getMembers(page) {
  console.log(page);
  const profiles = fakeProfileData.profiles;
  return { members: [...profiles, ...profiles], hasMore: true };
}

const parseProjects = projects => {
  return projects.map(project => ({
    ...project,
    location: project.city + ", " + project.country
  }));
};
