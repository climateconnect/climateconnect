import React from "react";
import { makeStyles } from "@material-ui/core";
import ProjectPreview from "./ProjectPreview";
//This component is to display a fixed amount of projects without  the option to load more

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    justifyContent: "center"
  },
  container: {
    whiteSpace: "nowrap",
    overflow: "auto",
    display: "flex",
    justifyContent: "space-between",
    minWidth: "100%",
    [theme.breakpoints.up("sm")]: {
      ["&::-webkit-scrollbar"]: {
        display: "block",
        height: 10
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: "#F8F8F8",
        borderRadius: 20
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0,0,0,0.8)",
        borderRadius: 20
      }
    },
    [theme.breakpoints.down("md")]: {
      display: "block",
      minWidth: 0
    }
  },
  project: {
    width: 300,
    display: "inline-block",
    [theme.breakpoints.down("lg")]: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1)
    },
    [theme.breakpoints.down("md")]: {
      width: 268,
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2)
    }
  },
  firstProject: {
    marginLeft: 0
  },
  lastProject: {
    marginRight: 0
  }
}));

export default function ProjectPreviewsFixed({ projects }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {projects.map((project, index) => (
          <span
            className={`${classes.project} ${index === 0 && classes.firstProject} ${index ===
              projects.length - 1 && classes.lastProject}`}
            key={project.url_slug}
          >
            <ProjectPreview project={project} />
          </span>
        ))}
      </div>
    </div>
  );
}
