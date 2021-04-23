import { Chip, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles({
  root: {
    textTransform: "uppercase",
    borderRadius: 10,
  },
});
export default function ProjectStatus({ status, className }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale });
  return (
    <Tooltip title={texts.project_status}>
      <Chip
        variant="outlined"
        className={`${className} ${classes.root}`}
        label={status.replace("_", " ")}
      />
    </Tooltip>
  );
}
