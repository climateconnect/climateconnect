import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, Button, IconButton, Slider } from "@material-ui/core";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AvatarEditor from "react-avatar-editor";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles(theme => ({
  dialog: {
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(8)
    }
  },
  dialogContent: {
    padding: theme.spacing(2)
  },
  avatarEditor: {
    margin: "0 auto",
    display: "block"
  },
  closeButton: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  titleText: {
    marginLeft: theme.spacing(5)
  },
  applyButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1.5)
  },
  slider: {
    display: "block",
    margin: "0 auto"
  }
}));

export default function UploadImageDialog(props) {
  const { onClose, open, image, borderRadius, ratio, height, mobileHeight, mediumHeight } = props;
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const mediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const smallScreen = useMediaQuery(theme.breakpoints.down("xs"));

  const [scale, setScale] = React.useState(1);
  const [editor, setEditor] = React.useState(null);

  const handleClose = () => {
    onClose();
  };

  const handleSliderChange = (e, newValue) => {
    setScale(0.1 + newValue / 27.5);
  };

  const applyImage = () => {
    onClose(editor.getImageScaledToCanvas());
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
    <Dialog
      className={classes.dialog}
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullScreen={fullScreen}
      maxWidth="md"
    >
      <DialogTitle id="simple-dialog-title">
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <KeyboardBackspaceIcon />
          </IconButton>
        ) : null}
        <span className={classes.titleText}>Upload an image!</span>
        <Button
          variant="contained"
          color="primary"
          className={classes.applyButton}
          onClick={applyImage}
        >
          Apply
        </Button>
      </DialogTitle>
      <div className={classes.dialogContent}>
        <AvatarEditor
          className={classes.avatarEditor}
          image={image}
          ref={setEditorRef}
          id="avatarEditor"
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
          defaultValue={25}
          className={classes.slider}
          onChange={handleSliderChange}
          style={{ maxWidth: sliderMaxWidth }}
        />
      </div>
    </Dialog>
  );
}

UploadImageDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  ratio: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};
