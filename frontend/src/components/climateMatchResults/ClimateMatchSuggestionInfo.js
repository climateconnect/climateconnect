import { makeStyles, Typography } from "@material-ui/core";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ModeCommentIcon from "@material-ui/icons/ModeComment";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LocationDisplay from "../project/LocationDisplay";
import ProjectCategoriesDisplay from "../project/ProjectCategoriesDisplay";
import IconNumberDisplay from "./IconNumberDisplay";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 650,
  },
  projectTitle: {
    fontSize: 17,
    fontWeight: 700,
  },
  shortDescription: {
    marginTop: theme.spacing(1),
  },
  lowerBar: {
    display: "flex",
    justifyContent: "space-between",
  },
  lowerBarLeftSide: {
    display: "flex",
  },
  lowerBarRightSide: {
    display: "flex",
  },
  projectInfoOverview: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  iconNumberDisplay: {
    marginRight: theme.spacing(2),
  },
  locationText: {
    fontSize: 15,
  },
  locationIcon: {
    fontSize: 19,
  },
  locationDisplay: {
    marginRight: theme.spacing(2),
    cursor: "default",
  },
  projectCategories: {
    cursor: "default",
  },
}));

export default function ClimateMatchSuggestionInfo({ suggestion, className }) {
  const classes = useStyles();
  return (
    <div className={`${classes.root} ${className}`}>
      {suggestion.ressource_type === "project" && <ProjectInfoOverview project={suggestion} />}
    </div>
  );
}

const ProjectInfoOverview = ({ project }) => {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });

  return (
    <div className={classes.projectInfoOverview}>
      <div>
        <Typography component="h2" color="secondary" className={classes.projectTitle}>
          {project.name}
        </Typography>
        <Typography className={classes.shortDescription}>{project.short_description}</Typography>
      </div>
      <div className={classes.lowerBar}>
        <div className={classes.lowerBarLeftSide}>
          <LocationDisplay
            location={project.location}
            color="primary"
            textClassName={classes.locationText}
            iconClassName={classes.locationIcon}
            className={classes.locationDisplay}
          />
          <ProjectCategoriesDisplay
            className={classes.projectCategories}
            main_project_tag={project.tags[0]?.project_tag?.name}
            color="primary"
          />
        </div>
        <div className={classes.lowerBarRightSide}>
          <IconNumberDisplay
            icon={{ icon: ModeCommentIcon }}
            number={project.number_of_comments}
            name={texts.number_of_comments}
            className={classes.iconNumberDisplay}
          />
          <IconNumberDisplay
            icon={{ icon: FavoriteIcon }}
            number={project.number_of_likes}
            name={texts.number_of_likes}
            className={classes.iconNumberDisplay}
          />
        </div>
      </div>
    </div>
  );
};
