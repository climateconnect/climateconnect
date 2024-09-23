import React, { useContext } from "react";
import { useRouter } from "next/router";
import {
  EnChErlangenLandingpage,
  DeChErlangenLandingpage,
  DeChMarburgLandingpage,
  EnChMarburgLandingpage,
  EnChPotsdamLandingpage,
  DeChPotsdamLandingpage
} from "../../../devlink";
import UserContext from "../../../src/components/context/UserContext";
import WideLayout from "../../../src/components/layouts/WideLayout";
const LandingPage = () => {
  const router = useRouter();
  const { hubUrl } = router.query as { hubUrl: string };
  const { locale } = useContext(UserContext);
  console.log("hubUrl", typeof hubUrl);

  const landingPages = {
    erlangen: {
      de: DeChErlangenLandingpage,
      en: EnChErlangenLandingpage,
    },
    marburg: {
      de: DeChMarburgLandingpage,
      en: EnChMarburgLandingpage,
    },
    potsdam: {
      de: DeChPotsdamLandingpage,
      en: EnChPotsdamLandingpage,
    },
  };
  if (!hubUrl) {
    return <div>Loading...</div>;
  }
  const LandingPage = {
    content: landingPages[hubUrl][locale],
  };
  return (
    // <WideLayout
    //   title={"hi"}
    // >
    <LandingPage.content />
    // </WideLayout>
  );
  return <div>Page not found</div>;
};

export default LandingPage;
