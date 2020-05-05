import React from "react";
import { Typography, Container, Button } from "@material-ui/core";
import WideLayout from "../src/components/layouts/WideLayout";
import RadioButtons from "../src/components/general/RadioButtons";
import { makeStyles } from "@material-ui/core/styles";
import StepsTracker from "../src/components/general/StepsTracker";
import DatePicker from "../src/components/general/DatePicker";
import project_status_metadata from "../public/data/project_status_metadata";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import UploadImageDialog from "../src/components/dialogs/UploadImageDialog";
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
    halfScreen: {
      width: "50%",
      minWidth: 300,
      marginTop: theme.spacing(4),
      verticalAlign: "top"
    },
    halfScreenLeft: {
      paddingRight: theme.spacing(4)
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
      backgroundImage: `url(${props.background_image})`,
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
    }
  };
});

export default function EnterDetails({ projectData }) {
  const [project, setProject] = React.useState(projectData ? projectData : defaultProject);
  const [tempImage, setTempImage] = React.useState(project.image);
  const [open, setOpen] = React.useState(false);
  const classes = useStyles(project);

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

  const handleFileInputClick = () => {};

  const handleFileSubmit = () => {};

  const onImageChange = event => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    setTempImage(URL.createObjectURL(file));
    handleDialogClickOpen("backgroundDialog");
  };

  const onUploadImageClick = event => {
    event.preventDefault();
    inputFile.current.click();
  };

  const handleDialogClickOpen = () => {
    setOpen(true);
  };

  const handleUploadImageClose = () => {};

  //TODO: remove default values
  return (
    <WideLayout title="Share a project" hideHeadline={true}>
      <StepsTracker
        grayBackground={true}
        className={classes.stepsTracker}
        steps={steps}
        activeStep={steps[2].key}
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
            {!statusesWithEndDate.includes(project.status) && (
              <DatePicker
                className={classes.datePicker}
                label="End date"
                date={project.end_date}
                handleChange={onEndDateChange}
              />
            )}
          </div>
        </div>
        <div className={`${classes.block} ${classes.flexContainer}`}>
          <div className={`${classes.inlineBlock} ${classes.halfScreen} ${classes.halfScreenLeft}`}>
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
                value={project.image}
                onClick={() => handleFileInputClick()}
                onSubmit={() => handleFileSubmit(event)}
              />
              <div className={classes.imageZone}>
                <div className={classes.addPhotoWrapper}>
                  <div className={classes.addPhotoContainer}>
                    <AddAPhotoIcon className={classes.photoIcon} />
                    <Button variant="contained" color="primary" onClick={onUploadImageClick}>
                      Upload Image
                    </Button>
                  </div>
                </div>
              </div>
            </label>
          </div>
          <div className={`${classes.inlineBlock} ${classes.halfScreen}`}>
            <Typography
              component="h2"
              variant="subtitle2"
              color="primary"
              className={classes.subHeader}
            >
              Short description*
            </Typography>
          </div>
        </div>
      </Container>
      <UploadImageDialog
        onClose={handleUploadImageClose}
        open={open.avatarDialog}
        imageUrl={tempImage}
        borderRadius={10000}
        height={300}
        ratio={1}
      />
    </WideLayout>
  );
}

const defaultProject = {
  name: "CO2-Labels for University Canteen",
  status: DEFAULT_STATUS
};
