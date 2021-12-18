import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import MessageContent from "../communication/MessageContent";

const useStyles = makeStyles((theme) => ({
  headline: {
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: theme.spacing(2),
  },
}));

export default function DetailledDescription({ title, value, className }) {
  const classes = useStyles();
  return (
    <div className={className}>
      <Typography color="primary" variant="h2" className={classes.headline}>
        {title}
      </Typography>
      <MessageContent content={value} />
    </div>
  );
}
