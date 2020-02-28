import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, Button, IconButton, TextField } from "@material-ui/core";
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
    width: theme.spacing(50)
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
  textField: {
    width: "100%"
  }
}));

export default function EnterTextDialog(props) {
  const { onClose, open, arrayName } = props;
  const classes = useStyles();
  const [element, setElement] = React.useState(null);

  const handleClose = () => {
    onClose();
    setElement(null);
  };

  const applyElement = () => {
    onClose(element);
    setElement(null);
  };

  const handleChange = event => {
    setElement(event.target.value);
  };

  return (
    <Dialog
      className={classes.dialog}
      onClose={handleClose}
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
        <span className={classes.titleText}>Add element to {arrayName}</span>
        <Button
          variant="contained"
          color="primary"
          className={classes.applyButton}
          onClick={applyElement}
        >
          Add
        </Button>
      </DialogTitle>
      <div className={classes.dialogContent}>
        <TextField
          className={classes.textField}
          label={"Enter what you want to add to " + arrayName.toLowerCase()}
          autoFocus={true}
          variant="outlined"
          onChange={handleChange}
          defaultValue={element}
        />
      </div>
    </Dialog>
  );
}

EnterTextDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  arrayName: PropTypes.string.isRequired
};
