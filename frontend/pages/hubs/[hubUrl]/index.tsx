import React, { useContext, useState, useEffect } from "react";
import UserContext from "../../../src/components/context/UserContext";
import DevlinkPage from "../../../src/components/devlink/DevlinkPage";
import WideLayout from "../../../src/components/layouts/WideLayout";
import PageNotFound from "../../../src/components/general/PageNotFound";
import getTexts from "../../../public/texts/texts";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import LoadingSpinner from "../../../src/components/general/LoadingSpinner";
import theme from "../../../src/themes/theme";
import { HubData } from "../../../src/types";
import { getHubData } from "../../../public/lib/getHubData";

//Types
type DevlinkComponentType = React.ComponentType<any> | null;

interface TextsType {
  [key: string]: string;
}

interface NotFoundPageProps {
  texts: TextsType;
  link: string;
  showHeader?: boolean;
}

interface LandingPageProps {
  hubData: HubData | null;
  hubUrl?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ texts, link, showHeader }) => {
  return (
    <>
      {showHeader ? (
        <WideLayout>
          <PageNotFound
            itemName="landing page"
            returnText={texts.return_to_hubs}
            returnLink={link}
          />
        </WideLayout>
      ) : (
        <PageNotFound itemName="landing page" returnText={texts.return_to_hubs} returnLink={link} />
      )}
    </>
  );
};

export async function getServerSideProps(ctx: any) {
  const hubUrl = ctx?.params?.hubUrl as string | undefined;

  if (!hubUrl) {
    return {
      props: {
        hubData: null,
        hubUrl: null,
      },
    };
  }

  const hubData = await getHubData(hubUrl, ctx.locale);
  if (!hubData?.landing_page_component) {
    return {
      redirect: {
        destination: `/hubs/${hubUrl}/browse`,
        // redirect is based on current hub data, and that might change in the future so permanent: false,
        permanent: false,
      },
    };
  }
  return {
    props: {
      hubData,
      hubUrl,
    },
  };
}

const LandingPage: React.FC<LandingPageProps> = ({ hubData, hubUrl }) => {
  const { locale, donationGoal } = useContext(UserContext);
  const donationGoalActive = donationGoal && donationGoal.hub === hubUrl;
  const texts = getTexts({ page: "landing_page", locale: locale }) as TextsType;
  const [DevlinkComponent, setDevlinkComponent] = useState<DevlinkComponentType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadComponent = async () => {
      if (!hubData?.landing_page_component) {
        setIsLoading(false);
        return;
      }

      try {
        // Identify the correct component name based on locale

        // The landing page name follows a specific structure.
        // For example, for Erlangen, we have:
        // - `EnChErlangenLandingpage` (English)
        // - `DeChErlangenLandingpage` (German)
        // Since the database stores only one landing page component name,
        // We need to determine the component name for other languages.
        let componentName = hubData.landing_page_component;
        const currentPrefix = componentName.startsWith("En") ? "En" : "De";
        const desiredPrefix = locale === "en" ? "En" : "De";

        if (currentPrefix !== desiredPrefix) {
          componentName = componentName.replace(new RegExp(`^${currentPrefix}`), desiredPrefix);
        }

        // Javascript Dynamic import Devlink component
        const mod = await import("../../../devlink");

        if (mod[componentName]) {
          setDevlinkComponent(() => mod[componentName]);
        } else {
          console.warn(`Component ${componentName} not found in devlink.`);
          setDevlinkComponent(null);
        }
      } catch (error) {
        console.error("Error loading devlink component:", error);
        setDevlinkComponent(null);
      }

      // Set loading to false whether the try block succeeds or fails
      setIsLoading(false);
    };

    loadComponent();
  }, [locale, hubData]);

  // Handle loading state
  if (isLoading) {
    return <LoadingSpinner isLoading color="#fff" noMarginTop />;
  }
  // Handle missing data
  if (!hubUrl || !hubData) {
    return <NotFoundPage texts={texts} link={"/hubs/"} showHeader />;
  }

  const title = `${texts.climateHub} ${hubData?.name} | ${texts.citizen_climate_action} ${hubData?.name}`;
  const description = `${texts.find_fellow_campaigners_for_climate_protection_idea}`;

  return (
    <DevlinkPage
      title={title}
      description={description}
      isHubPage={true}
      hubUrl={hubUrl}
      isLocationHub={isLocationHubLikeHub(hubData?.hub_type)}
      isLandingPage={true}
      headerBackground={theme.palette.primary.main}
      showDonationGoal={donationGoalActive}
    >
      {DevlinkComponent ? (
        <DevlinkComponent />
      ) : (
        <NotFoundPage texts={texts} link={`${hubUrl}/browse`} />
      )}
    </DevlinkPage>
  );
};

export default LandingPage;
