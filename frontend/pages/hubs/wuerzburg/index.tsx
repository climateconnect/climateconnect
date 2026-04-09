import React, { FC, useContext } from "react";
import UserContext from "../../../src/components/context/UserContext";
import DevlinkPage from "../../../src/components/devlink/DevlinkPage";
import WideLayout from "../../../src/components/layouts/WideLayout";
import PageNotFound from "../../../src/components/general/PageNotFound";
import getTexts from "../../../public/texts/texts";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import theme from "../../../src/themes/theme";
import { HubData } from "../../../src/types";
import { getHubData } from "../../../public/lib/getHubData";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { EnChWuerzburgLandingpage } from "../../../devlink/EnChWuerzburgLandingpage";
import { ChWuerzburgDeLandingpage } from "../../../devlink/ChWuerzburgDeLandingpage";

const HUB_URL = "wuerzburg";

interface TextsType {
  [key: string]: string;
}

interface WuerzburgLandingPageProps {
  hubData: HubData | null;
}

export async function getServerSideProps(ctx: any) {
  const locale = ctx?.locale;
  const hubData = await getHubData(HUB_URL, locale);

  if (!hubData) {
    const localePrefix = getLocalePrefix(locale);
    return {
      redirect: {
        destination: `${localePrefix}/hubs/${HUB_URL}/browse`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      hubData,
    },
  };
}

const WuerzburgLandingPage: FC<WuerzburgLandingPageProps> = ({ hubData }) => {
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "landing_page", locale: locale }) as TextsType;

  if (!hubData) {
    return (
      <WideLayout>
        <PageNotFound
          itemName="landing page"
          returnText={texts.return_to_hubs}
          returnLink="/hubs/"
        />
      </WideLayout>
    );
  }

  const title = `${texts.climateHub} ${hubData.name} | ${texts.citizen_climate_action} ${hubData.name}`;
  const description = `${texts.find_fellow_campaigners_for_climate_protection_idea}`;

  return (
    <DevlinkPage
      title={title}
      description={description}
      isHubPage={true}
      hubUrl={HUB_URL}
      isLocationHub={isLocationHubLikeHub(hubData.hub_type)}
      isLandingPage={true}
      headerBackground={theme.palette.primary.main}
      showDonationGoal={true}
    >
      {locale === "en" ? <EnChWuerzburgLandingpage /> : <ChWuerzburgDeLandingpage />}
    </DevlinkPage>
  );
};

export default WuerzburgLandingPage;
