import React from "react";
import { makeStyles, Button } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  button: {
    background: "#D7F7F5",
    color: theme.palette.primary.main,
    height: 55,
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
    fontSize: 18,
    "&:hover": {
      background: "#fff"
    }
  }
}));

export default function LightBigButton({ className, children, href }) {
  const classes = useStyles();
  return (
    <Button variant="contained" href={href} className={`${classes.button} ${className}`}>
      {children}
    </Button>
  );
}
