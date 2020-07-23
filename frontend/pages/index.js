import React, { useEffect } from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import About from "./about";
import { Divider, Button, Tab, Tabs, Typography } from "@material-ui/core";
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

import Cookies from "next-cookies";
import tokenConfig from "../public/config/tokenConfig";
import axios from "axios";
import Link from "next/link";
import { getParams } from "../public/lib/generalOperations";
import CookieBanner from "../src/components/general/CookieBanner";

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
    },
    infoMessage: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    },
    link: {
      display: "inline-block",
      textDecoration: "underline",
      cursor: "pointer"
    }
  };
});

export default function Index({ projectsObject, organizationsObject, membersObject, token }) {
  const [hasMore, setHasMore] = React.useState({
    projects: !!projectsObject && projectsObject.hasMore,
    organizations: !!organizationsObject && organizationsObject.hasMore,
    members: !!membersObject && membersObject.hasMore
  });
  const classes = useStyles();
  //Django starts counting at page 1 and we always catch the first page on load.
  const [nextPages, setNextPages] = React.useState({
    projects: 2,
    members: 2,
    organizations: 2
  });
  const [isLoading, setIsLoading] = React.useState({
    projects: false,
    members: false,
    organizations: false
  });
  const [hash, setHash] = React.useState(null);
  const [message, setMessage] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState("")
  const typesByTabValue = ["projects", "organizations", "members"];
  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(typesByTabValue.indexOf(window.location.hash.replace("#", "")));
    }
    const params = getParams(window.location.href);
    if (params.message) 
      setMessage(decodeURI(params.message));
    if(params.errorMessage)
      setErrorMessage(decodeURI(params.errorMessage))
  });
  const [tabValue, setTabValue] = React.useState(hash ? typesByTabValue.indexOf(hash) : 0);
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [filters, setFilters] = React.useState({
    projects: {},
    members: {},
    organizations: {}
  });
  const searchBarLabels = {
    projects: "Search for climate action projects",
    organizations: "Search for organizations fighting climate change",
    members: "Search for people active against climate change"
  };

  const handleTabChange = (event, newValue) => {
    if (newValue === 0) window.location.hash = "";
    else window.location.hash = typesByTabValue[newValue];
    setTabValue(newValue);
  };

  const onClickExpandFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const unexpandFilters = () => {
    setFiltersExpanded(false);
  };

  const loadMoreProjects = async () => {
    const newProjectsObject = await getProjects(nextPages.projects, token);
    setNextPages({ ...nextPages, projects: nextPages.projects + 1 });
    const newProjects = newProjectsObject.projects;
    setHasMore({ ...hasMore, projects: newProjectsObject.hasMore });
    return [...newProjects];
  };

  const loadMoreOrganizations = async page => {
    const newOrganizationsObject = await getOrganizations(page, token);
    setNextPages({ ...nextPages, organizations: nextPages.organizations + 1 });
    const newOrganizations = newOrganizationsObject ? newOrganizationsObject.organizations : [];
    setHasMore({
      ...hasMore,
      organizations: newOrganizationsObject ? newOrganizationsObject.hasMore : false
    });
    return [...newOrganizations];
  };

  const loadMoreMembers = async page => {
    const newMembersObject = await getMembers(page, token);
    setNextPages({ ...nextPages, members: nextPages.members + 1 });
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
            text: p.location,
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
        <Layout title="Work on the most effective climate projects" message={errorMessage?errorMessage:message} messageType={errorMessage?"error":"success"}>
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
            {projectsObject && projectsObject.projects && projectsObject.projects.length ? (
              <ProjectPreviews
                projects={projectsObject.projects}
                loadFunc={loadMoreProjects}
                hasMore={hasMore.projects}
                isLoading={isLoading.projects}
                setIsLoading={setIsLoading}
              />
            ) : (
              <Typography component="h4" variant="h5" className={classes.infoMessage}>
                We could not connect to the API. If this happens repeatedly, contact support@climateconnect.earth.
              </Typography>
            )}
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
            {organizationsObject &&
            organizationsObject.organizations &&
            organizationsObject.organizations.length ? (
              <OrganizationPreviews
                organizations={organizationsObject.organizations}
                loadFunc={loadMoreOrganizations}
                hasMore={hasMore.organizations}
                showOrganizationType
              />
            ) : (
              <Typography component="h4" variant="h5" className={classes.infoMessage}>
                There are no organizations on this site yet.{" "}
                <Link href="/share">
                  <Typography color="primary" className={classes.link} component="h5" variant="h5">
                    Create an organization to be the first one!
                  </Typography>
                </Link>
              </Typography>
            )}
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
            {membersObject && membersObject.members && membersObject.members.length ? (
              <ProfilePreviews
                profiles={membersWithAdditionalInfo(membersObject.members)}
                loadFunc={loadMoreMembers}
                hasMore={hasMore.members}
                showAdditionalInfo
              />
            ) : (
              <Typography component="h4" variant="h5" className={classes.infoMessage}>
                There are no members on this site yet.{" "}
                <Link href="/share">
                  <Typography color="primary" className={classes.link} component="h5" variant="h5">
                    Create a profile to be the first one!
                  </Typography>
                </Link>
              </Typography>
            )}
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
      process.env.API_URL + "/api/projects/?page=" + page,
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return { projects: parseProjects(resp.data.results), hasMore: !!resp.data.next };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
}

//TODO replace by db call. console.log is just there to pass lint
async function getOrganizations(page, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/?page=" + page,
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return { organizations: parseOrganizations(resp.data.results), hasMore: !!resp.data.next };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
}

//TODO replace by db call. console.log is just there to pass lint
async function getMembers(page, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/members/?page=" + page,
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return { members: parseMembers(resp.data.results), hasMore: !!resp.data.next };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    return null;
  }
}

const parseProjects = projects => {
  return projects.map(project => ({
    ...project,
    location: project.city + ", " + project.country
  }));
};

const parseMembers = members => {
  return members.map(member => ({
    ...member,
    location: members.city ? member.city + ", " + member.country : member.country
  }));
};

const parseOrganizations = organizations => {
  return organizations.map(organization => ({
    ...organization,
    types: organization.types.map(type => type.organization_tag),
    info: {
      location: organization.city
        ? organization.city + ", " + organization.country
        : organization.country
    }
  }));
};
