import React, { useContext } from "react";
import { useRouter } from "next/router";
import {
  EnChErlangenLandingpage,
  DeChErlangenLandingpage,
  DeChMarburgLandingpage,
  EnChMarburgLandingpage,
  EnChPotsdamLandingpage,
  DeChPotsdamLandingpage,
} from "../../../devlink";
import UserContext from "../../../src/components/context/UserContext";
import WebflowPage from "../../../src/components/webflow/WebflowPage";
import WideLayout from "../../../src/components/layouts/WideLayout";
import PageNotFound from "../../../src/components/general/PageNotFound";
import getTexts from "../../../public/texts/texts";

const LandingPage = () => {
  const router = useRouter();
  const { hubUrl } = router.query as { hubUrl: string };
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "landing_page", locale: locale });

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
  if (hubUrl && hubUrl in landingPages) {
    const LandingPage = {
      content: landingPages[hubUrl][locale],
    };

    // Locale not found, return 404
    if (!LandingPage.content) {
      return (
        <WideLayout description={`This is a landing page for ${hubUrl} `}>
          <PageNotFound
            itemName="landing page"
            returnText={texts.return_to_hubs}
            returnLink="/hubs"
          />
        </WideLayout>
      );
    }

    return (
      <WebflowPage
        description={`This is a landing page for ${hubUrl} `}
        transparentHeader={true}
        isStaticPage={false}
        isHubPage={true}
        hubName={hubUrl}
        isLandingPage={true}
      >
        <LandingPage.content />
      </WebflowPage>
    );
  } else {
    // Invalid hubUrl or hubUrl not found, return 404
    return (
      <WideLayout description={`This is a landing page for ${hubUrl} `}>
        <PageNotFound
          itemName="landing page"
          returnText={texts.return_to_hubs}
          returnLink="/hubs"
        />
      </WideLayout>
    );
  }
};

export default LandingPage;
