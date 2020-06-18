import React from "react";
import ProjectPreview from "./ProjectPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";
import throttle from "lodash";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%"
  },
  loader: {
    clear: "both"
  }
});

export default function ProjectPreviews({ projects, loadFunc, hasMore, isLoading }) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(
    projects.map((p, index) => <GridItem key={p.url_slug} project={p} />)
  );
  if (!loadFunc) hasMore = false;

  const loadMore = async page => {
    const newProjects = await loadFunc(page);
    const newGridItems = newProjects.map((p, index) => (
      <GridItem key={(index + 1) * page} project={p} />
    ));
    setGridItems([...gridItems, ...newGridItems]);
  };
  // TODO: use `project.id` instead of index when using real projects
  return (
    <InfiniteScroll
      pageStart={1}
      loadMore={loadMore}
      hasMore={hasMore && !isLoading}
      loader={
        <div className={classes.loader} key={1000}>
          Loading ...
        </div>
      }
      element={Grid}
      container
      component="ul"
      className={`${classes.reset} ${classes.root}`}
      spacing={2}
    >
      {gridItems}
    </InfiniteScroll>
  );
}

function GridItem({ project }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} component="li">
      <ProjectPreview project={project} />
    </Grid>
  );
}
