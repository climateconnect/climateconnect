import { Button, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  button: {
    background: theme.palette.primary.extraLight,
    color: theme.palette.primary.main,
    height: 55,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    fontSize: 18,
    "&:hover": {
      background: "#fff",
    },
  },
}));

export default function LightBigButton({ className, children, href }) {
  const classes = useStyles();
  return (
    <Button variant="contained" href={href} className={`${classes.button} ${className}`}>
      {children}
    </Button>
  );
}
