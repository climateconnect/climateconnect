import { Link, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import { useRouter } from "next/router";
import { extractHubFromUrl } from "../../../public/lib/hubOperations";

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

export default function LoginNudge({ whatToDo, fullPage, className }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const router = useRouter();
  const currentPath = router.asPath;
  const encodedRedirectUrl = encodeURIComponent(currentPath);
  const hubUrl = extractHubFromUrl(currentPath);
  
  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage ? classes.loginNudgeText : undefined}>
        {texts.please}{" "}
        <Link
          underline="always"
          color="primary"
          href={`${getLocalePrefix(locale)}/signin?redirect=${encodedRedirectUrl}`}
        >
          {texts.log_in}
        </Link>{" "}
        {texts.or}{" "}
        <Link
          underline="always"
          color="primary"
          href={`${getLocalePrefix(locale)}/signup${hubUrl ? `?hub=${hubUrl}` : ""}`}
        >
          {texts.sign_up}
        </Link>{" "}
        {whatToDo}.
      </Typography>
    </div>
  );
}
