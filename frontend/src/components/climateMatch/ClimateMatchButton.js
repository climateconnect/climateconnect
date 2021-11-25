import { makeStyles } from "@material-ui/core";
import React from "react";
import LightBigButton from "../staticpages/LightBigButton";

const useStyles = makeStyles(() => ({
  wide: {
    width: 250,
  },
}));

export default function ClimateMatchButton({ children, className, wide, onClick }) {
  const classes = useStyles();
  return (
    <LightBigButton className={`${wide && classes.wide} ${className}`} onClick={onClick}>
      {children}
    </LightBigButton>
  );
}
