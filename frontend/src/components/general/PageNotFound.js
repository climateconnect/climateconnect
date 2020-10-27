import { makeStyles, Typography, Link } from "@material-ui/core";
import React from "react"

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(5)
  }
}))

export default function PageNotFound({itemName}) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography variant="h1">{itemName ? itemName+" " : "Page "} not found.</Typography>
      <p>
        <Link href="/browse">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
  );
}