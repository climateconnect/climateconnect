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
};
export default function LoginNudge({ whatToDo, fullPage, className }: Props) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const urlParams = new URLSearchParams(window.location.search);
  const hub = urlParams.get("hub");

  const router = useRouter();
  const { asPath } = router;
  const path = asPath ? encodeURIComponent(asPath) : "";
  const redirectUrl = hub ? (path !== null ? path + `&hub=${hub}` : path + `?hub=${hub}`) : path;

  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage ? classes.loginNudgeText : undefined}>
        {texts.please}{" "}
        <Link
          underline="always"
          color="primary"
          href={`${getLocalePrefix(locale)}/signin${redirectUrl ? `?redirect=${redirectUrl}` : ""}`}
        >
          {texts.log_in}
        </Link>{" "}
        {texts.or}{" "}
        <Link
          underline="always"
          color="primary"
          href={`${getLocalePrefix(locale)}/signup${hub ? `?hub=${hub}` : ""}`}
        >
          {texts.sign_up}
        </Link>{" "}
        {whatToDo}.
      </Typography>
    </div>
  );
}
