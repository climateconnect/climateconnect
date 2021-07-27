import { Card, CardContent, CardMedia, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import Truncate from "react-truncate";

import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ProjectMetaData from "./ProjectMetaData";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      "&:hover": {
        cursor: "pointer",
        "box-shadow": "2px 2px 1px #EEE",
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: theme.palette.background.default,
      borderRadius: 3,
      border: `1px solid #EEE`,
      position: "relative",
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    placeholderImg: {
      visibility: "hidden",
      width: "100%",
    },
    projectNameWrapper: {
      display: "block",
      marginBottom: theme.spacing(0.75),
      padding: theme.spacing(2),
      paddingBottom: 0,
    },
    projectName: {
      fontWeight: "bold",
      overflow: "hidden",
      lineHeight: 1.5,
      fontSize: 15,
      ["&span"]: {
        whiteSpace: "nowrap",
      },
    },
    button: {
      marginTop: theme.spacing(1),
      margin: "0 auto",
      display: "block",
    },
    noUnderline: {
      textDecoration: "inherit",
      "&:hover": {
        textDecoration: "inherit",
      },
    },
    draftTriangle: {
      width: 0,
      height: 0,
      borderTop: "100px solid " + theme.palette.primary.main,
      borderRight: "100px solid transparent",
    },
    draftText: {
      transform: "rotate(-45deg)",
      display: "block",
      fontWeight: "bold",
      textTransform: "uppercase",
      marginTop: "-56px",
      marginLeft: "10px",
      fontSize: "20px",
      color: "white",
    },
    cardContent: {
      background: "white",
      padding: 0,
      height: "auto",
      width: "100%",
      visibility: "hidden",
      ["&:last-child"]: {
        padding: 0,
      },
    },
    cardContentWithDescription: {
      position: "absolute",
      visibility: "visible",
      background: "white",
      bottom: 0,
      minHeight: "100%",
    },
    cardContentWrapper: {
      position: "relative",
      flex: 1,
    },
  };
});

export default function ProjectPreview({ project, projectRef }) {
  const [hovering, setHovering] = React.useState(false);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const classes = useStyles({ hovering: hovering });
  const handleMouseEnter = () => {
    setHovering(true);
  };
  const handleMouseLeave = () => {
    setHovering(false);
  };
  return (
    <Link
      href={
        project.is_draft
          ? `${getLocalePrefix(locale)}/editProject/${project.url_slug}`
          : `${getLocalePrefix(locale)}/projects/${project.url_slug}`
      }
      className={classes.noUnderline}
    >
      <Card
        className={classes.root}
        variant="outlined"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={projectRef}
      >
        <CardMedia
          className={classes.media}
          title={project.name}
          image={getImageUrl(project.image)}
        >
          {project.is_draft ? (
            <div className={classes.draftTriangle}>
              <div className={classes.draftText}>Draft</div>
            </div>
          ) : (
            <img
              src={getImageUrl(project.image)}
              className={classes.placeholderImg}
              alt={texts.project_image_of_project + " " + project.name}
            />
          )}
        </CardMedia>
        <div className={classes.cardContentWrapper}>
          <CardContentWithDescription project={project} hovering={hovering} />
          <CardContentWithoutDescription project={project} hovering={hovering} />
        </div>
      </Card>
    </Link>
  );
}

const CardContentWithoutDescription = ({ project, hovering }) => {
  const classes = useStyles();
  return (
    <CardContent className={classes.cardContent}>
      <div className={classes.projectNameWrapper}>
        <Typography component="h2">
          <Truncate lines={2} className={classes.projectName}>
            {project.name}
          </Truncate>
        </Typography>
      </div>
      <ProjectMetaData project={project} hovering={hovering} />
    </CardContent>
  );
};

const CardContentWithDescription = ({ project, hovering }) => {
  const classes = useStyles({ hovering: hovering });

  return (
    <CardContent className={`${classes.cardContentWithDescription} ${classes.cardContent}`}>
      <div className={classes.projectNameWrapper}>
        <Typography component="h2">
          <Truncate lines={2} className={classes.projectName}>
            {project.name}
          </Truncate>
        </Typography>
      </div>
      <ProjectMetaData project={project} hovering={hovering} withDescription />
    </CardContent>
  );
};
