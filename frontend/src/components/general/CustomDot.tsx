import React from "react";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  dot: {
    background: "transparent",
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: "100%",
    margin: theme.spacing(0.5),
    width: 12,
    height: 12,
  },
  active: {
    background: theme.palette.secondary.main,
  },
}));

export default function CustomDot({ onClick, ...rest }: any) {
  const classes = useStyles();
  const { active } = rest;
  // onMove means if dragging or swiping in progress.
  // active is provided by this lib for checking if the item is active or not.
  return (
    <span className={`${classes.dot} ${active && classes.active}`} onClick={() => onClick()} />
  );
}
