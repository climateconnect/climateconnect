import { Button, Dialog, DialogTitle, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((theme) => ({
  dialog: (props) => ({
    [theme.breakpoints.up("sm")]: {
      padding: props.fullScreen ? 0 : theme.spacing(8),
    },
  }),
  noScrollDialog: {
    overflow: "hidden",
  },
  dialogContent: (props) => ({
    padding: theme.spacing(2),
    height: props.fullScreen ? "100%" : "auto",
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(2),
      paddingTop: 0,
    },
  }),
  scrollDialogContent: {
    height: "auto",
    overflow: "auto",
  },
  closeButtonLeft: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  closeButtonRight: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  titleText: (props) => ({
    marginLeft: props.closeButtonRightSide ? theme.spacing(-1) : theme.spacing(5),
    marginRight: props.closeButtonRightSide ? theme.spacing(5) : theme.spacing(0),
    paddingRight: props.useApplyButton ? 150 : 0,
    fontSize: 20,
  }),
  applyButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1.5),
  },
}));

// This component should only be used by other "dialog" components
export default function GenericDialog({
  onClose,
  open,
  title,
  useApplyButton,
  onApply,
  applyText,
  children,
  topBarFixed,
  fullScreen,
  maxWidth,
  paperClassName,
  closeButtonRightSide,
  closeButtonSmall,
  titleTextClassName,
  dialogContentClass,
}) {
  const classes = useStyles({
    useApplyButton: useApplyButton,
    fullScreen: fullScreen,
    closeButtonRightSide: closeButtonRightSide,
  });

  const handleCancel = () => {
    onClose(false);
  };
  return (
    <Dialog
      className={`${classes.dialog} ${topBarFixed && classes.noScrollDialog}`}
      onClose={handleCancel}
      open={open}
      maxWidth={maxWidth ? maxWidth : "md"}
      fullScreen={fullScreen}
      classes={{
        paper: paperClassName,
      }}
    >
      <DialogTitle>
        {onClose && !closeButtonRightSide && (
          <IconButton
            aria-label="close"
            className={classes.closeButtonLeft}
            onClick={onClose}
            size={closeButtonSmall && "small"}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Typography component="h2" className={`${titleTextClassName} ${classes.titleText}`}>
          {title}
        </Typography>
        {useApplyButton && applyText && (
          <Button
            variant="contained"
            color="primary"
            className={classes.applyButton}
            onClick={onApply}
          >
            {applyText}
          </Button>
        )}
        {onClose && closeButtonRightSide && (
          <IconButton
            aria-label="close"
            className={classes.closeButtonRight}
            onClick={onClose}
            size={closeButtonSmall && "small"}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <div
        className={`${classes.dialogContent} ${
          topBarFixed && classes.scrollDialogContent
        } ${dialogContentClass}`}
      >
        {children}
      </div>
    </Dialog>
  );
}

GenericDialog.propTypes = {
  applyText: PropTypes.string,
  onApply: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  useApplyButton: PropTypes.bool,
};
