import { Slider, Theme, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
//Package AvatarEditor returns an object {default: defaultFunction} instead of a function which triggers a warning. This is why we use <AvatarEditor.default> in the exported function.
import AvatarEditor from "react-avatar-editor";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LoadingSpinner from "../general/LoadingSpinner";
import GenericDialog from "./GenericDialog";
import { getBackgroundContrastColor } from "../../../public/lib/themeOperations";

const useStyles = makeStyles((theme) => ({
  avatarEditor: {
    margin: "0 auto",
    display: "block",
  },
  slider: {
    display: "block",
    margin: "0 auto",
  },
  loadingSpinner: {
    paddingBottom: theme.spacing(8),
  },
  dialog: {
    position: "relative",
  },
  titleText: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    fontSize: 20,
    color: theme.palette.text.primary,
  },
}));

type Props = {
  onClose?;
  open?;
  imageUrl?;
  borderRadius?;
  ratio?;
  height?;
  mobileHeight?;
  mediumHeight?;
  loading?;
  loadingText?;
};

export default function UploadImageDialog({
  onClose,
  open,
  imageUrl,
  borderRadius,
  ratio,
  height,
  mobileHeight,
  mediumHeight,
  loading,
  loadingText,
}: Props) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const classes = useStyles();
  const theme = useTheme();
  const defaultValue = 25;
  const fullScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const mediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const smallScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));

  const [scale, setScale] = useState(1);
  const [editor, setEditor] = useState<any>(null);

  const handleClose = () => {
    setScale(1);
    onClose();
  };

  const handleSliderChange = (e, newValue) => {
    /*Don't allow scaling down lower than 10% for usability. 
    Dividing newValue by (defaultValue/0.9) is done so that the scale===1 at default value*/
    setScale(0.1 + newValue / (defaultValue / 0.9));
  };

  const applyImage = () => {
    onClose(editor.getImage());
    setScale(1);
  };

  const setEditorRef = (editor) => setEditor(editor);

  const widthToUse =
    mobileHeight && smallScreen
      ? mobileHeight * ratio
      : mediumHeight && mediumScreen
      ? mediumHeight * ratio
      : height * ratio;
  const heightToUse =
    smallScreen && mobileHeight
      ? mobileHeight
      : mediumHeight && mediumScreen
      ? mediumHeight
      : height;
  const sliderMaxWidth =
    smallScreen && mobileHeight
      ? mobileHeight * ratio + 100
      : mediumHeight && mediumScreen
      ? mediumHeight * ratio + 100
      : height * ratio + 100;

  const backgroundContrastColor = getBackgroundContrastColor(theme);
  const AvatarEditorComponent = AvatarEditor as any;
  return (
    <GenericDialog
      /*TODO(undefined) className={classes.dialog} */
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullScreen={fullScreen}
      title={texts.upload_an_image}
      useApplyButton={true}
      applyText={texts.apply}
      onApply={applyImage}
    >
      {loading ? (
        <>
          <LoadingSpinner className={classes.loadingSpinner} isLoading />
          {loadingText && (
            <Typography component="p" className={classes.titleText}>
              {loadingText}
            </Typography>
          )}
        </>
      ) : (
        <div /*TODO(undefined) className={classes.dialogContent} */>
          <AvatarEditorComponent
            className={classes.avatarEditor}
            image={imageUrl}
            ref={setEditorRef}
            width={widthToUse}
            height={heightToUse}
            border={50}
            color={[0, 0, 0, 0.6]} // RGBA
            scale={scale}
            rotate={0}
            borderRadius={borderRadius ? borderRadius : 0}
          />
          <Slider
            aria-label="Image size"
            color={backgroundContrastColor}
            defaultValue={defaultValue}
            className={classes.slider}
            onChange={handleSliderChange}
            style={{ maxWidth: sliderMaxWidth }}
          />
        </div>
      )}
    </GenericDialog>
  );
}

UploadImageDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  imageUrl: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  ratio: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  mobileHeight: PropTypes.number,
  mediumHeight: PropTypes.number,
};
