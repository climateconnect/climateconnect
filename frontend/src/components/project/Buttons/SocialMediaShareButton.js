import { IconButton, makeStyles } from "@material-ui/core";
import React from "react";
import ShareIcon from "@material-ui/icons/Share";

const useStyles = makeStyles((theme) => ({
  button: {
    color: "white",
    width: 35,
    height: 35,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default function SocialMediaShareButton({ containerClassName, toggleShowSocials }) {
  const classes = useStyles();
  const handleClick = () => {
    toggleShowSocials(true);
  };
  return (
    <div className={containerClassName}>
      <IconButton className={classes.button} onClick={handleClick}>
        {/*adjusted viewBox to center the icon*/}
        <ShareIcon viewBox="2 0 24 24" />
      </IconButton>
    </div>
  );
}
