import React from "react";
import { Typography, Container, TextField, Tooltip, IconButton } from "@material-ui/core";
import RadioButtons from "../general/RadioButtons";
import { makeStyles } from "@material-ui/core/styles";
import DatePicker from "../general/DatePicker";
import Switch from "@material-ui/core/Switch";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CollaborateSection from "./CollaborateSection";
import AddSummarySection from "./AddSummarySection";
import AddPhotoSection from "./AddPhotoSection";
import BottomNavigation from "../general/BottomNavigation";
import ProjectDescriptionHelp from "../project/ProjectDescriptionHelp";
import collaborationTexts from "../../../public/data/collaborationTexts";

const useStyles = makeStyles(theme => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(8),
      marginBottom: theme.spacing(8)
    },
    stepsTracker: {
      maxWidth: 600,
      margin: "0 auto"
    },
    subHeader: {
      marginBottom: theme.spacing(4),
      fontSize: 20
    },
    inlineSubHeader: {
      display: "inline-block",
      marginRight: theme.spacing(4)
    },
    inlineBlock: {
      display: "inline-block"
    },
    block: {
      marginBottom: theme.spacing(4)
    },
    datePicker: {
      marginTop: 0,
      marginLeft: theme.spacing(4)
    },
    photoContainer: {
      paddingRight: theme.spacing(2)
    },
    summaryContainer: {
      paddingLeft: theme.spacing(2)
    },
    inlineOnBigScreens: {
      width: "50%",
      marginTop: theme.spacing(4),
      verticalAlign: "top",
      [theme.breakpoints.down("sm")]: {
        width: "100%",
        padding: 0
      }
    },
    tooltip: {
      fontSize: 16
    }
  };
});

const helpTexts = {
  addPhoto:
    "Upload a photo that represents your project. This way other climate protectors can see at a glance what your project is about. It is recommended to use a non-transparent image in 16:9 format",
  short_description:
    "Summarize your project in less than 240 characters. Other climate protectors should be able to grasp what your project wants to achieve.",
  description:
    "Describe your project in more detail. What are you exactly doing? What are you doing? What is the climate impact of your project?",
  collaboration:
    "Select if you are would be open to accept help and work with other climate protectors on your project.",
  addSkills:
    "If you are looking for someone with specific skills to help you with your project, select these here.",
  addConnections:
    "Add connections that would be helpful for collaborators to have. Specifically this could be connections to organizations that could help accelerate your project."
};

export default function EnterDetails({
  projectData,
  handleSetProjectData,
  goToNextStep,
  goToPreviousStep,
  skillsOptions,
  statusOptions
}) {
  const [open, setOpen] = React.useState({
    avatarDialog: false,
    skillsDialog: false,
    connectionsDialog: false
  });
  const classes = useStyles(projectData);

  const statusValues = statusOptions.map(s => {
    return {
      ...s,
      label: s.name,
      key: s.name
    };
  });

  const statusesWithStartDate = statusOptions.filter(s => s.has_start_date).map(s => s.id);
  const statusesWithEndDate = statusOptions.filter(s => s.has_end_date).map(s => s.id);

  const onClickPreviousStep = () => {
    goToPreviousStep();
  };

  const onClickNextStep = event => {
    event.preventDefault();
    if (isProjectDataValid(projectData)) {
      handleSetProjectData({ ...projectData });
      goToNextStep();
    }
  };

  const handleSetOpen = newOpenObject => {
    setOpen({ ...open, ...newOpenObject });
  };

  const validation = {
    short_description: {
      name: "Short summary",
      maxLength: 240
    },
    description: {
      name: "Description",
      maxLength: 4000
    }
  };

  const onDescriptionChange = (event, descriptionType) => {
    handleSetProjectData({
      [descriptionType]: event.target.value.substring(0, validation[descriptionType].maxLength)
    });
  };

  const onWebsiteChange = event => {
    handleSetProjectData({
      website: event.target.value
    });
  };

  const isProjectDataValid = project => {
    if (!project.image) {
      alert("Please add an image!");
      return false;
    } else return true;
  };

  const onStatusRadioChange = newStatus => {
    handleSetProjectData({ status: statusOptions.find(s => s.name === newStatus) });
  };

  const onStartDateChange = newDate => {
    handleSetProjectData({ start_date: newDate });
  };

  const onEndDateChange = newDate => {
    handleSetProjectData({ end_date: newDate });
  };

  const onAllowCollaboratorsChange = event => {
    handleSetProjectData({ collaborators_welcome: event.target.checked });
  };

  return (
    <>
      <Container maxWidth="lg">
        <form onSubmit={onClickNextStep}>
          <Typography
            component="h2"
            variant="subtitle2"
            color="primary"
            className={classes.subHeader}
          >
            General Information*
          </Typography>
          <div className={classes.block}>
            <Typography component="h2" variant="subtitle2" className={classes.inlineSubHeader}>
              Your project is
            </Typography>
            <div className={classes.inlineBlock}>
              <RadioButtons
                value={projectData.status.name}
                onChange={onStatusRadioChange}
                values={statusValues}
              />
            </div>
          </div>
          <div>
            <Typography component="h2" variant="subtitle2" className={classes.inlineSubHeader}>
              Date
            </Typography>
            <div className={classes.inlineBlock}>
              {statusesWithStartDate.includes(projectData.status.id) && (
                <DatePicker
                  className={classes.datePicker}
                  label="Start date"
                  date={projectData.start_date}
                  handleChange={onStartDateChange}
                  required
                />
              )}
              {statusesWithEndDate.includes(projectData.status.id) && (
                <DatePicker
                  className={classes.datePicker}
                  label="End date"
                  date={projectData.end_date}
                  handleChange={onEndDateChange}
                  required
                  minDate={projectData.start_date && new Date(projectData.start_date)}
                />
              )}
            </div>
          </div>
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
              Project description
              <Tooltip title={helpTexts.description} className={classes.tooltip}>
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <ProjectDescriptionHelp status={projectData.status} />
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={9}
              onChange={event => onDescriptionChange(event, "description")}
              helperText={"Describe your project in detail. Please only use English!"}
              placeholder={`Describe your project in more detail.\n\n-What are you trying to achieve?\n-How are you trying to achieve it\n-What were the biggest challenges?\n-What insights have you gained during the implementation?`}
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
              Project website
            </Typography>
            <TextField
              variant="outlined"
              onChange={event => onWebsiteChange(event)}
              placeholder={`Project website`}
              value={projectData.website}
              helperText={"If your project has a website, you can enter it here."}
            />
          </div>
          <div className={classes.block}>
            <Typography
              component="h2"
              variant="subtitle2"
              color="primary"
              className={classes.subHeader}
            >
              {collaborationTexts.allow[projectData.status.name]}
              <Tooltip title={helpTexts.collaboration} className={classes.tooltip}>
                <IconButton>
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
              subHeaderClassname={classes.subHeader}
              toolTipClassName={classes.tooltip}
              helpTexts={helpTexts}
              ToolTipIcon={HelpOutlineIcon}
              open={open}
              handleSetOpen={handleSetOpen}
              skillsOptions={skillsOptions}
              collaborationTexts={collaborationTexts}
            />
          )}
          <BottomNavigation
            className={classes.block}
            onClickPreviousStep={onClickPreviousStep}
            nextStepButtonType="submit"
          />
        </form>
      </Container>
    </>
  );
}
