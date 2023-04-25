import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles<Theme, { isFooterIcon?: boolean }>((theme) => ({
  inheritColor: {
    color: "inherit",
  },
  socialMediaLink: (props) => ({
    height: 20,
    marginLeft: theme.spacing(1),
    color: props.isFooterIcon ? "inherit" : theme.palette.primary.main,

    "&:hover": {
      color: theme.palette.primary.main,
    },
  }),
}));

export default function SocialMediaButton({ href, socialMediaIcon, altText, isFooterIcon }) {
  const classes = useStyles({ isFooterIcon: isFooterIcon });
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes.inheritColor}>
      <socialMediaIcon.icon className={classes.socialMediaLink} alt={altText} />
    </a>
  );
}
