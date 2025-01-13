import { Card, CardContent, CardMedia, Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import Truncate from "react-truncate";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import BrowseContext from "../context/BrowseContext";
import UserContext from "../context/UserContext";
import ProjectMetaData from "./ProjectMetaData";
import EventDateIndicator from "./EventDateIndicator";

const useStyles = makeStyles((theme) => {
  return {
    wrapper: {
      position: "relative",
      height: "100%",
      paddingTop: theme.spacing(0.25),
    },
    root: {
      "&:hover": {
        cursor: "pointer",
        "box-shadow": "2px 2px 1px #EEE",
      },
      "-webkit-user-select": "none",
      "-moz-user-select": "none",
      "-ms-user-select": "none",
      userSelect: "none",
      backgroundColor: theme.palette.background.paper,
      borderRadius: 3,
      boxShadow: "3px 3px 8px #E0E0E0",
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
      color: "rgba(0, 0, 0, 0.87)",
      ["&span"]: {
        whiteSpace: "nowrap",
      },
      wordBreak: "break-word",
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
      background: theme.palette.background.paper,
      bottom: 0,
      minHeight: "100%",
    },
    cardContentWrapper: {
      position: "relative",
      flex: 1,
    },
  };
});

export default function ProjectPreview({ project, projectRef, hubUrl, className }: any) {
  const [hovering, setHovering] = React.useState(false);
  const { locale } = useContext(UserContext);
  const { projectTypes } = useContext(BrowseContext);
  const projectType =
    projectTypes && projectTypes.length > 0
      ? projectTypes.find((t) => t.type_id === project.project_type)
      : { name: project.project_type, type_id: project.project_type };
  const texts = getTexts({ page: "project", locale: locale });
  const classes = useStyles({ hovering: hovering });
  const handleMouseEnter = () => {
    setHovering(true);
  };
  const handleMouseLeave = () => {
    setHovering(false);
  };
  const queryString = hubUrl ? "?hubPage=" + hubUrl : "";

  return (
    <Link
      href={
        project.is_draft
          ? `${getLocalePrefix(locale)}/editProject/${project.url_slug}`
          : `${getLocalePrefix(locale)}/projects/${project.url_slug}${queryString}`
      }
      className={classes.noUnderline}
      underline="hover"
    >
      <div className={classes.wrapper}>
        {projectType.type_id === "event" && (
          <EventDateIndicator project={project} hubUrl={hubUrl} />
        )}
        <Card
          className={`${classes.root} ${className}`}
          variant="outlined"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={projectRef}
        >
          <CardMedia
            /*TODO(undefined) className={classes.media} */
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
      </div>
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
