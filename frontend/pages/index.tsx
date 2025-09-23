import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useEffect } from "react";
import UserContext from "../src/components/context/UserContext";
import Layout from "../src/components/layouts/layout";
import Link from "next/link";

//for usage without webflow token
const Fallback = () => (
  <div>
    <p>
      This page will show webflow content, if the tokens are set up in .env file and devlink folder
      is created.
    </p>
    <Link href="/browse" passHref>
      <button>Browse</button>
    </Link>
  </div>
);
let CCLandingpage: any = Fallback;
let ENLandingpageClimateConnect: any = Fallback;
if (process.env.ENABLE_DEVLINK === "true") {
  const devlink = require("../devlink");
  CCLandingpage = devlink.CcLandingpage;
  ENLandingpageClimateConnect = devlink.EnLandingpageClimateConnect;
}

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
    <Layout>
      <div className={classes.container}>
        {locale === "de" ? <CCLandingpage /> : <ENLandingpageClimateConnect />}
      </div>
    </Layout>
  );
}
