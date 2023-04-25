import { Button, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import React, { useContext } from "react";
import { redirect } from "../../../public/lib/apiOperations";
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

  const onClickSignUp = () => {
    let redirectUrl = window.location.href
      .replace(window.location.origin, "")
      .replace(`/${locale}/`, "");
    if (redirectUrl[0] === "/") {
      redirectUrl = redirectUrl.slice(1, redirectUrl.length);
    }
    redirect("/signin", { redirect: redirectUrl });
  };

  return (
    <>
      <Button color="grey" className={classes.signUpButton} variant="contained" onClick={onClickSignUp}>
        {texts.log_in}
      </Button>
      <IconButton aria-label="close" color="inherit" onClick={onClose} size="large">
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );
}
