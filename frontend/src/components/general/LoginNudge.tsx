import { Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
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

type Props = {
  whatToDo: string;
  fullPage?: boolean;
  className?: string;
  queryString?: string;
};
export default function LoginNudge({ whatToDo, fullPage, className, queryString }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage ? classes.loginNudgeText : undefined}>
        {texts.please}{" "}
        <Link
          underline="always"
          color="primary"
          href={
            queryString
              ? `${getLocalePrefix(locale) + "/signin?" + queryString}`
              : `${getLocalePrefix(locale) + "/signin"}`
          }
        >
          {texts.log_in}
        </Link>{" "}
        {texts.or}{" "}
        <Link
          underline="always"
          color="primary"
          href={
            queryString
              ? `${getLocalePrefix(locale) + "/signup?" + queryString}`
              : `${getLocalePrefix(locale) + "/signup"}`
          }
        >
          {texts.sign_up}
        </Link>{" "}
        {whatToDo}.
      </Typography>
    </div>
  );
}
