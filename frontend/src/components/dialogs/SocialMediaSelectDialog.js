import { Button, FormControlLabel, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React, { useContext, useEffect, useRef, useState } from "react";
import { verifySocialMediaLink, verifySocialMediaLinks } from "../../../public/lib/socialMediaOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SelectField from "./../general/SelectField";
import GenericDialog from "./GenericDialog";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";

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
export default function SocialMediaSelectDialog({
  onClose,
  open,
  title,
  label,
  values,
  isSocial,
  className,
  socials,
}) {
  const classes = useStyles();
  const [element, setElement] = useState(null);
  const [socialMediaInfo, setSocialMediaInfo] = useState(socials);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const orgTexts = getTexts({ page: "organization", locale: locale });
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
 
  const isMounted = useRef(false);
  console.log(socials, "socials");
  console.log(socialMediaInfo, "smi");

  const handleClose = () => {
    setElement(null); // clears latest selection if not saved
    onClose();
  };

  const applySocialElement = (event) => {
    event.preventDefault();
    setElement(null); // clears latest selection
    console.log(element, socialMediaInfo);
    const socialToSend = socialMediaInfo.filter(
      (smi) => smi.social_media_channel.social_media_name === element[0].name
    )
    onClose(socialToSend, orgTexts);
  };

  useEffect(() => {
    if (isMounted.current) {
      if (element !== null) {
        const existingSocial = socialMediaInfo.filter(
          (smi) => smi.social_media_channel.social_media_name === element[0].name
        );
        const doesSocialExist = existingSocial.length !== 0 ? true : false;
      

        if (!doesSocialExist) {
          const social_media_option_new = {
            social_media_channel: {
              social_media_name: element[0].name,
              ask_for_full_website: element[0].ask_for_full_website,
              base_url: element[0].base_url,
            },
            handle: "",
            url: "",
          };
          
          setSocialMediaInfo([...socialMediaInfo, social_media_option_new]);
        }
      }
    } else {
      isMounted.current = true;
    }
  }, [element]);

  const handleSelectChange = (event) => {
    setElement(values.filter((x) => x.name === event.target.value));
  };

  const handleSocialMediaInfoChange = (newValue, socialName) => {
    const tempSocialMediaInfo = [...socialMediaInfo];
    const indexThatIsBeingEdited = tempSocialMediaInfo.findIndex(
      (tsmi) => tsmi.social_media_channel.social_media_name === socialName
    );
   
    
    tempSocialMediaInfo[indexThatIsBeingEdited].url = newValue;
    if ("" !== verifySocialMediaLink(tempSocialMediaInfo[indexThatIsBeingEdited], orgTexts)) {
      setIsValidUrl(false);
      setErrorMessage(verifySocialMediaLink(tempSocialMediaInfo[indexThatIsBeingEdited], orgTexts));
    } else {
      setIsValidUrl(true);
      setErrorMessage("");
    }

    setSocialMediaInfo([...tempSocialMediaInfo]);
    
  };
 
  return (
    <>
      <GenericDialog onClose={handleClose} open={open} title={title}>
        <form className={className} onSubmit={applySocialElement}>
          <SelectField
            required={!isSocial}
            className={classes.textField}
            onChange={handleSelectChange}
            label={label}
            options={values}
          />
          {isSocial && element !== null && (
            <TextField
              required
              error={!isValidUrl}
              helperText={errorMessage}
              variant="outlined"
              type="text"
              label={getLabel(values[values.findIndex((val) => val.name === element[0].name)])}
              value={getValue(
                socialMediaInfo[
                  socialMediaInfo.findIndex(
                    (val) => val.social_media_channel.social_media_name === element[0].name
                  )
                ]
              )}
              className={`${classes.textField} ${classes.marginTop}`}
              onChange={(event) =>
                handleSocialMediaInfoChange(
                  event.target.value,
                  socialMediaInfo[
                    socialMediaInfo.findIndex(
                      (val) => val.social_media_channel.social_media_name === element[0].name
                    )
                  ].social_media_channel.social_media_name
                )
              }
            />
          )}

          <Button disabled={!isValidUrl} variant="contained" color="primary" className={classes.applyButton} type="submit">
            {texts.add}
          </Button>
        </form>
      </GenericDialog>
    </>
  );
}

SocialMediaSelectDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  values: PropTypes.array.isRequired,
  className: PropTypes.string,
};

function getInitialValue(arr) {
  return [...arr];
}

function getLabel(value) {
  if (value === undefined) {
    return "";
  }
  return value.name;
}
function getValue(socialMediaInfo) {
 
  if (socialMediaInfo === undefined) {
    return "";
  }

  return socialMediaInfo.url;
}
