import React from "react";
import Truncate from "react-truncate";
import { Typography, Card, CardMedia, CardContent, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ProjectMetaData from "./ProjectMetaData";
import { getImageUrl } from "../../../public/lib/imageOperations";

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
      borderRadius: 0
    },
    bold: {
      fontWeight: "bold"
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
        <CardContent>
          <Typography variant="subtitle1" component="h2" className={classes.bold}>
            <Truncate lines={1} ellipsis="...">
              {project.name}
            </Truncate>
          </Typography>
          <ProjectMetaData project={project} />
        </CardContent>
      </Card>
    </Link>
  );
}
