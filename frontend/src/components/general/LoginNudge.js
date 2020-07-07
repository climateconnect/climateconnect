import React from "react";
import { Typography, Link } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    loginNudge: {
      margin: "0 auto",
      marginTop: theme.spacing(12)
    },
    loginNudgeText: {
      textAlign: "center",
      fontSize: 35
    }
  };
});

export default function LoginNudge({ whatToDo, fullPage, className }) {
  const classes = useStyles();
  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage && classes.loginNudgeText}>
        Please{" "}
        <Link underline="always" color="primary" href="/signin">
          Log in
        </Link>{" "}
        or{" "}
        <Link underline="always" color="primary" href="/signup">
          sign up
        </Link>{" "}
        to {whatToDo}.
      </Typography>
    </div>
  );
}
