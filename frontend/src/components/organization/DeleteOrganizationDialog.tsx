import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { bool, func, object, oneOfType, string } from "prop-types";
import React from "react";

import GenericDialog from "../dialogs/GenericDialog";

const useStyles = makeStyles((theme) => ({
  buttonsContainer: {
    marginTop: theme.spacing(3),
    textAlign: "right",
  },
  button: {
    marginLeft: theme.spacing(1),
  },
}));

export default function DeleteOrganizationDialog({
  onClose,
  open,
  cancelText,
  confirmText,
  text,
  title,
  className,
  showConfirmButton,
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
        {showConfirmButton && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            className={classes.button}
          >
            {confirmText}
          </Button>
        )}
      </div>
    </GenericDialog>
  );
}

DeleteOrganizationDialog.propTypes = {
  onClose: func.isRequired,
  open: bool.isRequired,
  cancelText: string.isRequired,
  confirmText: string.isRequired,
  text: oneOfType([string, object]).isRequired,
  title: string.isRequired,
  className: string,
  showConfirmButton: bool,
};

DeleteOrganizationDialog.defaultProps = {
  className: "",
  showConfirmButton: true,
};
