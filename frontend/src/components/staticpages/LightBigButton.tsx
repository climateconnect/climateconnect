import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
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

export default function LightBigButton({
  className,
  children,
  href,
  onClick,
}: {
  className?: string;
  children?;
  href?: string;
  onClick?;
}) {
  const classes = useStyles();
  return (
    <Button
      variant="contained"
      href={href}
      className={`${classes.button} ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
