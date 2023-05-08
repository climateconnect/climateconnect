import { Avatar, Theme } from "@mui/material";
import React, { useContext, useRef, useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import {
  getCompressedJPG,
  getImageDialogHeight,
  getResizedImage,
  whitenTransparentPixels,
} from "../../../public/lib/imageOperations";
import UploadImageDialog from "../dialogs/UploadImageDialog";
import UserContext from "../context/UserContext";
import getTexts from "../../../public/texts/texts";
import ConfirmDialog from "../dialogs/ConfirmDialog";

export interface AvatarImage {
  imageUrl?: string;
  thumbnailImageUrl?: string;
}

interface UserAvatarProps {
  mode: "read" | "edit";
  imageUrl?: string;
  thumbnailImageUrl?: string;
  alternativeText?: string;
  isNarrowScreen: boolean;
  onAvatarChanged?: (image?: AvatarImage) => void;
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
    cursor: "pointer",
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
  const closeIconRef = useRef(null);

  
  const [tempImage, setTempImage] = useState<string | undefined>(undefined);
  const [dialogStates, setDialogStates] = useState<{
    uploadOpen: boolean;
    confirmDeleteOpen: boolean;
  }>({ uploadOpen: false, confirmDeleteOpen: false });

  const [avatarImage, setAvatarImage] = useState<AvatarImage>({
    imageUrl: props.imageUrl,
    thumbnailImageUrl: props.thumbnailImageUrl,
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
        setDialogStates({ ...dialogStates, uploadOpen: true });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const removeAvatarImage = (confirm) => {
    if (confirm) {
      setAvatarImage({ imageUrl: undefined, thumbnailImageUrl: undefined });
      props.onAvatarChanged && props.onAvatarChanged(undefined);
    }
    setDialogStates({ ...dialogStates, confirmDeleteOpen: false });
  };

  const handleAvatarClose = async (image) => {
    setDialogStates({ ...dialogStates, uploadOpen: false });
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

        const image = { imageUrl, thumbnailUrl };
        setAvatarImage(image);
        props.onAvatarChanged && props.onAvatarChanged(image);
      }, "image/jpeg");
    }
  };

  const onClickChangeImage = (e) => {
    if(e.target === closeIconRef.current) {
      //If we clicked on the remove image button don't open the interface to change your image
      return
    } else {
      inputFileRef.current?.click()
    }
  }

  return (
    <>
      <Avatar
        className={classes.avatarImage}
        alt={props.alternativeText}
        src={avatarImage.imageUrl}
      />
      {props.mode === "edit" && <div className={classes.imageOverlay}></div>}

      {props.mode === "edit" && (
        <div className={classes.editIconContainer} onClick = {onClickChangeImage}>
          <AddAPhotoIcon
            className={classes.editIcon}
            aria-label={texts.edit_avatar}
          />
          {avatarImage.imageUrl && (
            <CloseIcon
              className={classes.editIcon}
              onClick={() => setDialogStates({ ...dialogStates, confirmDeleteOpen: true })}
              aria-label={texts.remove_avatar}
              ref={closeIconRef}
            />
          )}
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
        open={dialogStates.uploadOpen}
        imageUrl={tempImage}
        borderRadius={10000}
        height={props.isNarrowScreen ? getImageDialogHeight(window.innerWidth) : 200}
        ratio={1}
      />

      <ConfirmDialog
        open={dialogStates.confirmDeleteOpen}
        onClose={removeAvatarImage}
        title={texts.remove_avatar}
        text={texts.do_you_really_want_to_remove_avatar}
        cancelText={texts.no}
        confirmText={texts.yes}
      />
    </>
  );
}
