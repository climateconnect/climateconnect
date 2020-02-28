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
  dialogContent: {
    padding: theme.spacing(2),
    width: theme.spacing(50),
    fontSize: "large"
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
  buttonsContainer: {
    marginTop: theme.spacing(3),
    textAlign: "right"
  },
  button: {
    marginLeft: theme.spacing(2)
  }
}));

export default function ConfirmDialog(props) {
  const { onClose, open, cancelText, confirmText, text, title } = props;
  const classes = useStyles();

  const handleCancel = () => {
    onClose(false);
  };

  const handleConfirm = () => {
    onClose(true);
  };

  return (
    <Dialog
      className={classes.dialog}
      onClose={handleCancel}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth="md"
    >
      <DialogTitle id="simple-dialog-title">
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <KeyboardBackspaceIcon />
          </IconButton>
        ) : null}
        <span className={classes.titleText}>{title}</span>
      </DialogTitle>
      <div className={classes.dialogContent}>
        <div>{text}</div>
        <div className={classes.buttonsContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCancel}
            className={classes.button}
          >
            {cancelText}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            className={classes.button}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired
};
