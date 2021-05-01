import React from "react";
import PropTypes from "prop-types";

import { Dialog, DialogTitle, Button, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { makeStyles } from "@material-ui/core/styles";

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
  closeButton: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  titleText: (props) => ({
    marginLeft: theme.spacing(5),
    paddingRight: props.useApplyButton ? 150 : 0,
  }),
  applyButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1.5),
  },
}));

// This component should only be used by other "dialog" components
export default function GenericDialog({
  applyText,
  children,
  fullScreen,
  maxWidth,
  onApply,
  onClose,
  open,
  title,
  topBarFixed,
  useApplyButton,
}) {
  const classes = useStyles({ useApplyButton: useApplyButton, fullScreen: fullScreen });

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
    >
      <DialogTitle>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
        <span className={classes.titleText}>{title}</span>
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
      </DialogTitle>
      <div className={`${classes.dialogContent} ${topBarFixed && classes.scrollDialogContent}`}>
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
