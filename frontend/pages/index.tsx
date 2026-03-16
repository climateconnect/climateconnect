import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useEffect, useState } from "react";
import { CcLandingpage, EnLandingpageClimateConnect } from "../devlink";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";

const useStyles = makeStyles(() => ({
  container: {
    overflowAnchor: "none",
  },
}));

export default function Index() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const [previousLocale, setPreviousLocale] = useState(locale);
  //This is a workaround for a bug with tabs in webflow's devlink
  //Without this code the page will always scroll down to the selected tab
  useEffect(() => {
    const onFirstScroll = () => {
      window.scrollTo(0, 0);
      document.removeEventListener("scroll", onFirstScroll);
    };
    document.addEventListener("scroll", onFirstScroll);

    // Only reload if the locale has actually changed
    if (locale !== previousLocale) {
      window.location.reload();
      setPreviousLocale(locale);
    }
    return () => {
      document.removeEventListener("scroll", onFirstScroll);
    };
  }, [locale]);

  return (
    <WideLayout>
      <div className={classes.container}>
        {locale === "de" ? <CcLandingpage /> : <EnLandingpageClimateConnect />}
      </div>
    </WideLayout>
  );
}
