import { Typography, Checkbox, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import React from "react";
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
}) {
  const classes = useStyles();
  return (
    <>
      <Typography className={classes.subtitle}>{socials.name}</Typography>

      {socials.options.map((option, index) => (
        <>
          <div className={classes.socialMediaCheckBox}>
            <Checkbox
              id={"checkbox" + option.key}
              checked={
                socials.value[socials.value.findIndex((val) => val.key === option.key)]?.is_checked
              }
              className={classes.inlineBlockElement}
              color="primary"
              onChange={(e) =>
                handleChangeSocialCheckBox({
                  target: { value: e.target.checked },
                  social_media_name:
                    socials.value[socials.value.findIndex((val) => val.key === option.key)]
                      ?.social_media_name,
                  index: index,
                })
              }
            />
            <label htmlFor={"checkbox" + option.key}>{option.label}</label>
            <option.icon className={classes.socialMediaIcons} />
          </div>
          {socials.value[socials.value.findIndex((val) => val.key === option.key)]?.is_checked && (
            <>
              <TextField
                className={classes.socialLink}
                fullWidth
                required
                multiline
                value={
                  socials.value[socials.value.findIndex((val) => val.key === option.key)]
                    ?.social_media_name
                } // find the index at which the value key's is the same as the option
                onChange={(event) =>
                  handleChangeSocialLink(
                    socials.value[socials.value.findIndex((val) => val.key === option.key)]?.key,
                    event.target.value
                  )
                }
                label={option.label}
              />
            </>
          )}
        </>
      ))}
    </>
  );
}
