import React from "react";
import { Typography, Container, Button, TextField } from "@material-ui/core";
import WideLayout from "../src/components/layouts/WideLayout";
import RadioButtons from "../src/components/general/RadioButtons";
import { makeStyles } from "@material-ui/core/styles";
import StepsTracker from "../src/components/general/StepsTracker";
import DatePicker from "../src/components/general/DatePicker";
import project_status_metadata from "../public/data/project_status_metadata";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import UploadImageDialog from "../src/components/dialogs/UploadImageDialog";
import Switch from "@material-ui/core/Switch";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import theme from "../src/themes/theme";

const DEFAULT_STATUS = "inprogress";
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
      marginBottom: theme.spacing(4)
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
    }
  };
});

export default function EnterDetails({ projectData }) {
  const [project, setProject] = React.useState(projectData ? projectData : defaultProject);
  const [tempImage, setTempImage] = React.useState(project.image);
  const [open, setOpen] = React.useState({ avatarDialog: false });
  const classes = useStyles(project);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const steps = [
    {
      key: "share",
      text: "share project"
    },
    {
      key: "category",
      text: "project category"
    },
    {
      key: "details",
      text: "project details"
    },
    {
      key: "team",
      text: "Team"
    }
  ];

  const values = project_status_metadata.map(status => ({
    ...status,
    label: status.createProjectLabel
  }));

  const statusesWithEndDate = ["cancelled", "finished"];

  const inputFile = React.useRef(null);

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
    setProject({ ...project, [descriptionType]: event.target.value });
  };

  const handleFileInputClick = () => {};

  const handleFileSubmit = () => {};

  const onImageChange = event => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    console.log(URL.createObjectURL(file));
    setTempImage(URL.createObjectURL(file));
    handleDialogClickOpen("avatarDialog");
  };

  const onUploadImageClick = event => {
    event.preventDefault();
    inputFile.current.click();
  };

  const onAllowCollaboratorsChange = event => {
    setProject({ ...project, collaborators_welcome: event.target.checked });
  };

  const handleDialogClickOpen = dialogName => {
    setOpen({ ...open, [dialogName]: true });
  };

  const handleAvatarDialogClose = image => {
    setOpen({ ...open, avatarDialog: false });
    console.log(image);
    if (image) console.log(image.toDataURL());
    if (image && image instanceof HTMLCanvasElement) {
      setProject({ ...project, image: image.toDataURL() });
    }
  };

  //TODO: remove default values
  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[2].key}
        onlyDisplayActiveStep={isSmallScreen}
      />
      <Typography variant="h4" color="primary" className={classes.headline}>
        {project.name}
      </Typography>
      <Container maxWidth="lg">
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
              defaultValue={DEFAULT_STATUS}
              onChange={onStatusRadioChange}
              values={values}
            />
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
            />
            {statusesWithEndDate.includes(project.status) && (
              <DatePicker
                className={classes.datePicker}
                label="End date"
                date={project.end_date}
                handleChange={onEndDateChange}
              />
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
            </Typography>
            <label htmlFor="photo" className={classes.imageZoneWrapper}>
              <input
                type="file"
                name="photo"
                ref={inputFile}
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
            </Typography>
            <div className={classes.shortDescriptionWrapper}>
              <TextField
                variant="outlined"
                fullWidth
                multiline
                onChange={event => onDescriptionChange(event, "short_description")}
                className={classes.shortDescription}
                InputProps={{
                  classes: { root: classes.fullHeight, inputMultiline: classes.fullHeight }
                }}
                placeholder={
                  "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
                }
                helperText={
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
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={9}
            onChange={event => onDescriptionChange(event, "description")}
            helperText="Describe your project in detail. Please only use English!"
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
              </Typography>
              <Button variant="contained" color="primary">
                Add Skill
              </Button>
            </div>
            <div className={classes.block}>
              <Typography
                component="h2"
                variant="subtitle2"
                color="primary"
                className={classes.subHeader}
              >
                Add connections that would be beneficial for collaborators to have
              </Typography>
              <Button variant="contained" color="primary">
                Add Connection
              </Button>
            </div>
          </>
        )}
        <div className={`${classes.block} ${classes.navigationButtonWrapper}`}>
          <Button variant="contained" className={classes.backButton}>
            Back
          </Button>
          <Button variant="contained" className={classes.nextStepButton} color="primary">
            Next Step
          </Button>
        </div>
      </Container>
      <UploadImageDialog
        onClose={handleAvatarDialogClose}
        open={open.avatarDialog}
        imageUrl={tempImage}
        borderRadius={0}
        height={300}
        ratio={16 / 9}
      />
    </WideLayout>
  );
}

const defaultProject = {
  name: "CO2-Labels for University Canteen",
  status: DEFAULT_STATUS,
  collaborators_welcome: true
};
