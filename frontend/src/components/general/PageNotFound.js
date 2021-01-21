import { makeStyles, Typography, Link } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(5),
  },
}));

export default function PageNotFound({ itemName, returnText, returnLink }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h1">{itemName ? `${itemName} ` : "Page "} not found.</Typography>
      <p>
        <Link href={returnLink ? returnLink : "/browse"}>
          {returnText ? returnText : "Return to home."}
        </Link>
      </p>
    </div>
  );
}
