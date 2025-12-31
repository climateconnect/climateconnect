import React, { useContext } from "react";
import { Grid } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import ProjectPreview from "./ProjectPreview";
import { useInfiniteScroll } from "../../components/hooks/useInfiniteScroll";

export default function ProjectPreviews({
  projects,
  loadFunc,
  hasMore,
  hubUrl,
  isLoading = false,
}: any) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  const { lastElementRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadFunc,
  });

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <>
      <Grid container spacing={2}>
        {projects.map((project, index) => {
          const isLastElement = index === projects.length - 1;
          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={project.url_slug}
              ref={isLastElement ? lastElementRef : null}
            >
              <ProjectPreview project={project} hubUrl={hubUrl} />
            </Grid>
          );
        })}
      </Grid>
      {isLoading && <LoadingSpinner isLoading />}
    </>
  );
}
