import { Chip, Tooltip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles({
  root: {
    textTransform: "uppercase",
    borderRadius: 10,
  },
});

type Props = {
  status: any;
  className?: any;
};

export default function ProjectStatus({ status, className }: Props) {
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
