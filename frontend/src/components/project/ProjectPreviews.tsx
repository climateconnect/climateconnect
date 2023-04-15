import Grid from "@mui/material/Unstable_Grid2";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ProjectPreview from "./ProjectPreview";
import InfiniteScrollGrid from "../general/InfiniteScrollGrid";

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
  displayOnePreviewInRow,
}: any) {
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
        displayOnePreviewInRow={displayOnePreviewInRow}
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
      <InfiniteScrollGrid
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
      </InfiniteScrollGrid>
    </>
  );
}

function GridItem({
  project,
  isFirstProject,
  firstProjectCardRef,
  hubUrl,
  displayOnePreviewInRow,
}) {
  const projectPreviewProps = {
    project: project,
  } as any;
  if (isFirstProject) {
    projectPreviewProps.projectRef = firstProjectCardRef;
  }

  const columnValuesFromBreakpoint = {
    xsValue: 12,
    smValue: displayOnePreviewInRow ? 12 : 6,
    mdValue: displayOnePreviewInRow ? 12 : 4,
    lgValue: displayOnePreviewInRow ? 12 : 3,
  } as const;

  return (
    <Grid
      key={project.url_slug}
      xs={columnValuesFromBreakpoint.xsValue}
      sm={columnValuesFromBreakpoint.smValue}
      md={columnValuesFromBreakpoint.mdValue}
      lg={columnValuesFromBreakpoint.lgValue}
      component="li"
    >
      <ProjectPreview {...projectPreviewProps} hubUrl={hubUrl} />
    </Grid>
  );
}
