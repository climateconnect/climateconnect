import React, { useEffect } from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import About from "./about";
import { Divider, Button, Tab, Tabs, Typography, IconButton } from "@material-ui/core";
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
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import TextLoop from "react-text-loop";
import {
  getSkillsOptions,
  getStatusOptions,
  getProjectTagsOptions,
  getOrganizationTagsOptions
} from "../public/lib/getOptions";

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
      width: 160,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
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
    },
    mainHeading: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      flexWrap: "wrap"
    },
    mainHeadingContainer: {
      margin: `${theme.spacing(4)}px 0`
    },
    infoText: {
      maxWidth: 1000,
      margin: "0 auto",
      fontSize: 14
    },
    titleText: {
      display: "inline-block"
    },
    titleTextRight: {
      display: "inline-block",
      marginLeft: theme.spacing(0.75),
      alignItems: "center"
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
  const initialState = {
    items: {
      projects: projectsObject?[...projectsObject.projects]:[],
      organizations: organizationsObject?[...organizationsObject.organizations]:[],
      members: membersObject?membersWithAdditionalInfo(membersObject.members):[]
    },
    hasMore: {
      projects: !!projectsObject && projectsObject.hasMore,
      organizations: !!organizationsObject && organizationsObject.hasMore,
      members: !!membersObject && membersObject.hasMore
    },
    nextPages: {
      projects: 2,
      members: 2,
      organizations: 2
    },
    urlEnding: {
      projects: "",
      organizations: "",
      members: ""
    }
  }
  const [state, setState] = React.useState(initialState)
  
  const classes = useStyles();
  //Django starts counting at page 1 and we always catch the first page on load.  
  const [hash, setHash] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
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
  const [infoTextExpanded, setInfoTextExpanded] = React.useState(false)
  const [filters, setFilters] = React.useState({
    projects: {},
    members: {},
    organizations: {}
  });
  const [searchFilters, setSearchFilters] = React.useState({
    projects: "",
    members: "",
    organizations: ""
  })
  const onSearchValueChange = (type, newValue) => {
    setSearchFilters({...searchFilters, [type]: newValue})
  }

  const onSearchSubmit = async type => {
    const newUrlEnding = buildUrlEndingFromSearch(searchFilters[type])
    if(state.urlEnding[type] != newUrlEnding){        
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
        }else{
          console.log("cannot find type!")            
        }
        setState({
          ...state,
          items: {...state.items, [type]: filteredItemsObject[type]},
          hasMore: {...state.hasMore, [type]: filteredItemsObject.hasMore},
          urlEnding: {...state.urlEnding, [type]: newUrlEnding},
          nextPages: {...state.nextPages, [type]: 2}
        })
      }catch(e){
        console.log(e)
      }
    }
  }

  const applyNewFilters = async(type, newFilters, closeFilters) => {
    console.log("applying new filters!")
    if(filters !== newFilters){
      setFilters({ ...filters, [type]: newFilters });
      const newUrlEnding = buildUrlEndingFromFilters(newFilters)
      if(state.urlEnding[type] != newUrlEnding){        
        if (closeFilters) setFiltersExpanded(false);
        try{
          let filteredItemsObject;
          if(type === "projects")
            filteredItemsObject = await getProjects(1, token, newUrlEnding)
          else if(type === "organizations")
            filteredItemsObject = await getOrganizations(1, token, newUrlEnding)
          else if(type === "members"){
            filteredItemsObject = await getMembers(1, token, newUrlEnding)
            filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members)
          }else
            console.log("cannot find type!")
          setState({
            ...state,
            items: {...state.items, [type]: filteredItemsObject[type]},
            hasMore: {...state.hasMore, [type]: filteredItemsObject.hasMore},
            urlEnding: {...state.urlEnding, [type]: newUrlEnding},
            nextPages: {...state.nextPages, [type]: 2}
          })
        }catch(e){
          console.log(e)
        }
      }
    }
  };

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
    try{
      const newProjectsObject = await getProjects(state.nextPages.projects, token, state.urlEnding.projects);
      const newProjects = newProjectsObject.projects;
      setState({
        ...state,
        nextPages: { 
          ...state.nextPages, 
          projects: state.nextPages.projects + 1 
        },
        hasMore: { 
          ...state.hasMore, 
          projects: newProjectsObject.hasMore 
        },
        items: {
          ...state.items, 
          projects: [...state.items.projects, ...newProjects]
        }
      })
      
      return [...newProjects];
    }catch(e){
      console.log("error")
      console.log(e)
      setState({
        ...state,
        hasMore: {...state.hasMore, projects: false}
      })
      return []
    }    
  };

  const loadMoreOrganizations = async () => {
    try{
      const newOrganizationsObject = await getOrganizations(state.nextPages.organizations, token, state.urlEnding.organizations);
      const newOrganizations = newOrganizationsObject ? newOrganizationsObject.organizations : [];
      setState({
        ...state,
        nextPages: { ...state.nextPages, organizations: state.nextPages.organizations + 1 },
        hasMore: {
          ...state.hasMore,
          organizations: newOrganizationsObject.hasMore
        },
        items: {...state.items, organizations: [...state.items.organizations, ...newOrganizations]}
      })
      return [...newOrganizations];
    }catch(e){
      console.log(e)
      setState({
        ...state,
        nextPages: { ...state.nextPages, organizations: state.nextPages.organizations + 1 },
        hasMore: {
          ...state.hasMore,
          organizations: false
        }
      })
      return []
    }
  };

  const loadMoreMembers = async () => {
    try{
    const newMembersObject = await getMembers(state.nextPages.members, token, state.urlEnding.members);
    const newMembers = membersWithAdditionalInfo(newMembersObject.members);
    setState({
      ...state,
      nextPages: { ...state.nextPages, members: state.nextPages.members + 1 },
      hasMore: {
        ...state.hasMore,
        members: newMembersObject.hasMore
      },
      items: {...state.items, members: [...state.items.members, ...newMembers]}
    })
    return [...newMembers];
    }catch(e){
      console.log(e)
      setState({
        ...state,
        hasMore: {
          ...state.hasMore,
          members: false
        }
      })
      return [];
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
          <div className={classes.mainHeadingContainer}>          
            <div className={classes.mainHeading}>
              <TextLoop mask={true} interval={5000}>
                <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
                  Share
                </Typography>
                <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
                  Find
                </Typography>
                <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
                  Work on
                </Typography>
                <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
                  Get inspired by
                </Typography>
                <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
                  Replicate
                </Typography>
                <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
                  Collaborate with
                </Typography>
              </TextLoop>
              <Typography component="h1" variant="h5" className={classes.titleTextRight}>
                the most effective climate projects 
              </Typography>
              <IconButton><InfoOutlinedIcon color="primary" onClick={() => setInfoTextExpanded(!infoTextExpanded)} className={classes.infoIcon}/></IconButton>          
            </div>  
            {infoTextExpanded && 
              <Typography className={classes.infoText}>
                Climate Connect is a <b>global climate action platform</b>. We believe that we can only solve climate change if we all work together. This is why we created Climate Connect and wrote a really long placeholder text to try to illustrate how our website would look like if we allowed <b>people to show an info text</b>. This would also help with SEO I think, but I'm actually not sure about that, we'll just have to see.
                {" "}<Typography component="span" className={classes.infoText} color="primary"><b>Hide Info</b></Typography>
              </Typography>
            }        
          </div>    
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
                  type={typesByTabValue[tabValue]}
                  label={searchBarLabels[typesByTabValue[tabValue]]}
                  className={classes.filterSearchbar}
                  onSubmit={onSearchSubmit}
                  onChange={onSearchValueChange}
                  value={searchFilters[typesByTabValue[tabValue]]}
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
                projects={state.items.projects}
                loadFunc={loadMoreProjects}
                hasMore={state.hasMore.projects}
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
                organizations={state.items.organizations}
                loadFunc={loadMoreOrganizations}
                hasMore={state.hasMore.organizations}
                showOrganizationType
                parentHandlesGridItems
              />
            ) : (
              <Typography component="h4" variant="h5" className={classes.infoMessage}>
                There are no organizations on this site yet.{" "}
                <Link href="/createorganization">
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
                profiles={state.items.members}
                loadFunc={loadMoreMembers}
                hasMore={state.hasMore.members}
                showAdditionalInfo
                parentHandlesGridItems
              />
            ) : (
              <Typography component="h4" variant="h5" className={classes.infoMessage}>
                There are no members on this site yet.{" "}
                <Link href="/signup">
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

const buildUrlEndingFromSearch = searchValue => {
  return "&search="+searchValue
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
    console.log("getting members for page "+page+" with urlEnding "+urlEnding)
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
