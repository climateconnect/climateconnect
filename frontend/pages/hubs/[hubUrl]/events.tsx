import { GetServerSideProps } from "next";
import NextCookies from "next-cookies";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Theme, useMediaQuery } from "@mui/material";
import { getAllHubs } from "../../../public/lib/hubOperations";
import { getSectorOptions } from "../../../public/lib/getOptions";
import { apiRequest } from "../../../public/lib/apiOperations";
import { getFeatureTogglesFromRequest } from "../../../src/hooks/featureToggles";
import getTexts from "../../../public/texts/texts";
import UserContext from "../../../src/components/context/UserContext";
import WideLayout from "../../../src/components/layouts/WideLayout";
import HubTabsNavigation from "../../../src/components/hub/HubTabsNavigation";
import HubHeaderImage from "../../../src/components/hub/HubHeaderImage";
import HubContent from "../../../src/components/hub/HubContent";
import EventCalendarContent from "../../../src/components/eventCalendar/EventCalendarContent";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import {
  getHubAmbassadorData,
  getHubData,
  getHubSupportersData,
} from "../../../public/lib/getHubData";
import getHubTheme from "../../../src/themes/fetchHubTheme";
import { transformThemeData } from "../../../src/themes/transformThemeData";
import { getImageUrl } from "../../../public/lib/imageOperations";
import theme from "../../../src/themes/hubTheme";

const toOffsetIso = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
};

const getDefaultStartDateParams = (hubUrl: string): Record<string, string> => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return {
    start_date: toOffsetIso(start),
    hub: hubUrl,
  };
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const hubUrl = ctx.query.hubUrl as string;
  const { featureToggles } = await getFeatureTogglesFromRequest(ctx.req);
  if (!featureToggles.EVENT_CALENDAR_FEATURE) {
    return { notFound: true };
  }

  const locale = ctx.locale ?? "en";
  const token = NextCookies(ctx).auth_token;

  const hubs = await getAllHubs(locale);
  const hubExists = hubs.some((h: any) => h.url_slug === hubUrl);
  if (!hubExists) {
    return { notFound: true };
  }

  const sectorOptions = await getSectorOptions(locale);

  const [hubData, hubThemeData] = await Promise.all([
    getHubData(hubUrl, locale),
    getHubTheme(hubUrl),
  ]);

  let initialEvents: any[] = [];
  let initialHasMore = false;
  try {
    const params = new URLSearchParams({
      ...getDefaultStartDateParams(hubUrl),
      page: "1",
      page_size: "12",
    });
    const { data } = await apiRequest({
      method: "get",
      url: `/api/events/?${params.toString()}`,
      token,
      locale: locale as any,
    });
    initialEvents = data.results || [];
    initialHasMore = data.next !== null;
  } catch (e) {
    // Initial fetch failed; the client will retry when filters change.
  }

  return {
    props: {
      hubs,
      hubUrl,
      filterChoices: { sectors: sectorOptions },
      initialEvents,
      initialHasMore,
      hubData,
      hubThemeData,
    },
  };
};

export default function HubEventsPage({
  hubs,
  hubUrl,
  filterChoices,
  initialEvents,
  initialHasMore,
  hubData,
  hubThemeData,
}: any) {
  const { locale } = useContext(UserContext);
  const router = useRouter();
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const texts = useMemo(() => getTexts({ page: "hub", locale: locale }), [locale]);
  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;

  const isLocationHub = isLocationHubLikeHub(hubData?.hub_type, hubData?.parent_hub);
  const [hubAmbassador, setHubAmbassador] = useState(null);
  const [hubSupporters, setHubSupporters] = useState(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const retrievedHubAmbassador = await getHubAmbassadorData(hubUrl, locale);
      setHubAmbassador(retrievedHubAmbassador);
      if (isLocationHub) {
        const retrievedHubSupporters = await getHubSupportersData(hubUrl, locale);
        setHubSupporters(retrievedHubSupporters);
      }
    })();
  }, [hubUrl, locale]);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const TYPES_BY_TAB_VALUE = ["projects", "organizations", "members"];
  const type_names = {
    projects: texts.projects,
    organizations: isNarrowScreen ? texts.orgs : texts.organizations,
    members: texts.members,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tab = TYPES_BY_TAB_VALUE[newValue];
    router.push(`/hubs/${hubUrl}/browse#${tab}`);
  };

  return (
    <WideLayout
      title={hubData?.headline ?? undefined}
      hideAlert
      headerBackground={
        customTheme ? customTheme.palette.header.background : theme.palette.background.default
      }
      image={hubData?.image ? getImageUrl(hubData.image) : undefined}
      isHubPage
      hubUrl={hubUrl}
      customFooterImage={
        hubData?.custom_footer_image ? getImageUrl(hubData.custom_footer_image) : undefined
      }
      customTheme={customTheme}
      hasHubLandingPage={hubData?.landing_page_component ? true : false}
    >
      {!isLocationHub && (
        <HubHeaderImage
          image={hubData?.image ? getImageUrl(hubData.image) : undefined}
          source={hubData?.image_attribution}
          isLocationHub={isLocationHub}
        />
      )}
      <HubContent
        headline={hubData?.headline}
        hubAmbassador={hubAmbassador}
        hubSupporters={hubSupporters}
        quickInfo={hubData?.quick_info}
        statBoxTitle={hubData?.stat_box_title}
        stats={hubData?.stats}
        scrollToSolutions={scrollToContent}
        subHeadline={hubData?.sub_headline}
        welcomeMessageLoggedIn={hubData?.welcome_message_logged_in}
        welcomeMessageLoggedOut={hubData?.welcome_message_logged_out}
        isLocationHub={isLocationHub}
        hubData={hubData}
        hubUrl={hubUrl}
        image={hubData?.image ? getImageUrl(hubData.image) : undefined}
      />
      <HubTabsNavigation
        TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
        tabValue={-1}
        handleTabChange={handleTabChange}
        type_names={type_names}
        hubUrl={hubUrl}
        className=""
        allHubs={hubs}
        fromPage="hub"
      />
      <div ref={contentRef}>
        <EventCalendarContent
          initialEvents={initialEvents}
          initialHasMore={initialHasMore}
          filterChoices={filterChoices}
          hubUrl={hubUrl}
        />
      </div>
    </WideLayout>
  );
}
