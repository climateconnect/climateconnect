import { Typography, Checkbox, TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GenericDialog from "../dialogs/GenericDialog";
import React, { useContext } from "react";
import { verifySocialMediaLinks } from "../../../public/lib/socialMediaOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  socialMediaIcons: {
    height: 40,
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  socialLink: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(2),
  },
  socialMediaCheckBox: {
    display: "flex",
    alignItems: "center",
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`,
    fontWeight: "bold",
  },
}));

export default function SocialMediaInputs({
  socials,
  handleChangeSocialCheckBox,
  handleChangeSocialLink,
  open,
  title,
  onClose,
}) {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale });
  console.log(socials);
  const handleClose = () => {
    onClose();
  };
  const handleApply = (event) => {
    event.preventDefault();
    onClose(texts);
  };
  const classes = useStyles();
  return (
    <>
      <GenericDialog onClose={handleClose} open={open} title={title}>
        <form onSubmit={handleApply}>
          {socials.options.map((option, index) => (
            <>
              <div className={classes.socialMediaCheckBox}>
                <Checkbox
                  id={"checkbox" + option.key}
                  checked={
                    socials.value[socials.value.findIndex((val) => val.key === option.key)]
                      ?.is_checked
                  }
                  className={classes.inlineBlockElement}
                  color="primary"
                  onChange={(e) =>
                    handleChangeSocialCheckBox({
                      target: { value: e.target.checked },
                      index: index,
                    })
                  }
                />
                <label htmlFor={"checkbox" + option.key}>{option.label}</label>
                <option.icon className={classes.socialMediaIcons} />
              </div>
              {socials.value[socials.value.findIndex((val) => val.key === option.key)]
                ?.is_checked && (
                <>
                  <TextField
                    className={classes.socialLink}
                    fullWidth
                    required
                    multiline
                    value={
                      socials.value[socials.value.findIndex((val) => val.key === option.key)]
                        .social_media_channel.ask_for_full_website
                        ? socials.value[socials.value.findIndex((val) => val.key === option.key)]
                            ?.url
                        : socials.value[socials.value.findIndex((val) => val.key === option.key)]
                            ?.handle
                    } // find the index at which the value key's is the same as the option
                    onChange={(event) =>
                      handleChangeSocialLink(
                        socials.value[socials.value.findIndex((val) => val.key === option.key)]
                          ?.key,
                        event.target.value
                      )
                    }
                    label={option.label}
                  />
                </>
              )}
            </>
          ))}
          <Button variant="contained" color="primary" className={classes.applyButton} type="submit">
            {"save"}
          </Button>
        </form>
      </GenericDialog>
    </>
  );
}
