import { Button, IconButton, Theme, Tooltip, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import React, { useContext } from "react";
import { getImageDialogHeight } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import UploadImageDialog from "../dialogs/UploadImageDialog";
import {
  getCompressedJPG,
  getResizedImage,
  whitenTransparentPixels,
} from "./../../../public/lib/imageOperations";
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
import imageCompression from "browser-image-compression";

const useStyles = makeStyles<Theme, { image?: string; isCompressing: boolean }>((theme) => {
  return {
    imageZoneWrapper: {
      display: "block",
      width: "100%",
      position: "relative",
    },
    imageZone: (props) => ({
      cursor: "pointer",
      border: "1px dashed #000",
      width: "100%",
      paddingBottom: "56.25%",
      backgroundImage: `${props.image ? `url(${props.image})` : null}`,
      backgroundSize: "contain",
    }),
    photoIcon: (props) => ({
      display: "block",
      marginBottom: theme.spacing(1),
      margin: "0 auto",
      cursor: "pointer",
      fontSize: 40,
      opacity: props.isCompressing ? 0.5 : 1,
    }),
    addPhotoWrapper: {
      position: "absolute",
      left: "calc(50% - 85px)",
      top: "calc(50% - 44px)",
    },
    addPhotoContainer: {
      position: "absolute",
      left: "-50%",
      top: "-50%",
      width: 170,
    },
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
  handleSetOpen,
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const [tempImage, setTempImage] = React.useState(projectData.image);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const inputFileRef = React.useRef(null as HTMLInputElement | null);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const classes = useStyles({ image: projectData.image, isCompressing });

  const handleDialogClickOpen = (dialogName) => {
    handleSetOpen({ [dialogName]: true });
  };

  const onImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert(texts.please_upload_either_a_png_or_a_jpg_file);
      return;
    }
    try {
      setIsLoading(true);
      handleDialogClickOpen("avatarDialog");
      const image = await getCompressedJPG(file, 0.5);
      setTempImage(image);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onUploadImageClick = (event) => {
    event.preventDefault();
    inputFileRef.current!.click();
  };

  const handleAvatarDialogClose = async (image) => {
    // setIsCompressing(true);
    handleSetOpen({ avatarDialog: false });

    if (image && image instanceof HTMLCanvasElement) {
      whitenTransparentPixels(image);
      image.toBlob(async function (blob) {
        const options = {
          maxSizeMB: 0.5,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(blob as File, options);
        const resizedBlob = URL.createObjectURL(compressedFile!);
        const thumbnailBlob = await getResizedImage(
          URL.createObjectURL(blob!),
          290,
          160,
          "image/jpeg"
        );
        // console.log("commmmm", isCompressing);

        handleSetProjectData({
          image: resizedBlob,
          thumbnail_image: thumbnailBlob,
        });
      }, "image/jpeg");
      // setIsCompressing(false);
    }
  };

  return (
    <>
      <div className={className}>
        <Typography component="h2" variant="subtitle2" className={subHeaderClassname}>
          {texts.add_photo}*
          <Tooltip title={helpTexts.addPhoto} className={toolTipClassName}>
            <IconButton size="large">
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onUploadImageClick}
                  // disabled={isCompressing}
                >
                  {!projectData.image ? texts.upload_image : texts.change_image}
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
        height={isNarrowScreen ? getImageDialogHeight(window.innerWidth) : 300}
        ratio={16 / 9}
        loading={isLoading}
        loadingText={texts.processing_image_please_wait}
      />
    </>
  );
}
