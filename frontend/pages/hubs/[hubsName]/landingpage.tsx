import React from "react";
import { useRouter } from "next/router";
import { EnChErlangenLandingpage, DeChMarburgLandingpage } from "../../../devlink";

const LandingPage = () => {
  const router = useRouter();
  const { hubsName } = router.query;
  if (!hubsName) {
    return <div>Loading...</div>;
  }
  if (hubsName === "erlangen") return <EnChErlangenLandingpage />;
  else if (hubsName === "marburg") return <DeChMarburgLandingpage />;
  return <div>Page not found</div>;
};

export default LandingPage;
