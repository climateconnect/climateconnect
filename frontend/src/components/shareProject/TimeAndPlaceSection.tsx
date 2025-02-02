import React, { useContext } from "react";
import { Project } from "../../types";
import ProjectDateSection from "./ProjectDateSection";
import makeStyles from "@mui/styles/makeStyles";
import ProjectLocationSearchBar from "./ProjectLocationSearchBar";
import { Theme } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import CustomHubSelection from "../project/CustomHubSelection";

const useStyles = makeStyles<Theme>((theme) => {
  return {
    root: {
      [theme.breakpoints.up("md")]: {
        display: "flex",
        justifyContent: "space-between",
      },
    },
    verticalFlex: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "left",
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

export default function ProjectTimeAndPlaceSectionAndCustomHub({
  projectData,
  handleSetProjectData,
  locationInputRef,
  locationOptionsOpen,
  setLocationOptionsOpen,
  errors,
}: Args) {
  const classes = useStyles();

  function handleUpdateSelectedHub(hubName: string) {
    handleSetProjectData({ hubName: hubName });
  }

  return (
    <div className={classes.root}>
      <ProjectDateSection
        projectData={projectData}
        handleSetProjectData={handleSetProjectData}
        errors={errors}
      />
      <div className={classes.verticalFlex}>
        <ProjectLocationSearchBar
          projectData={projectData}
          handleSetProjectData={handleSetProjectData}
          locationInputRef={locationInputRef}
          locationOptionsOpen={locationOptionsOpen}
          handleSetLocationOptionsOpen={setLocationOptionsOpen}
        />
        <CustomHubSelection
          currentHubName={projectData.hubName ?? ""}
          handleUpdateSelectedHub={handleUpdateSelectedHub}
        />
      </div>
    </div>
  );
}
