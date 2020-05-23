import React from "react";
import Layout from "../src/components/layouts/layout";
import ProjectPreviews from "./../src/components/project/ProjectPreviews";
import fakeProjectData from "../public/data/projects.json";
import About from "./about";
import { Divider, Button, Tab, Tabs } from "@material-ui/core";
import TuneIcon from "@material-ui/icons/Tune";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import { makeStyles } from "@material-ui/core/styles";
import FilterSearchBar from "../src/components/filter/FilterSearchBar";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import FilterContent from "../src/components/filter/FilterContent";
import possibleFilters from "./../public/data/possibleFilters";

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
    mainDivider: {
      marginBottom: theme.spacing(2)
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

export default function Index({ projectsObject }) {
  const [hasMore, setHasMore] = React.useState(true);
  const [filtersExpanded, setFiltersExpanded] = React.useState(true);
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = React.useState(0);
  const typesByTabValue = ["projects", "organizations", "members"];
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

  const loadMoreProjects = async page => {
    const newProjectsObject = await getProjects(page);
    const newProjects = newProjectsObject.projects;
    setHasMore(newProjectsObject.hasMore);
    return [...newProjects];
  };

  const applyNewFilters = (type, newFilters) => {
    setFilters({ ...filters, [type]: newFilters });
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
              {filtersExpanded && (
                <div className={classes.searchBarContainer}>
                  <FilterSearchBar
                    label={searchBarLabels[typesByTabValue[tabValue]]}
                    className={classes.filterSearchbar}
                  />
                </div>
              )}
            </div>
            {filtersExpanded && (
              <div className={classes.filterSectionTabsWithContent}>
                <div className={classes.tabsWrapper}>
                  <Divider />
                  <Tabs
                    variant={isNarrowScreen ? "fullWidth" : "standard"}
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab
                      label={capitalizeFirstLetter(typesByTabValue[0])}
                      className={classes.tab}
                    />
                    <Tab
                      label={capitalizeFirstLetter(typesByTabValue[1])}
                      className={classes.tab}
                    />
                    <Tab
                      label={capitalizeFirstLetter(typesByTabValue[2])}
                      className={classes.tab}
                    />
                  </Tabs>
                  <div className={classes.tabContentContainer}>
                    <TabContent value={tabValue} index={0}>
                      <FilterContent
                        type={typesByTabValue[0]}
                        className={classes.tabContent}
                        applyFilters={applyNewFilters}
                        possibleFilters={possibleFilters[typesByTabValue[0]]}
                      />
                    </TabContent>
                    <TabContent value={tabValue} index={1} className={classes.tabContent}>
                      <FilterContent
                        className={classes.tabContent}
                        type={typesByTabValue[1]}
                        applyFilters={applyNewFilters}
                        possibleFilters={possibleFilters[typesByTabValue[1]]}
                      />
                    </TabContent>
                    <TabContent value={tabValue} index={2} className={classes.tabContent}>
                      <FilterContent
                        className={classes.tabContent}
                        type={typesByTabValue[2]}
                        applyFilters={applyNewFilters}
                        possibleFilters={possibleFilters[typesByTabValue[2]]}
                      />
                    </TabContent>
                  </div>
                  <Divider />
                </div>
              </div>
            )}
          </div>
          <Divider className={classes.mainDivider} />
          <ProjectPreviews
            projects={projectsObject.projects}
            loadFunc={loadMoreProjects}
            hasMore={hasMore}
          />
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

Index.getInitialProps = async () => {
  return {
    projectsObject: await getProjects(0)
  };
};

//TODO replace by db call. console.log is just there to pass lint
async function getProjects(page) {
  console.log(page);
  const projects = fakeProjectData.projects.slice(0, 8);
  return { projects: [...projects, ...projects], hasMore: true };
}
