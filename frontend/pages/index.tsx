import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useEffect } from "react";
import { CcLandingpage, EnLandingpageClimateConnect } from "../devlink";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";

const useStyles = makeStyles((theme) => ({
  container: {
    overflowAnchor: "none",
  },
}));

export default function Index() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  //This is a workaround for a bug with tabs in webflow's devlink
  //Without this code the page will always scroll down to the selected tab
  useEffect(() => {
    const onFirstScroll = (event) => {
      window.scrollTo(0, 0);
      document.removeEventListener("scroll", onFirstScroll);
    };
    document.addEventListener("scroll", onFirstScroll);
    return () => {
      document.removeEventListener("scroll", onFirstScroll);
    };
  }, []);

  return (
    <WideLayout>
      <div className={classes.container}>
        {locale === "de" ? <CcLandingpage /> : <EnLandingpageClimateConnect />}
      </div>
    </WideLayout>
  );
}
