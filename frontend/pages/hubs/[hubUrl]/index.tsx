import React, { useContext } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
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
import { buildHubUrl } from "../../../public/lib/urlBuilder";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";

//Types
type Locale = "en" | "de";
type HubUrl = "erlangen" | "marburg" | "potsdam";
type LandingPageComponent = React.ComponentType<{}>;

// Type for mapping Locale to LandingPageComponent
type LocaleLandingPageMap = {
  [key in Locale]: LandingPageComponent;
};

type LandingPageMap = {
  [key in HubUrl]: LocaleLandingPageMap;
};

const LANDING_PAGES: LandingPageMap = {
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

const isValidHubUrl = (hubUrl: string) => {
  return Object.keys(LANDING_PAGES).includes(hubUrl);
};

const NotFoundPage = ({ texts }: any) => {
  return (
    <WideLayout>
      <PageNotFound
        itemName="landing page"
        returnText={texts.return_to_hubs}
        returnLink={buildHubUrl()}
      />
    </WideLayout>
  );
};

//for description we need the Ambassador name
export async function getServerSideProps(ctx) {
  const hubUrl = ctx?.params?.hubUrl;
  const [hubAmbassador, hubData] = await Promise.all([
    getHubAmbassadorData(hubUrl, ctx.locale),
    getHubData(hubUrl, ctx.locale),
  ]);
  return {
    props: {
      hubAmbassador: hubAmbassador,
      hubData: hubData,
      hubUrl: hubUrl,
    },
  };
}

const getHubAmbassadorData = async (hubUrl, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${hubUrl}/ambassador/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in getHubAmbassadorData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};

const getHubData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
      console.error("Error in getHubData!: " + err.response.data.detail);
    }
    return null;
  }
};

const LandingPage = ({ hubAmbassador, hubData, hubUrl }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "landing_page", locale: locale });
  // Early return if hubUrl is not a string or undefined
  if (!hubUrl || typeof hubUrl !== "string") {
    return <NotFoundPage texts={texts} />;
  }

  // Check if hubUrl is valid
  if (!isValidHubUrl(hubUrl)) {
    return <NotFoundPage texts={texts} />;
  }

  const PageComponent = LANDING_PAGES[hubUrl][locale];

  // If no component found for the current locale
  if (!PageComponent) {
    return <NotFoundPage texts={texts} />;
  }

  const title = `${texts.climateHub} ${hubUrl} | ${texts.find_suitable_climate_protection_commitment} ${hubUrl}`;
  const description = `${texts.find_fellow_campaigners_for_climate_protection_idea} ${
    hubAmbassador?.title
      ? `${hubAmbassador.title} ${texts.coordinates_the_climateHub}  ${hubUrl}  ${texts.is_there_for_you}`
      : ""
  } `;

  return (
    <WebflowPage
      title={title}
      description={description}
      transparentHeader={true}
      isStaticPage={false}
      isHubPage={true}
      hubUrl={hubUrl}
      isLandingPage={true}
      showSuffix={false}
      isLocationHub={isLocationHubLikeHub(hubData?.hub_type)}
    >
      <PageComponent />
    </WebflowPage>
  );
};

export default LandingPage;
