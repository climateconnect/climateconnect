import { Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { useRouter } from "next/router";

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
  hubUrl?: string;
};

export default function LoginNudge({ whatToDo, fullPage, className, hubUrl }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const router = useRouter();
  const currentPath = router.asPath;
  const encodedRedirectUrl = encodeURIComponent(currentPath);

  let path_to_signin = `${getLocalePrefix(locale)}/signin?`;
  let path_to_signup = `${getLocalePrefix(locale)}/signup?`;

  path_to_signup += `redirect=${encodedRedirectUrl}`;
  path_to_signin += `redirect=${encodedRedirectUrl}`;

  if (hubUrl && hubUrl !== "") {
    path_to_signin += `&hub=${hubUrl}`;
    path_to_signup += `&hub=${hubUrl}`;
  }

  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage ? classes.loginNudgeText : undefined}>
        {texts.please}{" "}
        <Link underline="always" color="primary" href={path_to_signin}>
          {texts.log_in}
        </Link>{" "}
        {texts.or}{" "}
        <Link underline="always" color="primary" href={path_to_signup}>
          {texts.sign_up}
        </Link>{" "}
        {whatToDo}.
      </Typography>
    </div>
  );
}
