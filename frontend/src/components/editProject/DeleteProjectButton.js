import React from "react";
import { Button, makeStyles } from "@material-ui/core";

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
  return (
    <Button
      classes={{
        root: classes.deleteProjectButton,
      }}
      variant="contained"
      color="error"
      onClick={handleClickDeleteProjectPopup}
    >
      {project.is_draft ? "Delete Draft" : "Delete Project"}
    </Button>
  );
}
