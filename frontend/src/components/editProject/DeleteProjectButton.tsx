import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import getProjectTypeTexts from "../../../public/data/projectTypeTexts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  deleteProjectButton: {
    float: "right",
    backgroundColor: theme.palette.error.main,
    color: "white",
    "&:hover": {
      backgroundColor: "#ea6962",
    },
  },
}));

export default function DeleteProjectButton({ project, handleClickDeleteProjectPopup, className }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  const projectTypeTexts = getProjectTypeTexts(texts);
  const typeId = project.project_type?.type_id ?? "project";
  const finalClassName = className
    ? `${classes.deleteProjectButton} ${className}`
    : classes.deleteProjectButton;
  return (
    <Button
      classes={{
        root: finalClassName,
      }}
      variant="contained"
      color="error"
      onClick={handleClickDeleteProjectPopup}
    >
      {project.is_draft ? texts.delete_draft : projectTypeTexts.deleteProject[typeId]}
    </Button>
  );
}
