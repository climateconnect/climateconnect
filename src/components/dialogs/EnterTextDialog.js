import React from "react";
import PropTypes from "prop-types";
import { TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles({
  textField: {
    width: "100%"
  }
});

export default function EnterTextDialog({
  onClose,
  open,
  title,
  inputLabel,
  applyText,
  maxLength,
  className
}) {
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

  const handleKeyPress = event => {
    if (event.key === "Enter") applyElement();
  };

  return (
    <GenericDialog
      onClose={handleClose}
      open={open}
      title={title}
      useApplyButton={true}
      onApply={applyElement}
      applyText={applyText ? applyText : "Apply"}
    >
      <div className={className}>
        <TextField
          className={classes.textField}
          label={inputLabel}
          autoFocus={true}
          variant="outlined"
          onChange={handleChange}
          defaultValue={element}
          inputProps={{ maxLength: maxLength }}
          onKeyPress={handleKeyPress}
        />
      </div>
    </GenericDialog>
  );
}

EnterTextDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  inputLabel: PropTypes.string.isRequired,
  applyText: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  className: PropTypes.string
};
