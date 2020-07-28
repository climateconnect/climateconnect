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
import { 
  getSkillsOptions, 
  getStatusOptions, 
  getProjectTagsOptions, 
  getOrganizationTagsOptions 
} from "../public/lib/getOptions"

import Cookies from "next-cookies";
import tokenConfig from "../public/config/tokenConfig";
import axios from "axios";
import Link from "next/link";
import { getParams } from "../public/lib/generalOperations";

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

export default function Index({ 
  projectsObject, 
  organizationsObject, 
  membersObject, 
  token, 
  filterChoices 
}) {
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
  const [items, setItems] = React.useState({
    projects: projectsObject?[...projectsObject.projects]:[],
    organizations: organizationsObject?[...organizationsObject.organizations]:[],
    members: membersObject?membersWithAdditionalInfo(membersObject.members):[]
  })
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
  const [hash, setHash] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [urlEnding, setUrlEnding] = React.useState({projects: "", organizations: "", members: ""});
  const typesByTabValue = ["projects", "organizations", "members"];
  useEffect(() => {
    if (window.location.hash) {
      setHash(window.location.hash.replace("#", ""));
      setTabValue(typesByTabValue.indexOf(window.location.hash.replace("#", "")));
    }
    const params = getParams(window.location.href);
    if (params.message) setMessage(decodeURI(params.message));
    if (params.errorMessage) setErrorMessage(decodeURI(params.errorMessage));
  });
  const [tabValue, setTabValue] = React.useState(hash ? typesByTabValue.indexOf(hash) : 0);
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [filters, setFilters] = React.useState({
    projects: {},
    members: {},
    organizations: {}
  });
  const [searchFilters, setSearchFilters] = React.useState({
    projects: {},
    members: {},
    organizations: {}
  })
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

  const handleAddProjects = newProjects => {
    console.log(newProjects)
    console.log("adding new projects")
    setItems({...items, projects: [...items.projects, ...newProjects]})
  }

  const handleAddOrganizations = newOrganizations => {
    console.log(newOrganizations)
    console.log("adding new organizations")
    setItems({...items, organizations: [...items.organizations, ...newOrganizations]})
  }

  const handleAddMembers = newProfiles => {
    console.log(newProfiles)
    console.log("adding new profiles")
    setItems({...items, members: [...items.members, ...newProfiles]})
  }

  const loadMoreProjects = async () => {
    try{
      const newProjectsObject = await getProjects(nextPages.projects, token, urlEnding.projects);
      setNextPages({ ...nextPages, projects: nextPages.projects + 1 });
      const newProjects = newProjectsObject.projects;
      setHasMore({ ...hasMore, projects: newProjectsObject.hasMore });
      return [...newProjects];
    }catch(e){
      console.log(e)
      setHasMore({...hasMore, projects: false})
      return []
    }    
  };

  const loadMoreOrganizations = async () => {
    try{
      const newOrganizationsObject = await getOrganizations(nextPages.organizations, token, urlEnding.organizations);
      setNextPages({ ...nextPages, organizations: nextPages.organizations + 1 });
      const newOrganizations = newOrganizationsObject ? newOrganizationsObject.organizations : [];
      setHasMore({
        ...hasMore,
        organizations: newOrganizationsObject.hasMore
      });
      return [...newOrganizations];
    }catch(e){
      console.log(e)
      setHasMore({...hasMore, organizations: false})
      return []
    }
  };

  const loadMoreMembers = async () => {
    try{
    const newMembersObject = await getMembers(nextPages.members, token, urlEnding.members);
    setNextPages({ ...nextPages, members: nextPages.members + 1 });
    const newMembers = membersWithAdditionalInfo(newMembersObject.members);
    setHasMore({ ...hasMore, members: newMembersObject.hasMore });
    return [...newMembers];
    }catch(e){
      console.log(e)
      setHasMore({...hasMore, members: false})
      return [];
    }
  }; 

  const applyNewFilters = async(type, newFilters, closeFilters) => {
    if(filters !== newFilters){
      setFilters({ ...filters, [type]: newFilters });
      const newUrlEnding = buildUrlEndingFromFilters(newFilters)
      if(urlEnding[type] != newUrlEnding){        
        if (closeFilters) setFiltersExpanded(false);
        try{
          let filteredItemsObject;
          if(type === "projects")
            filteredItemsObject = await getProjects(1, token, newUrlEnding)
          else if(type === "organizations")
            filteredItemsObject = await getOrganizations(1, token, newUrlEnding)
          else if(type === "members"){
            console.log("type is members!")
            filteredItemsObject = await getMembers(1, token, newUrlEnding)
            console.log(filteredItemsObject)
            filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members)
          }else
            console.log("cannot find type!")
          setItems({...items, [type]: filteredItemsObject[type]})  
          setHasMore({...hasMore, [type]: filteredItemsObject.hasMore})
          setNextPages({...nextPages, [type]: 2})                
          setUrlEnding({...urlEnding, [type]: newUrlEnding})
        }catch(e){
          console.log(e)
        }
      }
    }
  };
  return (
    <>
      {process.env.PRE_LAUNCH === "true" ? (
        <About />
      ) : (
        <Layout
          title="Work on the most effective climate projects"
          message={errorMessage ? errorMessage : message}
          messageType={errorMessage ? "error" : "success"}
        >
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
                possibleFilters={possibleFilters(typesByTabValue[0], filterChoices)}
              />
            )}
            {projectsObject && projectsObject.projects && projectsObject.projects.length ? (
              <ProjectPreviews
                projects={items.projects}
                loadFunc={loadMoreProjects}
                hasMore={hasMore.projects}
                handleAddProjects={handleAddProjects}
                parentHandlesGridItems
              />
            ) : (
              <Typography component="h4" variant="h5" className={classes.infoMessage}>
                We could not connect to the API. If this happens repeatedly, contact
                support@climateconnect.earth.
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
                possibleFilters={possibleFilters(typesByTabValue[1], filterChoices)}
              />
            )}
            {organizationsObject &&
            organizationsObject.organizations &&
            organizationsObject.organizations.length ? (
              <OrganizationPreviews
                organizations={items.organizations}
                loadFunc={loadMoreOrganizations}
                hasMore={hasMore.organizations}
                showOrganizationType
                handleAddOrganizations={handleAddOrganizations}
                parentHandlesGridItems
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
                possibleFilters={possibleFilters(typesByTabValue[2], filterChoices)}
              />
            )}
            {membersObject && membersObject.members && membersObject.members.length ? (
              <ProfilePreviews
                profiles={items.members}
                loadFunc={loadMoreMembers}
                hasMore={hasMore.members}
                showAdditionalInfo
                handleAddProfiles={handleAddMembers}
                parentHandlesGridItems
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

const buildUrlEndingFromFilters = filters => {
  console.log(filters)
  let url = "&"
  Object.keys(filters).map(filterKey=>{
    if(filters[filterKey] && filters[filterKey].length>0){
      if(Array.isArray(filters[filterKey]))
        url += encodeURI(filterKey+"="+filters[filterKey].join())+"&"
      else
        url += encodeURI(filterKey+"="+filters[filterKey]+"&")
    }
  })
  return url
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function TabContent({ value, index, children }) {
  return <div hidden={value !== index}>{children}</div>;
}

Index.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const filterChoices = {
    project_categories: await getProjectTagsOptions(),
    organization_types: await getOrganizationTagsOptions(),
    skills: await getSkillsOptions(),
    project_statuses: await getStatusOptions()
  }
  return {
    projectsObject: await getProjects(1, token),
    organizationsObject: await getOrganizations(1, token),
    membersObject: await getMembers(1, token),
    token: token,
    filterChoices: filterChoices
  };
};

async function getProjects(page, token, urlEnding) {
  let url = process.env.API_URL + "/api/projects/?page=" + page
  if(urlEnding)
    url += urlEnding
  try {
    const resp = await axios.get(
      url,
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
    throw err;
  }
}

//TODO replace by db call. console.log is just there to pass lint
async function getOrganizations(page, token, urlEnding) {
  let url = process.env.API_URL + "/api/organizations/?page=" + page
  if(urlEnding)
    url += urlEnding
  try {
    const resp = await axios.get(
      url,
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
async function getMembers(page, token, urlEnding) {
  try {
    console.log("getting members for page "+page)
    let url = process.env.API_URL + "/api/members/?page=" + page
    if(urlEnding)
      url += urlEnding
    const resp = await axios.get(
      url,
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return { members: parseMembers(resp.data.results), hasMore: !!resp.data.next };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error getting members page "+page+": ");
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
