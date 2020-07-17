import React from "react";
import { Container, Typography, TextField, Button, List, Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import projectOverviewStyles from "../../../public/styles/projectOverviewStyles";
import { getImageUrl, getImageDialogHeight } from "../../../public/lib/imageOperations";
import UploadImageDialog from "../dialogs/UploadImageDialog";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
import imageCompression from "browser-image-compression";
import MultiLevelSelectDialog from "../dialogs/MultiLevelSelectDialog";

const useStyles = makeStyles(theme => ({
  ...projectOverviewStyles(theme),
  projectTitleInput: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: "100%"
  },
  largeProjectTitleInput: {
    fontSize: 32
  },
  largeScreenImageContainer: {
    width: "50%"
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
  addPhotoContainer: {
    position: "absolute",
    left: "-50%",
    top: "-50%",
    width: 170
  },
  addPhotoWrapper: {
    position: "absolute",
    left: "calc(50% - 85px)",
    top: "calc(50% - 44px)"
  },
  photoIcon: {
    display: "block",
    marginBottom: theme.spacing(1),
    margin: "0 auto",
    cursor: "pointer",
    fontSize: 40
  },
  cityInput: {
    marginBottom: theme.spacing(1)
  },
  overviewHeadline: {
    fontSize: 12
  },
  openCategoriesDialogButton: {
    marginTop: theme.spacing(1)
  }
}));

export default function EditProjectOverview({
  project,
  handleSetProject,
  smallScreen,
  tagsOptions
}) {
  const classes = useStyles();
  const handleChangeProject = (newValue, key) => {
    handleSetProject({ ...project, [key]: newValue });
  };
  return (
    <Container className={classes.projectOverview}>
      {smallScreen ? (
        <SmallScreenOverview
          project={project}
          handleChangeProject={handleChangeProject}
          tagsOptions={tagsOptions}
        />
      ) : (
        <LargeScreenOverview
          project={project}
          handleChangeProject={handleChangeProject}
          tagsOptions={tagsOptions}
        />
      )}
    </Container>
  );
}

function SmallScreenOverview({ project, handleChangeProject, tagsOptions }) {
  const classes = useStyles();
  return (
    <>
      <InputImage project={project} screenSize="small" handleChangeProject={handleChangeProject} />
      <div className={classes.blockProjectInfo}>
        <InputName project={project} screenSize="small" />
        <InputShortDescription project={project} handleChangeProject={handleChangeProject} />
        <InputLocation project={project} handleChangeProject={handleChangeProject} />
        <InputTags
          tagsOptions={tagsOptions}
          project={project}
          handleChangeProject={handleChangeProject}
        />
      </div>
    </>
  );
}

function LargeScreenOverview({ project, handleChangeProject, tagsOptions }) {
  const classes = useStyles();
  return (
    <>
      <InputName project={project} screenSize="large" handleChangeProject={handleChangeProject} />
      <div className={classes.flexContainer}>
        <div className={classes.largeScreenImageContainer}>
          <InputImage
            project={project}
            screenSize="large"
            handleChangeProject={handleChangeProject}
          />
        </div>
        <div className={classes.inlineProjectInfo}>
          <InputShortDescription project={project} handleChangeProject={handleChangeProject} />
          <InputLocation project={project} handleChangeProject={handleChangeProject} />
          <InputTags
            tagsOptions={tagsOptions}
            project={project}
            handleChangeProject={handleChangeProject}
          />
        </div>
      </div>
    </>
  );
}

const InputShortDescription = ({ project, handleChangeProject }) => {
  return (
    <TextField
      label="Summary"
      variant="outlined"
      multiline
      fullWidth
      value={project.short_description}
      type="text"
      onChange={event =>
        handleChangeProject(event.target.value.substring(0, 240), "short_description")
      }
      required
      helperText={
        "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
      }
      placeholder={
        "Briefly summarise what you are doing (up to 240 characters)\n\nPlease only use English!"
      }
    />
  );
};

const InputLocation = ({ project, handleChangeProject }) => {
  const classes = useStyles();
  return (
    <div className={classes.projectInfoEl}>
      <TextField
        label="City"
        variant="outlined"
        fullWidth
        value={project.city}
        className={classes.cityInput}
        type="text"
        onChange={event => handleChangeProject(event.target.value, "city")}
        required
      />
      <TextField
        label="Country"
        variant="outlined"
        fullWidth
        value={project.city}
        type="text"
        onChange={event => handleChangeProject(event.target.value, "country")}
        required
      />
    </div>
  );
};

const InputTags = ({ project, handleChangeProject, tagsOptions }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState(project.tags ? [...project.tags] : []);

  const onClickCategoriesDialogOpen = () => {
    setOpen(true);
  };

  const handleCategoriesDialogClose = tags => {
    if (tags) handleChangeProject(tags, "tags");
    setOpen(false);
  };

  const handleTagDelete = tag => {
    handleChangeProject([...project.tags.filter(t => t.id !== tag.id)], "tags");
    setSelectedItems([...project.tags.filter(t => t.id !== tag.id)]);
  };

  return (
    <div className={classes.projectInfoEl}>
      <Typography variant="body2" className={classes.overviewHeadline}>
        Project categories
      </Typography>
      {project.tags && (
        <List className={classes.flexContainer}>
          {project.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag.name}
              className={classes.skill}
              onDelete={() => handleTagDelete(tag)}
            />
          ))}
          <Button
            className={classes.openCategoriesDialogButton}
            variant="contained"
            color="primary"
            onClick={onClickCategoriesDialogOpen}
          >
            {project.tags && project.tags.length ? "Edit categories" : "Add categories"}
          </Button>
        </List>
      )}
      <MultiLevelSelectDialog
        open={open}
        onClose={handleCategoriesDialogClose}
        type="categories"
        itemsToChooseFrom={tagsOptions}
        items={project.tags}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        maxSelections={3}
      />
    </div>
  );
};

const InputName = ({ project, screenSize, handleChangeProject }) => {
  const classes = useStyles();
  return (
    <TextField
      label="Project title"
      value={project.name}
      className={classes.projectTitleInput}
      inputProps={screenSize === "large" ? { className: classes.largeProjectTitleInput } : {}}
      type="text"
      onChange={event => handleChangeProject(event.target.value, "name")}
      required
    />
  );
};

const InputImage = ({ project, handleChangeProject, screenSize }) => {
  const classes = useStyles(project);

  const inputFileRef = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [tempImage, setTempImage] = React.useState(
    project.image ? getImageUrl(project.image) : null
  );

  const onImageChange = async event => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 550,
      useWebWorker: true
    };
    try {
      const compressedFile = await imageCompression(file, options);
      setTempImage(URL.createObjectURL(compressedFile));
      setOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const onUploadImageClick = event => {
    event.preventDefault();
    inputFileRef.current.click();
  };

  const handleImageDialogClose = image => {
    setOpen(false);
    if (image && image instanceof HTMLCanvasElement)
      handleChangeProject(image.toDataURL("image/jpeg"), "image");
  };

  return (
    <>
      <label htmlFor="photo" className={classes.imageZoneWrapper}>
        <input
          type="file"
          name="photo"
          ref={inputFileRef}
          id="photo"
          style={{ display: "none" }}
          onChange={onImageChange}
          accept=".png,.jpeg,.jpg"
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
      <UploadImageDialog
        onClose={handleImageDialogClose}
        open={open}
        imageUrl={tempImage}
        borderRadius={0}
        height={screenSize === "small" ? getImageDialogHeight(window.innerWidth) : 300}
        ratio={16 / 9}
      />
    </>
  );
};
