import React, { useState } from "react";
<<<<<<< HEAD

import ProjectPreview from "./ProjectPreview";

import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

import InfiniteScroll from "react-infinite-scroller";
=======

import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";

import ProjectPreview from "./ProjectPreview";
import LoadingSpinner from "../general/LoadingSpinner";
>>>>>>> master

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

// This component is for display projects with the option to infinitely scroll to get more projects
export default function ProjectPreviews({ hasMore, loadFunc, parentHandlesGridItems, projects }) {
  const classes = useStyles();
  const toProjectPreviews = (projects) =>
    projects.map((p) => <GridItem key={p.url_slug} project={p} />);

  const [gridItems, setGridItems] = useState(toProjectPreviews(projects));

  if (!loadFunc) {
    hasMore = false;
  }

  const loadMore = async () => {
    // Sometimes InfiniteScroll calls loadMore twice really fast. Therefore
    // we're aiming to cache to improve performance
    if (hasMore) {
      const newProjects = await loadFunc();
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProjectPreviews(newProjects)]);
      }
    }
  };

  // TODO: use `project.id` instead of index when using real projects
  return (
    <>
      <InfiniteScroll
        className={classes.reset}
        component="ul"
        container
        element={Grid}
        hasMore={hasMore}
        loader={<LoadingSpinner isLoading key="project-previews-spinner" />}
        loadMore={loadMore}
        pageStart={1}
        spacing={2}
      >
        {parentHandlesGridItems
          ? projects && projects.length > 0
            ? toProjectPreviews(projects)
            : "No projects found."
          : gridItems}
      </InfiniteScroll>
    </>
  );
}

function GridItem({ project }) {
  return (
    <Grid key={project.url_slug} item xs={12} sm={6} md={4} lg={3} component="li">
      <ProjectPreview project={project} />
    </Grid>
  );
}
