import React, { useContext, useState, useEffect } from "react";
import { apiRequest } from "../../../public/lib/apiOperations";
import UserContext from "../../../src/components/context/UserContext";
import DevlinkPage from "../../../src/components/devlink/DevlinkPage";
import WideLayout from "../../../src/components/layouts/WideLayout";
import PageNotFound from "../../../src/components/general/PageNotFound";
import getTexts from "../../../public/texts/texts";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import LoadingSpinner from "../../../src/components/general/LoadingSpinner";

//Types
type DevlinkComponentType = React.ComponentType<any> | null;
type LocaleType = "en" | "de" | undefined;

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
  return {
    props: {
      hubData,
      hubUrl,
    },
  };
}

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

const LandingPage: React.FC<LandingPageProps> = ({ hubData, hubUrl }) => {
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

  const title = `${texts.climateHub} ${hubData?.name} | ${texts.citizen_climate_action} ${hubData?.name}`;
  const description = `${texts.find_fellow_campaigners_for_climate_protection_idea}`;

  return (
    <DevlinkPage
      title={title}
      description={description}
      isHubPage={true}
      hubUrl={hubUrl}
      // Since the text color of items in the Header is determined by `transparentHeader`,
      // use `transparentHeader` if you want the items to have white text color.
      transparentHeader={true}
      isLocationHub={isLocationHubLikeHub(hubData?.hub_type)}
      isLandingPage={true}
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
