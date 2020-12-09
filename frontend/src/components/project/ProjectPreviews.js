import React from "react";

import ProjectPreview from "./ProjectPreview";

import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import InfiniteScroll from "react-infinite-scroller";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
  spinner: {
    marginTop: "48px",
  },
});

// This component is for display projects with the option to infinitely scroll to get more projects
export default function ProjectPreviews({ projects, loadFunc, hasMore, parentHandlesGridItems }) {
  const classes = useStyles();
  const toProjectPreviews = (projects) =>
    projects.map((p) => <GridItem key={p.url_slug} project={p} />);
  const [isLoading, setIsLoading] = React.useState(false);
  const [gridItems, setGridItems] = React.useState(toProjectPreviews(projects));

  if (!loadFunc) hasMore = false;
  const loadMore = async () => {
    //sometimes InfiniteScroll calls loadMore twice really fast. Therefore we're using isLoading to make sure it doesn't catch 2 pages at once
    if (!isLoading) {
      setIsLoading(true);
      const newProjects = await loadFunc();
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProjectPreviews(newProjects)]);
      }
      setIsLoading(false);
    }
  };

  const loadingSpinner = () => {
    return isLoading ? (
      <Grid container justify="center">
        <CircularProgress className={classes.spinner} />
      </Grid>
    ) : null;
  };

  // TODO: use `project.id` instead of index when using real projects
  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      element={Grid}
      container
      component="ul"
      className={`${classes.reset} ${classes.root}`}
      spacing={2}
    >
      {parentHandlesGridItems
        ? projects && projects.length > 0
          ? toProjectPreviews(projects)
          : "No Results"
        : gridItems}
      {loadingSpinner()}
    </InfiniteScroll>
  );
}

function GridItem({ project }) {
  return (
    <Grid key={project.url_slug} item xs={12} sm={6} md={4} lg={3} component="li">
      <ProjectPreview project={project} />
    </Grid>
  );
}
