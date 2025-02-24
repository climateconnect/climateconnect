import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import MessageContent from "../communication/MessageContent";

const useStyles = makeStyles((theme) => ({
  headline: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
    color: theme.palette.background.default_contrastText,
  },
}));

export default function DetailledDescription({ title, value, className }) {
  const classes = useStyles();
  return (
    <div className={className}>
      <Typography variant="h2" className={classes.headline}>
        {title}
      </Typography>
      <MessageContent content={value} />
    </div>
  );
}
