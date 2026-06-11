import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import getProjectTypeTexts from "../../../public/data/projectTypeTexts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    marginBottom: theme.spacing(1),
  },
}));

type Props = {
  typeId?: string;
};

export default function ProjectDescriptionHelp({ typeId }: Props) {
  const { locale } = useContext(UserContext);
  const classes = useStyles();
  const texts = getTexts({ page: "project", locale: locale });
  const projectTypeTexts = getProjectTypeTexts(texts);
  const type = typeId || "project";
  return (
    <div className={classes.root}>
      <Typography>{projectTypeTexts.videoDescription[type]}</Typography>
    </div>
  );
}
