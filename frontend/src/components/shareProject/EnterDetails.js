import React from "react";
import {
  Typography,
  Container,
  Button,
  TextField,
  List,
  Chip,
  Tooltip,
  IconButton
} from "@material-ui/core";
import RadioButtons from "../general/RadioButtons";
import { makeStyles } from "@material-ui/core/styles";
import DatePicker from "../general/DatePicker";
import project_status_metadata from "../../../public/data/project_status_metadata";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import UploadImageDialog from "../dialogs/UploadImageDialog";
import AddSkillsDialog from "../dialogs/AddSkillsDialog";
import Switch from "@material-ui/core/Switch";
import EnterTextDialog from "../dialogs/EnterTextDialog";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

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
    imageZoneWrapper: {
      display: "block",
      width: "100%",
      position: "relative"
    },
    imageZone: props => ({
      cursor: "pointer",
      border: "1px dashed #000",
      width: "100%",
      paddingBottom: "56.25%",
      backgroundImage: `${props.image ? `url(${props.image})` : null}`,
      backgroundSize: "contain"
    }),
    photoIcon: {
      display: "block",
      marginBottom: theme.spacing(1),
      margin: "0 auto",
      cursor: "pointer",
      fontSize: 40
    },
    addPhotoWrapper: {
      position: "absolute",
      left: "calc(50% - 85px)",
      top: "calc(50% - 44px)"
    },
    addPhotoContainer: {
      position: "absolute",
      left: "-50%",
      top: "-50%",
      width: 170
    },
    shortDescriptionWrapper: {
      width: "100%",
      paddingTop: "56.25%",
      position: "relative"
    },
    shortDescription: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: "100%"
    },
    fullHeight: {
      height: "100%"
    },
    backButton: {
      color: theme.palette.primary.main
    },
    nextStepButton: {
      float: "right"
    },
    navigationButtonWrapper: {
      marginTop: theme.spacing(10)
    },
    skill: {
      display: "flex",
      border: "1px solid black",
      height: theme.spacing(5),
      width: 220,
      marginRight: theme.spacing(1),
      background: "none",
      borderRadius: 0,
      fontSize: 16
    },
    flexContainer: {
      display: "flex",
      flexDirection: "row",
      padding: 0,
      marginBottom: theme.spacing(3)
    },
    tooltip: {
      fontSize: 16
    }
  };
});

const helpTexts = {
  addPhoto:
    "Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. Quis aute iure reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint obcaecat cupiditat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  short_description: "Lorem ipsum, my friend",
  description: "Describe your project",
  collaboration: "Here you can collaborate",
  addSkills: "Add skills that collaborators should/could have",
  addConnections:
    "Add connections that would be helpful for collaborators to have. Specifically this could be connections to organizations that could help accelerate your project."
};

export default function EnterDetails({
  projectData,
  setProjectData,
  goToNextStep,
  goToPreviousStep
}) {
  const [project, setProject] = React.useState(projectData);
  const [tempImage, setTempImage] = React.useState(project.image);
  const [open, setOpen] = React.useState({
    avatarDialog: false,
    skillsDialog: false,
    connectionsDialog: false
  });
  const classes = useStyles(project);
  const inputFileRef = React.useRef(null);
  const shortDescriptionRef = React.useRef(null);

  const values = project_status_metadata.map(status => ({
    ...status,
    label: status.createProjectLabel
  }));

  const statusesWithEndDate = ["cancelled", "finished"];

  const onClickPreviousStep = () => {
    setProject({ ...projectData, ...project });
    goToPreviousStep();
  };

  const onClickNextStep = event => {
    event.preventDefault();
    isProjectDataValid(project);
    if (isProjectDataValid(project)) {
      setProjectData({ ...projectData, ...project });
      goToNextStep();
    }
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

  const isProjectDataValid = () => {
    if (!project.image) {
      alert("Please add an image!");
      return false;
    } else return true;
  };

  const onStatusRadioChange = newStatus => {
    setProject({ ...project, status: newStatus });
  };

  const onStartDateChange = newDate => {
    setProject({ ...project, start_date: newDate });
  };

  const onEndDateChange = newDate => {
    setProject({ ...project, end_date: newDate });
  };

  const onDescriptionChange = (event, descriptionType) => {
    if (event.target.value.length <= validation[descriptionType].maxLength)
      setProject({ ...project, [descriptionType]: event.target.value });
  };

  const handleFileInputClick = () => {};

  const handleFileSubmit = () => {};

  const onImageChange = event => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    setTempImage(URL.createObjectURL(file));
    handleDialogClickOpen("avatarDialog");
  };

  const onClickSkillsDialogOpen = () => {
    setOpen({ ...open, skillsDialog: true });
  };

  const onClickConnectionsDialogOpen = () => {
    setOpen({ ...open, connectionsDialog: true });
  };

  const onUploadImageClick = event => {
    event.preventDefault();
    inputFileRef.current.click();
  };

  const onAllowCollaboratorsChange = event => {
    setProject({ ...project, collaborators_welcome: event.target.checked });
  };

  const handleDialogClickOpen = dialogName => {
    setOpen({ ...open, [dialogName]: true });
  };

  const handleAvatarDialogClose = image => {
    setOpen({ ...open, avatarDialog: false });
    if (image && image instanceof HTMLCanvasElement) {
      setProject({ ...project, image: image.toDataURL() });
    }
  };

  const handleSkillsDialogClose = skills => {
    if (skills) setProject({ ...project, skills: skills });
    setOpen({ ...open, ["skillsDialog"]: false });
  };

  const handleSkillDelete = skill => {
    setProject({
      ...project,
      skills: project.skills
        .slice(0, project.skills.indexOf(skill))
        .concat(project.skills.slice(project.skills.indexOf(skill) + 1, project.skills.length))
    });
  };

  const handleConnectionsDialogClose = connection => {
    if (project.connections && project.connections.includes(connection))
      alert("You can not add the same connection twice.");
    else {
      if (connection) setProject({ ...project, connections: [...project.connections, connection] });
      setOpen({ ...open, connectionsDialog: false });
    }
  };

  const handleConnectionDelete = connection => {
    setProject({
      ...project,
      connections: project.connections
        .slice(0, project.connections.indexOf(connection))
        .concat(
          project.connections.slice(
            project.connections.indexOf(connection) + 1,
            project.connections.length
          )
        )
    });
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
              <RadioButtons value={project.status} onChange={onStatusRadioChange} values={values} />
            </div>
          </div>
          <div>
            <Typography component="h2" variant="subtitle2" className={classes.inlineSubHeader}>
              Date
            </Typography>
            <div className={classes.inlineBlock}>
              <DatePicker
                className={classes.datePicker}
                label="Start date"
                date={project.start_date}
                handleChange={onStartDateChange}
                required
              />
              {statusesWithEndDate.includes(project.status) && (
                <>
                  <DatePicker
                    className={classes.datePicker}
                    label="End date"
                    date={project.end_date}
                    handleChange={onEndDateChange}
                    required
                    minDate={project.start_date && new Date(project.start_date)}
                  />
                </>
              )}
            </div>
          </div>
          <div className={classes.block}>
            <div
              className={`${classes.inlineBlock} ${classes.inlineOnBigScreens} ${classes.photoContainer}`}
            >
              <Typography
                component="h2"
                variant="subtitle2"
                color="primary"
                className={classes.subHeader}
              >
                Add photo*
                <Tooltip title={helpTexts.addPhoto} className={classes.tooltip}>
                  <IconButton>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <label htmlFor="photo" className={classes.imageZoneWrapper}>
                <input
                  type="file"
                  name="photo"
                  ref={inputFileRef}
                  id="photo"
                  style={{ display: "none" }}
                  onChange={onImageChange}
                  accept=".png,.jpeg,.jpg"
                  onClick={() => handleFileInputClick()}
                  onSubmit={() => handleFileSubmit(event)}
                />
                <div className={classes.imageZone}>
                  <div className={classes.addPhotoWrapper}>
                    <div className={classes.addPhotoContainer}>
                      <AddAPhotoIcon className={classes.photoIcon} />
                      <Button variant="contained" color="primary" onClick={onUploadImageClick}>
                        {!project.image ? "Upload Image" : "Change image"}
                      </Button>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            <div
              className={`${classes.inlineBlock} ${classes.inlineOnBigScreens} ${classes.summaryContainer}`}
            >
              <Typography
                component="h2"
                variant="subtitle2"
                color="primary"
                className={classes.subHeader}
              >
                Short summary*
                <Tooltip title={helpTexts.short_description} className={classes.tooltip}>
                  <IconButton>
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Typography>
              <div className={classes.shortDescriptionWrapper}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  multiline
                  helperText={
                    "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
                  }
                  ref={shortDescriptionRef}
                  InputLabelProps={{
                    shrink: true
                  }}
                  onChange={event => onDescriptionChange(event, "short_description")}
                  className={classes.shortDescription}
                  InputProps={{
                    classes: { root: classes.fullHeight, inputMultiline: classes.fullHeight }
                  }}
                  placeholder={
                    "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
                  }
                  rows={2}
                  value={project.short_description}
                />
              </div>
            </div>
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
            <TextField
              variant="outlined"
              fullWidth
              multiline
              rows={9}
              onChange={event => onDescriptionChange(event, "description")}
              helperText={"Describe your project in detail. Please only use English!"}
              placeholder={`Describe your project in more detail.\n\n-What are you trying to achieve?\n-How are you trying to achieve it\n-What were the biggest challenges?\n-What insights have you gained during the implementation?`}
              value={project.description}
            />
          </div>
          <div className={classes.block}>
            <Typography
              component="h2"
              variant="subtitle2"
              color="primary"
              className={classes.subHeader}
            >
              Allow collaboration on your project?
              <Tooltip title={helpTexts.collaboration} className={classes.tooltip}>
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <Switch
              checked={project.collaborators_welcome}
              onChange={onAllowCollaboratorsChange}
              name="checkedA"
              inputProps={{ "aria-label": "secondary checkbox" }}
              color="primary"
            />
          </div>
          {project.collaborators_welcome && (
            <>
              <div className={classes.block}>
                <Typography
                  component="h2"
                  variant="subtitle2"
                  color="primary"
                  className={classes.subHeader}
                >
                  Add skills that would be beneficial for collaborators to have
                  <Tooltip title={helpTexts.addSkills} className={classes.tooltip}>
                    <IconButton>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <div>
                  {project.skills && (
                    <List className={classes.flexContainer}>
                      {project.skills.map(skill => (
                        <Chip
                          key={skill.key}
                          label={skill.name}
                          className={classes.skill}
                          onDelete={() => handleSkillDelete(skill)}
                        />
                      ))}
                    </List>
                  )}
                  <Button variant="contained" color="primary" onClick={onClickSkillsDialogOpen}>
                    {project.skills && project.skills.length ? "Edit skills" : "Add Skills"}
                  </Button>
                </div>
              </div>
              <div className={classes.block}>
                <Typography
                  component="h2"
                  variant="subtitle2"
                  color="primary"
                  className={classes.subHeader}
                >
                  Add connections that would be beneficial for collaborators to have
                  <Tooltip title={helpTexts.addConnections} className={classes.tooltip}>
                    <IconButton>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                {project.connections && (
                  <List className={classes.flexContainer}>
                    {project.connections.map(connection => (
                      <Chip
                        key={connection}
                        label={connection}
                        className={classes.skill}
                        onDelete={() => handleConnectionDelete(connection)}
                      />
                    ))}
                  </List>
                )}
                <Button variant="contained" color="primary" onClick={onClickConnectionsDialogOpen}>
                  Add Connections
                </Button>
              </div>
            </>
          )}
          <div className={`${classes.block} ${classes.navigationButtonWrapper}`}>
            <Button
              variant="contained"
              className={classes.backButton}
              onClick={onClickPreviousStep}
            >
              Back
            </Button>
            <Button
              variant="contained"
              className={classes.nextStepButton}
              color="primary"
              type="submit"
            >
              Next Step
            </Button>
          </div>
        </form>
      </Container>
      <UploadImageDialog
        onClose={handleAvatarDialogClose}
        open={open.avatarDialog}
        imageUrl={tempImage}
        borderRadius={0}
        height={300}
        ratio={16 / 9}
      />
      <AddSkillsDialog
        open={open.skillsDialog}
        onClose={handleSkillsDialogClose}
        skills={project.skills}
      />
      <EnterTextDialog
        open={open.connectionsDialog}
        onClose={handleConnectionsDialogClose}
        maxLength={25}
        applyText="Add"
        inputLabel="Connection"
        title="Add a helpful connection"
      />
    </>
  );
}
