import { Button, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.light,
    borderRadius: theme.spacing(4),
    ["&:hover"]: {
      background: "#76c2bc",
    },
  },
  wide: {
    width: 250,
  },
}));

export default function ClimateMatchButton({ children, className, wide, onClick }) {
  const classes = useStyles();
  return (
    <Button
      onClick={onClick}
      size="large"
      variant="contained"
      className={`${classes.root} ${wide && classes.wide} ${className}`}
    >
      {children}
    </Button>
  );
}
