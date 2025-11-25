"use client";

import { Button, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext } from "react";
import { redirect, getRedirectUrl } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(() => ({
  signUpButton: {
    background: "white",
  },
}));

export default function LogInAction({ onClose }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const urlParams = new URLSearchParams(window.location.search);
  const hub = urlParams.get("hub");

  const onClickSignUp = () => {
    const redirectUrl = getRedirectUrl(locale);
    redirect("/signin", { redirect: redirectUrl, hub: hub });
  };

  return (
    <>
      <Button
        color="grey"
        className={classes.signUpButton}
        variant="contained"
        onClick={onClickSignUp}
      >
        {texts.log_in}
      </Button>
      <IconButton aria-label="close" color="inherit" onClick={onClose} size="large">
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );
}
