import React from "react";
import { Project } from "../../types";
import ProjectDateSection from "./ProjectDateSection";
import makeStyles from "@mui/styles/makeStyles";
import ProjectLocationSearchBar from "./ProjectLocationSearchBar";
import { Theme } from "@mui/material";

const useStyles = makeStyles<Theme>((theme) => {
  return {
    root: {
      [theme.breakpoints.up("md")]: {
        display: "flex",
        justifyContent: "space-between",
      },
    },
    locationSearchBar: {
      flexGrow: 1,
    },
  };
});

type Args = {
  projectData: Project;
  handleSetProjectData: Function;
  locationInputRef: any;
  locationOptionsOpen: boolean;
  setLocationOptionsOpen: Function;
  errors: any;
};

export default function ProjectTimeAndPlaceSection({
  projectData,
  handleSetProjectData,
  locationInputRef,
  locationOptionsOpen,
  setLocationOptionsOpen,
  errors,
}: Args) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ProjectDateSection
        projectData={projectData}
        handleSetProjectData={handleSetProjectData}
        errors={errors}
      />
      <ProjectLocationSearchBar
        projectData={projectData}
        handleSetProjectData={handleSetProjectData}
        locationInputRef={locationInputRef}
        locationOptionsOpen={locationOptionsOpen}
        handleSetLocationOptionsOpen={setLocationOptionsOpen}
        className={classes.locationSearchBar}
      />
    </div>
  );
}
