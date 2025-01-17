import React, { useContext } from "react";
import { Project } from "../../types";
import ProjectDateSection from "./ProjectDateSection";
import makeStyles from "@mui/styles/makeStyles";
import ProjectLocationSearchBar from "./ProjectLocationSearchBar";
import { Checkbox, IconButton, Theme, Tooltip, Typography } from "@mui/material";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

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
  ToolTipIcon: any;
};

export default function ProjectTimeAndPlaceSectionAndCustomHub({
  projectData,
  handleSetProjectData,
  locationInputRef,
  locationOptionsOpen,
  setLocationOptionsOpen,
  errors,
  ToolTipIcon,
}: Args) {
  const classes = useStyles();

  const { locale } = useContext(UserContext);
  const texts = getTexts({ locale: locale, page: "project" });

  const label = { inputProps: { "aria-label": "PRIO1 project checkbox" } };
  const prio1Project = projectData.hubName == "prio1";

  function handlePrio1ProjectCheckbox(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.checked) {
      handleSetProjectData({ hubName: "prio1" });
    } else {
      handleSetProjectData({ hubName: "" });
    }
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
        {/* TODO: should I split this into a seperate component */}
        <Typography component="h2" variant="subtitle2">
          <Checkbox {...label} checked={prio1Project} onChange={handlePrio1ProjectCheckbox} />
          {texts.my_project_is_part_of_the_prio1_project}
          <Tooltip title={texts.tooltip_my_project_is_part_of_the_prio1_project}>
            <IconButton size="large">
              <ToolTipIcon />
            </IconButton>
          </Tooltip>
        </Typography>
      </div>
    </div>
  );
}
