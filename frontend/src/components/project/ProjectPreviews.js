import React from "react";
import ProjectPreview from "./ProjectPreview";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  reset: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  }
});

export default function ProjectPreviews({ projects }) {
  const classes = useStyles();

  // TODO: use `project.id` instead of index when using real projects
  return (
    <Grid container component="ul" className={`${classes.reset} ${classes.root}`} spacing={2}>
      {projects.map((project, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} component="li" key={index}>
          <ProjectPreview project={project} />
        </Grid>
      ))}
    </Grid>
  );
}
