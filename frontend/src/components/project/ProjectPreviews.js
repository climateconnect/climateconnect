import React from "react";
import ProjectPreview from "./ProjectPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroller";

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

export default function ProjectPreviews({ projects, loadFunc, hasMore, isLoading, setIsLoading }) {
  const classes = useStyles();
  const [gridItems, setGridItems] = React.useState(
    projects.map(p => <GridItem key={p.url_slug} project={p} />)
  );
  if (!loadFunc) hasMore = false;

  const loadMore = async () => {
    //sometimes InfiniteScroll calls loadMore twice really fast. Therefore we're using isLoading to make sure it doesn't catch 2 pages at once
    if (!isLoading.projects) {
      setIsLoading({ ...isLoading, projects: true });
      const newProjects = await loadFunc();
      const newGridItems = newProjects.map(p => <GridItem key={p.url_slug} project={p} />);
      setGridItems([...gridItems, ...newGridItems]);
      setIsLoading({ ...isLoading, projects: false });
    }
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
