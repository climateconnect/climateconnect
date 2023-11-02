import { TextField } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles({
  textField: {
    width: "100%",
  },
});

type Props = {
  onClose: any;
  open: boolean;
  title: any;
  inputLabel: any;
  applyText: any;
  applyIcon?: any;
  maxLength: any;
  className: any;
};

export default function EnterTextDialog({
  onClose,
  open,
  title,
  inputLabel,
  applyText,
  applyIcon,
  maxLength,
  className,
}: Props) {
  const classes = useStyles();
  const [element, setElement] = React.useState(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const handleClose = () => {
    onClose();
    setElement(null);
  };

  const applyElement = () => {
    onClose(element);
    setElement(null);
  };

  const handleChange = (event) => {
    setElement(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") applyElement();
  };

  return (
    <GenericDialog
      onClose={handleClose}
      open={open}
      title={title}
      useApplyButton={true}
      applyIcon={applyIcon}
      onApply={applyElement}
      applyText={applyText ? applyText : texts.apply}
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
  className: PropTypes.string,
};
