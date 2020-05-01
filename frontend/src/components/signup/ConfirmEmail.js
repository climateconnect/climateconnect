import React from "react";
import { Paper, Typography } from "@material-ui/core";
import Layout from "./../layouts/layout";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5)
  },
  headline: {
    marginBottom: theme.spacing(3)
  }
}));

export default function ConfirmEmail({ values }) {
  const classes = useStyles();
  return (
    <Layout title="Sign Up">
      <Paper className={classes.root}>
        <Typography variant="h5" className={classes.headline}>
          You&apos;re almost done!
        </Typography>
        <Typography>We have sent an email with a confirmation link to {values.email}.</Typography>
        <Typography>Finish creating your account by clicking the link.</Typography>
      </Paper>
    </Layout>
  );
}
