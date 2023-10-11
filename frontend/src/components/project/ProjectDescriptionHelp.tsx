import { ClassNames } from "@emotion/react";
import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(1)
  }
}))

export default function ProjectDescriptionHelp({ project_type }) {
  const { locale } = useContext(UserContext);
  const classes = useStyles()
  const texts = getTexts({ page: "project", locale: locale });
  /*const bulletPoints = {
    project: [
      "bulletpoint 3"
    ],
    event: [
      "bulletpoint 2"
    ],
    idea: [
      "bulletpoint 1"
    ]
  }*/
  return (
    <div className={classes.root}>
      {/*<Typography>
        {texts.please_touch_on_the_following_points_in_your_project_description}:
      </Typography>
      <ul>
        {bulletPoints[project_type.type_id]?.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
        </ul>*/}
      <Typography>{texts.if_you_want_to_include_a_video_in_your_project_description}</Typography>
    </div>
  );
}
