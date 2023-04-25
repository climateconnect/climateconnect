import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import LightBigButton from "../staticpages/LightBigButton";

const useStyles = makeStyles(() => ({
  wide: {
    width: 250,
  },
}));

export default function ClimateMatchButton({ children, className, wide, onClick }: any) {
  const classes = useStyles();
  return (
    <LightBigButton className={`${wide && classes.wide} ${className}`} onClick={onClick}>
      {children}
    </LightBigButton>
  );
}
