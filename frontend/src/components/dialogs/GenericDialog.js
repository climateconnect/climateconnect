import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, Button, IconButton } from "@material-ui/core";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  dialog: {
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(8)
    }
  },
  noScrollDialog: {
    overflow: "hidden"
  },
  dialogContent: {
    padding: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(2),
      paddingTop: 0
    }
  },
  scrollDialogContent: {
    height: "auto",
    overflow: "auto"
  },
  closeButton: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  titleText: props => ({
    marginLeft: theme.spacing(5),
    paddingRight: props.useApplyButton ? 150 : 0
  }),
  applyButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1.5)
  }
}));

//This component should only be used by other "dialog" components
export default function GenericDialog({
  onClose,
  open,
  title,
  useApplyButton,
  onApply,
  applyText,
  children,
  topBarFixed,
  fullScreen
}) {
  const classes = useStyles({ useApplyButton: useApplyButton });

  const handleCancel = () => {
    onClose(false);
  };
  return (
    <Dialog
      className={`${classes.dialog} ${topBarFixed && classes.noScrollDialog}`}
      onClose={handleCancel}
      open={open}
      maxWidth="md"
      fullScreen={fullScreen}
    >
      <DialogTitle>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <KeyboardBackspaceIcon />
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
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  useApplyButton: PropTypes.bool,
  onApply: PropTypes.func,
  applyText: PropTypes.string
};
