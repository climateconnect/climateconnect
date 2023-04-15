import { Button, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useRef, useState } from "react";
import {
  getCompressedJPG,
  getImageDialogHeight,
  getResizedImage,
  whitenTransparentPixels,
} from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import UploadImageDialog from "../dialogs/UploadImageDialog";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

const useStyles = makeStyles<Theme, { image?: string }>((theme) => ({
  root: (props) => ({
    width: 256,
    height: 192,
    position: "relative",
    cursor: "pointer",
    border: props.image ? "0" : `2px dashed ${theme.palette.primary.main}`,
  }),
  display_image: (props) => ({
    backgroundImage: `url(${props.image})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  }),
  chooseImageButtonContainer: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%,-50%)",
  },
  uploadImageButton: {
    width: 190,
    zIndex: -1,
  },
  inputLabel: {
    width: "100%",
    height: "100%",
    display: "block",
    cursor: "pointer",
  },
  avatarPhotoIconContainer: {
    position: "absolute",
    left: "calc(50% - 20px)",
    top: "calc(50% - 20px)",
  },
}));

export default function UploadImageField({ image, className, updateImages }) {
  const classes = useStyles({ image: image });
  const [open, setOpen] = useState(false);
  const [uploadImageDialogLoading, setUploadImageDialogLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [tempImages, setTempImage] = useState("");
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("lg"));

  const handleClickInput = () => {
    setSelectedFile("");
  };

  const handleDialogClose = (newImage) => {
    setOpen(false);
    if (newImage && newImage instanceof HTMLCanvasElement) {
      whitenTransparentPixels(newImage);
      newImage.toBlob(async function (blob) {
        const resizedBlob = URL.createObjectURL(blob!);
        const thumbnailBlob = await getResizedImage(
          URL.createObjectURL(blob!),
          192,
          256,
          "image/jpeg"
        );
        updateImages({ thumbnail_image: thumbnailBlob, image: resizedBlob });
      }, "image/jpeg");
    }
  };

  const onChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type || !ACCEPTED_IMAGE_TYPES.includes(file.type))
      alert(texts.please_upload_either_a_png_or_a_jpg_file);

    try {
      setOpen(true);
      setUploadImageDialogLoading(true);
      const compressedImage = (await getCompressedJPG(file, 1)) as string;
      setTempImage(compressedImage);
      setUploadImageDialogLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickUploadButton = (e) => {
    e.preventDefault();
    inputRef.current!.click();
  };

  return (
    <div className={`${classes.root} ${className} ${image && classes.display_image}`}>
      <label htmlFor="avatarPhoto" className={classes.inputLabel}>
        <input
          type="file"
          name="avatarPhoto"
          id="avatarPhoto"
          style={{ display: "none" }}
          onChange={onChange}
          accept=".png,.jpeg,.jpg"
          value={selectedFile}
          onClick={handleClickInput}
          ref={inputRef}
        />

        <div className={classes.chooseImageButtonContainer}>
          <Button
            color="primary"
            variant="contained"
            className={classes.uploadImageButton}
            onClick={handleClickUploadButton}
          >
            {image ? texts.change_image : texts.upload_image}
          </Button>
        </div>
      </label>
      <UploadImageDialog
        onClose={handleDialogClose}
        open={open}
        imageUrl={tempImages}
        height={isNarrowScreen ? getImageDialogHeight(window.innerWidth) : 200}
        ratio={4 / 3}
        loading={uploadImageDialogLoading}
      />
    </div>
  );
}
