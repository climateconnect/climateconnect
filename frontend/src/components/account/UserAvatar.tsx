import { Avatar, Theme } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import {
  getCompressedJPG,
  getResizedImage,
  whitenTransparentPixels,
} from "../../../public/lib/imageOperations";
import UploadImageDialog from "../dialogs/UploadImageDialog";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";

interface UserAvatarProps {
  mode: "read" | "edit";
  imageUrl?: string;
  alternativeText?: string;
}

const dimensions = 150;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];

const useStyles = makeStyles<Theme>((theme) => ({
  avatarImage: {
    width: `${dimensions}px`,
    height: `${dimensions}px`,
    border: "4px solid white",
  },
  imageOverlay: {
    position: "absolute",
    opacity: 0.4,
    backgroundColor: "white",
    width: `calc(${dimensions}px - 4px)`,
    height: `calc(${dimensions}px - 4px)`,
    borderRadius: "100px",
  },
  editIconContainer: {
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    width: `${dimensions}px`,
    height: `${dimensions}px`,
    alignItems: "center",
    justifyContent: "center",
    columnGap: theme.spacing(1),
  },
  editIcon: {
    fontSize: "40px",
    cursor: "pointer",
  },
}));

export function UserAvatar(props: UserAvatarProps): JSX.Element {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "account", locale: locale });

  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [tempImage, setTempImage] = useState<string | undefined>(undefined);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);

  const [avatarImage, setAvatarImage] = useState<{ imageUrl: string; thumbnailUrl: string }>({
    imageUrl: "",
    thumbnailUrl: "",
  });

  const onImageChanged = async (avatarEvent) => {
    const file = avatarEvent.target.files[0];
    if (file && file.type) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert(texts.please_upload_either_a_png_or_a_jpg_file);
      }

      try {
        const compressedImage = await getCompressedJPG(file, 0.5);
        setTempImage(() => compressedImage);
        setUploadDialogOpen(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAvatarClose = async (image) => {
    setUploadDialogOpen(false);
    if (image && image instanceof HTMLCanvasElement) {
      whitenTransparentPixels(image);
      image.toBlob(async function (blob) {
        const imageUrl = URL.createObjectURL(blob!);
        const thumbnailUrl = await getResizedImage(
          URL.createObjectURL(blob!),
          120,
          120,
          "image/jpeg"
        );
        setAvatarImage({ imageUrl, thumbnailUrl });
      }, "image/jpeg");
    }
  };

  return (
    <>
      <Avatar
        className={classes.avatarImage}
        alt={props.alternativeText}
        src={avatarImage.imageUrl}
      />
      {props.mode === "edit" && <div className={classes.imageOverlay}></div>}

      {props.mode === "edit" && (
        <div className={classes.editIconContainer}>
          <AddAPhotoIcon
            className={classes.editIcon}
            onClick={() => inputFileRef.current?.click()}
          />
          <CloseIcon
            className={classes.editIcon}
            onClick={() => console.log("delete photo clicked")}
          />
        </div>
      )}

      <input
        type="file"
        name="avatarPhoto"
        id="avatarPhoto"
        ref={inputFileRef}
        style={{ display: "none" }}
        onChange={onImageChanged}
        accept=".png,.jpeg,.jpg"
      />

      <UploadImageDialog
        onClose={handleAvatarClose}
        open={uploadDialogOpen}
        imageUrl={tempImage}
        borderRadius={10000}
        height={/*isNarrowScreen ? getImageDialogHeight(window.innerWidth) : */ 200}
        ratio={1}
      />
    </>
  );
}
