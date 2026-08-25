import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import AppLink from "../general/AppLink";
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

  const router = useRouter();
  const currentPath = router.asPath;
  const encodedRedirectUrl = encodeURIComponent(currentPath);
  // `AppLink` reads the active hub from `HubContext` and applies the locale,
  // appending `?hub=<slug>` and joining the existing `?redirect=` query with
  // `&` (never a second `?`). The component no longer has to source hub state.
  const signinHref = `/signin?redirect=${encodedRedirectUrl}`;
  const signupHref = "/signup";

  return (
    <div className={`${fullPage && classes.loginNudge} ${className}`}>
      <Typography className={fullPage ? classes.loginNudgeText : undefined}>
        {texts.please}{" "}
        <AppLink underline="always" color="primary" href={signinHref}>
          {texts.log_in}
        </AppLink>{" "}
        {texts.or}{" "}
        <AppLink underline="always" color="primary" href={signupHref}>
          {texts.sign_up}
        </AppLink>{" "}
        {whatToDo}.
      </Typography>
    </div>
  );
}
