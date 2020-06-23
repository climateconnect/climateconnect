import React from "react";
import { Chip, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    textTransform: "uppercase",
    borderRadius: 10
  }
});
export default function ProjectStatus({ status, className }) {
  const classes = useStyles();
  return (
    <Tooltip title="Project status">
      <Chip
        variant="outlined"
        className={`${className} ${classes.root}`}
        label={status.replace("_", " ")}
      />
    </Tooltip>
  );
}
