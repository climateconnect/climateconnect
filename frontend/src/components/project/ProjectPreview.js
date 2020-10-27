import React from "react";
import { Typography, Card, CardMedia, CardContent, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ProjectMetaData from "./ProjectMetaData";
import { getImageUrl } from "../../../public/lib/imageOperations";
import Truncate from "react-truncate";

const useStyles = makeStyles(theme => {
  return {
    root: {
      "&:hover": {
        cursor: "pointer"
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: "inherit",
      borderRadius: 0,
      height: 330
    },
    projectNameWrapper: {
      display: "block",
      marginBottom: theme.spacing(0.75)
    },
    projectName: {
      fontWeight: "bold",
      overflow: "hidden",
      lineHeight: 1.5,
      fontSize: 15
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block"
    },
    media: {
      minHeight: 160
    },
    noUnderline: {
      textDecoration: "inherit",
      "&:hover": {
        textDecoration: "inherit"
      }
    },
    draftTriangle: {
      width: 0,
      height: 0,
      borderTop: "100px solid " + theme.palette.primary.main,
      borderRight: "100px solid transparent"
    },
    draftText: {
      transform: "rotate(-45deg)",
      display: "block",
      fontWeight: "bold",
      textTransform: "uppercase",
      marginTop: "-56px",
      marginLeft: "10px",
      fontSize: "20px",
      color: "white"
    },
    cardContent: {
      background: "white",
      height: "100%"
    }
  };
});

export default function ProjectPreview({ project }) {
  const classes = useStyles();

  return (
    <Link
      href={project.is_draft ? `/editProject/${project.url_slug}` : `/projects/${project.url_slug}`}
      className={classes.noUnderline}
    >
      <Card className={classes.root} variant="outlined">
        <CardMedia
          className={classes.media}
          title={project.name}
          image={getImageUrl(project.image)}
        >
          {project.is_draft && (
            <div className={classes.draftTriangle}>
              <div className={classes.draftText}>Draft</div>
            </div>
          )}
        </CardMedia>
        <CardContent className={classes.cardContent}>
          <div className={classes.projectNameWrapper}>
            <Typography component="h2">
              <Truncate lines={2} className={classes.projectName}>
                {project.name}
              </Truncate>
            </Typography>
          </div>
          <ProjectMetaData project={project} />
        </CardContent>
      </Card>
    </Link>
  );
}
