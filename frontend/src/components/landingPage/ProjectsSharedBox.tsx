import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FixedPreviewCards from "./FixedPreviewCards";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    maxWidth: 1280,
    margin: "0 auto",
  },
  headline: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: 21,
      marginBottom: theme.spacing(2),
    },
  },
  explainerText: {
    maxWidth: 750,
    marginBottom: theme.spacing(3),
  },
  showProjectsButtonContainer: {
    marginTop: theme.spacing(3),
    color: theme.palette.primary.main,
  },
  showProjectsArrow: {
    marginLeft: theme.spacing(2),
  },
  showProjectsText: {
    textDecoration: "underline",
  },
}));

export default function ProjectsSharedBox({ projects, className, isLoading }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <div className={`${className} ${classes.root}`}>
      <Typography color="primary" component="h1" className={classes.headline}>
        {texts.climate_action_projects_shared_by_climate_connect_users}
      </Typography>
      <Typography color="secondary" className={classes.explainerText}>
        {texts.climate_action_projects_shared_by_climate_connect_users_text}
      </Typography>
      <FixedPreviewCards isLoading={isLoading} elements={projects} type="project" />
      <div className={classes.showProjectsButtonContainer}>
        <Button color="inherit" href={getLocalePrefix(locale) + "/browse"}>
          <span className={classes.showProjectsText}>{texts.show_all_projects}</span>
          <KeyboardArrowRightIcon className={classes.showProjectsArrow} />
        </Button>
      </div>
    </div>
  );
}
