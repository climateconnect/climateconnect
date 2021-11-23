import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ProjectPreview from "./ProjectPreview";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none",
    width: "100%",
  },
});

// This component is for display projects with the option to infinitely scroll to get more projects
export default function ProjectPreviews({
  hasMore,
  loadFunc,
  parentHandlesGridItems,
  projects,
  firstProjectCardRef,
  hubUrl,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const toProjectPreviews = (projects) =>
    projects.map((p) => (
      <GridItem
        key={p.url_slug}
        project={p}
        isFirstProject={projects.indexOf(p) === 0}
        firstProjectCardRef={firstProjectCardRef}
        hubUrl={hubUrl}
      />
    ));

  const [gridItems, setGridItems] = useState(toProjectPreviews(projects));
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);

  if (!loadFunc) {
    hasMore = false;
  }

  const loadMore = async () => {
    // Sometimes InfiniteScroll calls loadMore twice really fast. Therefore
    // to improve performance, we aim to guard against subsequent
    // fetches to the API by maintaining a local state flag.
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      const newProjects = await loadFunc();
      if (!parentHandlesGridItems) {
        setGridItems([...gridItems, ...toProjectPreviews(newProjects)]);
      }
      setIsFetchingMore(false);
    }
  };

  // TODO: use `project.id` instead of index when using real projects
  return (
    <>
      <InfiniteScroll
        className={classes.reset}
        component="ul"
        container
        // TODO: fix this: InfiniteScroll is throwing a React error:
        // Failed prop type: Invalid prop `element` supplied to `InfiniteScroll`, expected a ReactNode.
        element={Grid}
        // We block subsequent invocations from InfinteScroll until we update local state
        hasMore={hasMore && !isFetchingMore}
        loadMore={loadMore}
        pageStart={1}
        spacing={2}
      >
        {parentHandlesGridItems
          ? projects && projects.length > 0
            ? toProjectPreviews(projects)
            : texts.no_projects_found
          : gridItems}
        {isFetchingMore && <LoadingSpinner isLoading key="project-previews-spinner" />}
      </InfiniteScroll>
    </>
  );
}

function GridItem({ project, isFirstProject, firstProjectCardRef, hubUrl }) {
  const projectPreviewProps = {
    project: project,
  };
  if (isFirstProject) {
    projectPreviewProps.projectRef = firstProjectCardRef;
  }
  return (
    <Grid key={project.url_slug} item xs={12} sm={6} md={4} lg={3} component="li">
      <ProjectPreview {...projectPreviewProps} hubUrl={hubUrl} />
    </Grid>
  );
}
