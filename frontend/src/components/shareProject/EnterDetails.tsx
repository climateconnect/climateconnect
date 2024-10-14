import { Container, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Switch from "@mui/material/Switch";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import React, { useContext, useEffect, useRef, useState } from "react";
import getCollaborationTexts from "../../../public/data/collaborationTexts";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import NavigationButtons from "../general/NavigationButtons";
import ProjectTimeAndPlaceSection from "./TimeAndPlaceSection";
import ProjectDescriptionHelp from "../project/ProjectDescriptionHelp";
import AddPhotoSection from "./AddPhotoSection";
import AddSummarySection from "./AddSummarySection";
import CollaborateSection from "./CollaborateSection";
import ProjectNameSection from "./ProjectNameSection";
import { checkProjectDatesValid } from "../../../public/lib/dateOperations";
import { indicateWrongLocation, isLocationValid } from "../../../public/lib/locationOperations";

const useStyles = makeStyles((theme) => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8),
    },
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto",
    },
    subHeader: {
      marginBottom: theme.spacing(2),
      fontSize: 20,
    },
    inlineSubHeader: {
      display: "inline-block",
      marginRight: theme.spacing(4),
    },
    inlineBlock: {
      display: "inline-block",
    },
    block: {
      marginBottom: theme.spacing(4),
    },
    datePicker: {
      marginTop: 0,
      marginLeft: theme.spacing(4),
    },
    photoContainer: {
      paddingRight: theme.spacing(2),
    },
    summaryContainer: {
      paddingLeft: theme.spacing(2),
    },
    inlineOnBigScreens: {
      width: "50%",
      marginTop: theme.spacing(4),
      verticalAlign: "top",
      [theme.breakpoints.down("md")]: {
        width: "100%",
        padding: 0,
      },
    },
    tooltip: {
      fontSize: 16,
    },
  };
});

const getHelpTexts = (texts) => ({
  addPhoto: texts.add_photo_helptext,
  short_description: texts.short_description_helptext,
  description: texts.description_helptext,
  collaboration: texts.collaboration_helptext,
  addSkills: texts.add_skills_helptext,
  addConnections: texts.add_connections_helptext,
});

export default function EnterDetails({
  projectData,
  handleSetProjectData,
  goToNextStep,
  goToPreviousStep,
  skillsOptions,
  setMessage,
}) {
  const [open, setOpen] = useState({
    avatarDialog: false,
    skillsDialog: false,
    connectionsDialog: false,
  });
  const [errors, setErrors] = useState({
    start_date: "",
    end_date: "",
  });
  const locationInputRef = useRef(null);
  const [locationOptionsOpen, setLocationOptionsOpen] = React.useState(false);
  const classes = useStyles(projectData);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: projectData });
  const collaborationTexts = getCollaborationTexts(texts);
  const helpTexts = getHelpTexts(texts);
  const topRef = useRef<null | HTMLFormElement>(null);

  //scroll to top if there is an error
  useEffect(() => {
    if (topRef?.current) {
      topRef.current.scrollIntoView();
    }
  }, [errors]);

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const onClickNextStep = (event) => {
    event.preventDefault();
    if (isProjectDataValid(projectData)) {
      handleSetProjectData({ ...projectData });
      goToNextStep();
    }
  };

  const handleSetOpen = (newOpenObject) => {
    setOpen({ ...open, ...newOpenObject });
  };

  const validation = {
    short_description: {
      name: texts.short_summary,
      maxLength: 280,
    },
    description: {
      name: texts.description,
      maxLength: 4000,
    },
  };

  const onDescriptionChange = (event, descriptionType) => {
    handleSetProjectData({
      [descriptionType]: event.target.value.substring(0, validation[descriptionType].maxLength),
    });
  };

  const onWebsiteChange = (event) => {
    handleSetProjectData({
      website: event.target.value,
    });
  };

  const isProjectDataValid = (project) => {
    if (!project.image) {
      alert(texts.please_add_an_image);
      return false;
    }
    const projectDatesValid = checkProjectDatesValid(project, texts);
    if (projectDatesValid.error) {
      setErrors({
        ...errors,
        [projectDatesValid.error.key]: projectDatesValid.error.value,
      });
      return false;
    }
    if (!isLocationValid(project.loc)) {
      indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setMessage, texts);
      return false;
    }
    return true;
  };

  const onAllowCollaboratorsChange = (event) => {
    handleSetProjectData({ collaborators_welcome: event.target.checked });
  };

  return (
    <>
      <Container maxWidth="lg">
        <form ref={topRef} onSubmit={onClickNextStep}>
          <ProjectNameSection
            projectData={projectData}
            handleSetProjectData={handleSetProjectData}
          />
          <ProjectTimeAndPlaceSection
            projectData={projectData}
            handleSetProjectData={handleSetProjectData}
            locationInputRef={locationInputRef}
            locationOptionsOpen={locationOptionsOpen}
            setLocationOptionsOpen={setLocationOptionsOpen}
            errors={errors}
          />
          <div className={classes.block}>
            <AddPhotoSection
              projectData={projectData}
              handleSetProjectData={handleSetProjectData}
              className={`${classes.inlineBlock} ${classes.inlineOnBigScreens} ${classes.photoContainer}`}
              subHeaderClassname={classes.subHeader}
              toolTipClassName={classes.tooltip}
              helpTexts={helpTexts}
              ToolTipIcon={HelpOutlineIcon}
              open={open}
              handleSetOpen={handleSetOpen}
            />
            <AddSummarySection
              projectData={projectData}
              onDescriptionChange={onDescriptionChange}
              className={`${classes.inlineBlock} ${classes.inlineOnBigScreens} ${classes.summaryContainer}`}
              subHeaderClassname={classes.subHeader}
              toolTipClassName={classes.tooltip}
              helpTexts={helpTexts}
              ToolTipIcon={HelpOutlineIcon}
            />
          </div>
          <div className={classes.block}>
            <Typography
              component="h2"
              variant="subtitle2"
              color="primary"
              className={classes.subHeader}
            >
              {texts.project_description}
              <Tooltip title={helpTexts.description} className={classes.tooltip}>
                <IconButton size="large">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <ProjectDescriptionHelp project_type={projectData.project_type} />
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={9}
              onChange={(event) => onDescriptionChange(event, "description")}
              placeholder={texts.describe_your_project_in_more_detail}
              value={projectData.description}
            />
          </div>
          <div className={classes.block}>
            <Typography
              component="h2"
              variant="subtitle2"
              color="primary"
              className={classes.subHeader}
            >
              {texts.project_website}
            </Typography>
            <TextField
              variant="outlined"
              onChange={(event) => onWebsiteChange(event)}
              placeholder={texts.project_website}
              value={projectData.website}
              helperText={texts.if_your_project_has_a_website_you_can_enter_it_here}
            />
          </div>
          <div className={classes.block}>
            <Typography
              component="h2"
              variant="subtitle2"
              color="primary"
              className={classes.subHeader}
            >
              {collaborationTexts.allow[projectData.project_type.type_id]}
              <Tooltip title={helpTexts.collaboration} className={classes.tooltip}>
                <IconButton size="large">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <Switch
              checked={projectData.collaborators_welcome}
              onChange={onAllowCollaboratorsChange}
              name="checkedA"
              inputProps={{ "aria-label": "secondary checkbox" }}
              color="primary"
            />
          </div>
          {projectData.collaborators_welcome && (
            <CollaborateSection
              projectData={projectData}
              handleSetProjectData={handleSetProjectData}
              blockClassName={classes.block}
              subHeaderClassName={classes.subHeader}
              toolTipClassName={classes.tooltip}
              helpTexts={helpTexts}
              ToolTipIcon={HelpOutlineIcon}
              open={open}
              handleSetOpen={handleSetOpen}
              skillsOptions={skillsOptions}
              collaborationTexts={collaborationTexts}
            />
          )}
          <NavigationButtons
            className={classes.block}
            onClickPreviousStep={onClickPreviousStep}
            nextStepButtonType="submit"
            position="bottom"
          />
        </form>
      </Container>
    </>
  );
}
