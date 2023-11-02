import { Typography, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  typeIcon: {
    width: 20,
    height: 20,
    marginLeft: 0,
    marginRight: 8,
  },
}));

type Props = {
  projectType: any; //TODO: create projectType type
  className?: any;
  iconClassName?: any;
  textClassName?: any;
};

export default function ProjectTypeDisplay({
  projectType,
  className,
  iconClassName,
  textClassName,
}: Props) {
  const classes = useStyles();

  return (
    <div className={`${className} ${classes.root}`}>
      <img
        src={`/images/project_types/${projectType.type_id}.png`}
        className={iconClassName ? iconClassName : classes.typeIcon}
      />
      <Typography className={textClassName}>{projectType.name}</Typography>
    </div>
  );
}
