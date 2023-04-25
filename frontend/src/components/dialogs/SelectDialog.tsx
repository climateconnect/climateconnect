import { Button, TextField } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React, { useContext } from "react";

import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SelectField from "./../general/SelectField";
import GenericDialog from "./GenericDialog";

const useStyles = makeStyles((theme) => ({
  textField: {
    width: "100%",
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
  applyButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(1.5),
  },
  dialogContent: {
    width: theme.spacing(50),
  },
}));

/*
@values: the possible options of the select field. [{key:String, name:String, additionalInfo: Array}]
@supportAdditionalInfo: declares whether it should be possible to ask the user for additional info when he chooses an option
If @supportAdditionalInfo is true, you can optionally add an 'additionalInfo' property to each element of @values
*/
export default function SelectDialog({
  onClose,
  open,
  title,
  label,
  values,
  supportAdditionalInfo,
  className,
}) {
  const classes = useStyles();
  const [element, setElement] = React.useState<any>(null);
  const [additionalInfo, setAdditionalInfo] = React.useState<any[]>([]);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const handleClose = () => {
    onClose();
  };

  const applyElement = (event) => {
    event.preventDefault();
    onClose(element, additionalInfo);
  };

  const handleSelectChange = (event) => {
    const type = values.filter((x) => x.name === event.target.value)[0];
    const typeAsRequired = {
      key: type.key,
      hide_get_involved: type.hide_get_involved,
    };
    setElement(typeAsRequired);
    if (supportAdditionalInfo) {
      const value = values.filter((val) => val.name === event.target.value)[0];

      if (value.additionalInfo.length > 0) {
        setAdditionalInfo(
          value.additionalInfo.map((x) => {
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
    tempAdditionalInfo.filter((x) => x.key === key)[0].value = event.target.value;
    setAdditionalInfo(tempAdditionalInfo);
  };

  return (
    <GenericDialog onClose={handleClose} open={open} title={title}>
      <form className={className} onSubmit={applyElement}>
        <SelectField
          required
          className={classes.textField}
          onChange={handleSelectChange}
          label={label}
          options={values}
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
              onChange={(e) => handleAdditionalInfoChange(additionalInfo[i].key, e)}
            >
              {additionalInfo[i].value}
            </TextField>
          ))}
        <Button variant="contained" color="primary" className={classes.applyButton} type="submit">
          {texts.add}
        </Button>
      </form>
    </GenericDialog>
  );
}

SelectDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  supportAdditionalInfo: PropTypes.bool.isRequired,
  className: PropTypes.string,
};
