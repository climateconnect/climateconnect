import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Typography, Tooltip, IconButton, Button } from "@material-ui/core";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";
import UploadImageDialog from "../dialogs/UploadImageDialog";
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

const useStyles = makeStyles(theme => {
  return {
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
    }
  };
});

export default function AddPhotoSection({
  projectData,
  handleSetProjectData,
  className,
  subHeaderClassname,
  toolTipClassName,
  helpTexts,
  ToolTipIcon,
  open,
  handleSetOpen
}) {
  const classes = useStyles(projectData);
  const [tempImage, setTempImage] = React.useState(projectData.image);
  const inputFileRef = React.useRef(null);

  const handleDialogClickOpen = dialogName => {
    handleSetOpen({ [dialogName]: true });
  };

  const onImageChange = event => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert("Please upload either a png or a jpg file.");
    setTempImage(URL.createObjectURL(file));
    handleDialogClickOpen("avatarDialog");
  };

  const onUploadImageClick = event => {
    event.preventDefault();
    inputFileRef.current.click();
  };

  const handleAvatarDialogClose = image => {
    handleSetOpen({ avatarDialog: false });
    if (image && image instanceof HTMLCanvasElement) {
      handleSetProjectData({ image: image.toDataURL() });
    }
  };

  return (
    <>
      <div className={className}>
        <Typography
          component="h2"
          variant="subtitle2"
          color="primary"
          className={subHeaderClassname}
        >
          Add photo*
          <Tooltip title={helpTexts.addPhoto} className={toolTipClassName}>
            <IconButton>
              <ToolTipIcon />
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
          />
          <div className={classes.imageZone}>
            <div className={classes.addPhotoWrapper}>
              <div className={classes.addPhotoContainer}>
                <AddAPhotoIcon className={classes.photoIcon} />
                <Button variant="contained" color="primary" onClick={onUploadImageClick}>
                  {!projectData.image ? "Upload Image" : "Change image"}
                </Button>
              </div>
            </div>
          </div>
        </label>
      </div>
      <UploadImageDialog
        onClose={handleAvatarDialogClose}
        open={open.avatarDialog}
        imageUrl={tempImage}
        borderRadius={0}
        height={300}
        ratio={16 / 9}
      />
    </>
  );
}
