import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React, { useContext, useState } from "react";
import { verifySocialMediaLink } from "../../../public/lib/socialMediaOperations";

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
  isSocial,
}) {
  const classes = useStyles();
  const [element, setElement] = React.useState(null);
  const [additionalInfo, setAdditionalInfo] = React.useState({});
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const orgTexts = getTexts({ page: "organization", locale: locale });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [textLabel, setTextLabel] = useState("");

  const handleClose = () => {
    // restore defaults before closing
    setElement(null);
    setTextLabel("");
    setHasError(false);
    setErrorMessage("");
    onClose();
  };

  const applyElement = (event) => {
    event.preventDefault();

    if (isSocial) {
      const url = element.ask_for_full_website
        ? additionalInfo[0].value
        : element.base_url + additionalInfo[0];
      if ("" !== verifySocialMediaLink(element, url, orgTexts)) {
        setHasError(true);
        setErrorMessage(verifySocialMediaLink(element, additionalInfo, orgTexts));
      } else {
        // restore defaults before closing
        setHasError(false);
        setErrorMessage("");
        onClose(element, additionalInfo);
        setElement(null);
      }
    } else {
      // restore defaults before closing
      onClose(element, additionalInfo);
      setElement(null);
    }
  };

  const handleSelectChange = (event) => {

    setHasError(false);
    setErrorMessage("");

    if (isSocial) {
      setElement(values.filter((val) => val.name === event.target.value)[0]);
    } else {
       const type = values.filter((x) => x.name === event.target.value)[0];
       const typeAsRequired = {
           key: type.key,
            hide_get_involved: type.hide_get_involved,
       };
       setElement(typeAsRequired);
    }

    if (supportAdditionalInfo) {
      const value = values.filter((val) => val.name === event.target.value)[0];
      if (isSocial) {
        setTextLabel(
          value?.ask_for_full_website ? value?.name : "Please enter your " + value?.name + " handle"
        );
      } else {
        setTextLabel(value?.name);
      }
      if (value?.additionalInfo.length > 0) {
        // would crashed when going from tag with additional info to the "empty" selection
        setAdditionalInfo(
          value?.additionalInfo.map((x) => {
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
          element !== null &&
          additionalInfo?.length > 0 &&
          additionalInfo.map((e, i) => (
            <>
              <TextField
                required
                error={hasError}
                helperText={errorMessage}
                variant="outlined"
                type="text"
                key={i}
                label={textLabel}
                placeholder={additionalInfo[i].name}
                className={`${classes.textField} ${classes.marginTop}`}
                onChange={(e) => handleAdditionalInfoChange(additionalInfo[i].key, e)}
              >
                {additionalInfo[i].value}
              </TextField>

              {!element?.ask_for_full_website && isSocial && (
                <TextField
                  disabled
                  variant="outlined"
                  type="text"
                  key={i}
                  label={element?.base_url + additionalInfo[0].value}
                  className={`${classes.textField} ${classes.marginTop}`}
                />
              )}
            </>
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
