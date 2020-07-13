import React from "react";
import Layout from "../src/components/layouts/layout";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Link } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5)
  },
  headline: {
    marginBottom: theme.spacing(3)
  }
}));

export default function AccountCreated() {
  const classes = useStyles();
  return (
    <Layout title="Account created">
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.headline}>
          Congratulations! You have created your account!
        </Typography>
        <Typography variant="h4">
          <Link href="/signin">Click here to log in.</Link>
        </Typography>
      </Paper>
    </Layout>
  );
}
