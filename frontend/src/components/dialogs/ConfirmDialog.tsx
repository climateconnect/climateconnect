import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";

import GenericDialog from "./GenericDialog";

const useStyles = makeStyles((theme) => ({
  buttonsContainer: {
    marginTop: theme.spacing(3),
    textAlign: "right",
  },
  button: {
    marginLeft: theme.spacing(1),
  },
}));

export default function ConfirmDialog({
  onClose,
  open,
  cancelText,
  confirmText,
  text,
  title,
  className,
}) {
  const classes = useStyles();

  const handleCancel = () => {
    onClose(false);
  };

  const handleConfirm = () => {
    onClose(true);
  };
  return (
    <GenericDialog onClose={handleCancel} open={open} title={title} dialogContentClass={className}>
      <Typography>{text}</Typography>
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
  className: PropTypes.string,
};
