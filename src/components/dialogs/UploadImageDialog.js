import React from "react";
import PropTypes from "prop-types";
import { Slider } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
//Package AvatarEditor returns an object {default: defaultFunction} instead of a function which triggers a warning. This is why we use <AvatarEditor.default> in the exported function.
import AvatarEditor from "react-avatar-editor";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles({
  avatarEditor: {
    margin: "0 auto",
    display: "block"
  },
  slider: {
    display: "block",
    margin: "0 auto"
  }
});

export default function UploadImageDialog({
  onClose,
  open,
  imageUrl,
  borderRadius,
  ratio,
  height,
  mobileHeight,
  mediumHeight
}) {
  const classes = useStyles();
  const theme = useTheme();
  const defaultValue = 25;
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const mediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const smallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const [scale, setScale] = React.useState(1);
  const [editor, setEditor] = React.useState(null);

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

  const setEditorRef = editor => setEditor(editor);

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

  return (
    <GenericDialog
      className={classes.dialog}
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullScreen={fullScreen}
      title={"Upload an image"}
      useApplyButton={true}
      applyText="Apply"
      onApply={applyImage}
    >
      <div className={classes.dialogContent}>
        <AvatarEditor
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
          defaultValue={defaultValue}
          className={classes.slider}
          onChange={handleSliderChange}
          style={{ maxWidth: sliderMaxWidth }}
        />
      </div>
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
  mediumHeight: PropTypes.number
};
