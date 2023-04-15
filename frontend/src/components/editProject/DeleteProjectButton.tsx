import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
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

export default function DeleteProjectButton({ project, handleClickDeleteProjectPopup }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <Button
      classes={{
        root: classes.deleteProjectButton,
      }}
      variant="contained"
      color="error"
      onClick={handleClickDeleteProjectPopup}
    >
      {project.is_draft ? texts.delete_draft : texts.delete_project}
    </Button>
  );
}
