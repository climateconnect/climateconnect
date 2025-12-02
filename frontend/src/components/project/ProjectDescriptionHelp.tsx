import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(1),
  },
}));

export default function ProjectDescriptionHelp() {
  const { locale } = useContext(UserContext);
  const classes = useStyles();
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <div className={classes.root}>
      <Typography>{texts.if_you_want_to_include_a_video_in_your_project_description}</Typography>
    </div>
  );
}
