import React, { useContext, useState, useEffect } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import UserContext from "../../../src/components/context/UserContext";
import DevlinkPage from "../../../src/components/devlink/DevlinkPage";
import WideLayout from "../../../src/components/layouts/WideLayout";
import PageNotFound from "../../../src/components/general/PageNotFound";
import getTexts from "../../../public/texts/texts";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import LoadingSpinner from "../../../src/components/general/LoadingSpinner";
import theme from "../../../src/themes/theme";
//Types
type DevlinkComponentType = React.ComponentType<any> | null;
type LocaleType = "en" | "de" | undefined;

interface HubAmbassador {
  title?: string;
  [key: string]: any;
}

interface HubData {
  landing_page_component: string;
  hub_type: string;
  [key: string]: any;
}

interface TextsType {
  [key: string]: string;
}

interface NotFoundPageProps {
  texts: TextsType;
  link: string;
  showHeader?: boolean;
}

interface LandingPageProps {
  hubAmbassador: HubAmbassador | null;
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

//for description we need the Ambassador name
export async function getServerSideProps(ctx: any) {
  const hubUrl = ctx?.params?.hubUrl as string | undefined;

  if (!hubUrl) {
    return {
      props: {
        hubAmbassador: null,
        hubData: null,
        hubUrl: null,
      },
    };
  }

  const [hubAmbassador, hubData] = await Promise.all([
    getHubAmbassadorData(hubUrl, ctx.locale),
    getHubData(hubUrl, ctx.locale),
  ]);

  return {
    props: {
      hubAmbassador,
      hubData,
      hubUrl,
    },
  };
}

const getHubAmbassadorData = async (
  hubUrl: string,
  locale: LocaleType
): Promise<HubAmbassador | null> => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${hubUrl}/ambassador/`,
      locale,
    });
    return resp.data;
  } catch (err: any) {
    console.error(
      "Error fetching hub ambassador data:",
      err.response?.data?.detail || err.message || err
    );
    return null;
  }
};

const getHubData = async (url_slug: string, locale: LocaleType): Promise<HubData | null> => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/`,
      locale,
    });
    return resp.data;
  } catch (err: any) {
    console.error("Error fetching hub data:", err.response?.data?.detail || err.message || err);
    return null;
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ hubAmbassador, hubData, hubUrl }) => {
  const { locale } = useContext(UserContext);
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

  const title = `${texts.climateHub} ${hubUrl} | ${texts.find_suitable_climate_protection_commitment} ${hubUrl}`;
  const description = `${texts.find_fellow_campaigners_for_climate_protection_idea} ${
    hubAmbassador?.title
      ? `${hubAmbassador.title} ${texts.coordinates_the_climateHub}  ${hubUrl}  ${texts.is_there_for_you}`
      : ""
  } `;

  return (
    <DevlinkPage
      title={title}
      description={description}
      isHubPage={true}
      hubUrl={hubUrl}
      transparentBackgroundColor={theme.palette.primary.main}
      transparentHeader={true}
      isLocationHub={isLocationHubLikeHub(hubData?.hub_type)}
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
