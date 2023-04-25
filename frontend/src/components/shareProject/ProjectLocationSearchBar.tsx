import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import { Project } from "../../types";
import UserContext from "../context/UserContext";
import LocationSearchBar from "../search/LocationSearchBar";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      [theme.breakpoints.up("sm")]: {
        width: "50%",
        paddingLeft: theme.spacing(2),
      },
    },
  };
});

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
};

export default function ProjectLocationSearchBar({ projectData, handleSetProjectData }: Args) {
  const { locale } = useContext(UserContext);
  const classes = useStyles();
  const texts = getTexts({ page: "project", locale: locale });

  const propsByProjectType = {
    event: {
      label: texts.event_location,
      helperText: texts.event_location_helper_text,
    },
    idea: {
      label: texts.location,
      helperText: "",
    },
    project: {
      label: texts.location,
      helperText: "",
    },
  };
  return (
    <LocationSearchBar
      className={classes.root}
      label={propsByProjectType[projectData.type]?.label}
      helperText={propsByProjectType[projectData.type]?.helperText}
      enableExactLocation
    />
  );
}
