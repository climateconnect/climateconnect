import { Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => {
  return {
    loginNudge: {
      margin: "0 auto",
      marginTop: theme.spacing(12),
    },
    loginNudgeText: {
      textAlign: "center",
      fontSize: 35,
    },
  };
});

export default function LoginNudge({ whatToDo, fullPage, className }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage && classes.loginNudgeText}>
        {texts.please}{" "}
        <Link underline="always" color="primary" href={getLocalePrefix(locale) + "/signin"}>
          {texts.log_in}
        </Link>{" "}
        {texts.or}{" "}
        <Link underline="always" color="primary" href={getLocalePrefix(locale) + "/signup"}>
          {texts.sign_up}
        </Link>{" "}
        {whatToDo}.
      </Typography>
    </div>
  );
}
