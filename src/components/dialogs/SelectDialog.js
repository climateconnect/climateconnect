import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, Button, IconButton, TextField } from "@material-ui/core";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { makeStyles } from "@material-ui/core/styles";
import SelectField from "./../general/SelectField";

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
  },
  marginTop: {
    marginTop: theme.spacing(2)
  }
}));

/*function arrayOfEmptyStrings(n) {
  new Array(n).join(".").split(".");
}*/

export default function EnterTextDialog(props) {
  const { onClose, open, title, label, values, supportAdditionalInfo } = props;
  const classes = useStyles();
  const [element, setElement] = React.useState(null);
  const [additionalInfo, setAdditionalInfo] = React.useState({});

  const handleClose = () => {
    onClose();
    setElement(null);
  };

  const applyElement = event => {
    event.preventDefault();
    onClose(element, additionalInfo);
  };

  const getKeyFromName = name => {
    return values.filter(x => x.name === name)[0].key;
  };

  const handleSelectChange = event => {
    setElement(getKeyFromName(event.target.value));
    if (supportAdditionalInfo) {
      const value = values.filter(val => val.name === event.target.value)[0];
      if (value.additionalInfo.length > 0) {
        setAdditionalInfo(
          value.additionalInfo.map(x => {
            return { ...x, value: "" };
          })
        );
      } else {
        setAdditionalInfo([]);
      }
    }
  };

  const handleAdditionalInfoChange = (key, event) => {
    const tempAdditionalInfo = [...additionalInfo];
    tempAdditionalInfo.filter(x => x.key === key)[0].value = event.target.value;
    setAdditionalInfo(tempAdditionalInfo);
  };

  return (
    <Dialog className={classes.dialog} onClose={handleClose} open={open} maxWidth="md">
      <DialogTitle>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
            <KeyboardBackspaceIcon />
          </IconButton>
        ) : null}
        <span className={classes.titleText}>{title}</span>
      </DialogTitle>
      <form className={classes.dialogContent} onSubmit={applyElement}>
        <SelectField
          required
          className={classes.textField}
          onChange={handleSelectChange}
          label={label}
          values={supportAdditionalInfo ? values.map(x => x.name) : values}
        />
        {supportAdditionalInfo &&
          additionalInfo.length > 0 &&
          additionalInfo.map((e, i) => (
            <TextField
              required
              variant="outlined"
              type="text"
              key={i}
              placeholder={additionalInfo[i].name}
              className={`${classes.textField} ${classes.marginTop}`}
              onChange={e => handleAdditionalInfoChange(additionalInfo[i].key, e)}
            >
              {additionalInfo[i].value}
            </TextField>
          ))}
        <Button variant="contained" color="primary" className={classes.applyButton} type="submit">
          Add
        </Button>
      </form>
    </Dialog>
  );
}

EnterTextDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  supportAdditionalInfo: PropTypes.bool.isRequired
};
