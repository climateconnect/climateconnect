import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles(theme => ({
  buttonsContainer: {
    marginTop: theme.spacing(3),
    textAlign: "right"
  },
  button: {
    marginLeft: theme.spacing(2)
  }
}));

export default function ConfirmDialog(props) {
  const { onClose, open, cancelText, confirmText, text, title, className } = props;
  const classes = useStyles();

  const handleCancel = () => {
    onClose(false);
  };

  const handleConfirm = () => {
    onClose(true);
  };

  return (
    <GenericDialog onClose={handleCancel} open={open} title={title} className={className}>
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
    </GenericDialog>
  );
}

ConfirmDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  cancelText: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  title: PropTypes.string.isRequired,
  className: PropTypes.string
};
