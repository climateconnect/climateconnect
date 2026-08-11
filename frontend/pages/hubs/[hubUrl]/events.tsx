import { GetServerSideProps, GetServerSidePropsContext } from "next";
import NextCookies from "next-cookies";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Container, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { extractHubUrlsFromContext, getAllHubs } from "../../../public/lib/hubOperations";
import { getSectorOptions } from "../../../public/lib/getOptions";
import { apiRequest } from "../../../public/lib/apiOperations";
import { getFeatureTogglesFromRequest } from "../../../src/hooks/featureToggles";
import getTexts from "../../../public/texts/texts";
import UserContext from "../../../src/components/context/UserContext";
import WideLayout from "../../../src/components/layouts/WideLayout";
import HubTabsNavigation from "../../../src/components/hub/HubTabsNavigation";
import HubHeaderImage from "../../../src/components/hub/HubHeaderImage";
import HubContent from "../../../src/components/hub/HubContent";
import HubLinkButton from "../../../src/components/hub/HubLinkButton";
import EventCalendarContent from "../../../src/components/eventCalendar/EventCalendarContent";
import MobileBottomMenu from "../../../src/components/browse/MobileBottomMenu";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import {
  getHubAmbassadorData,
  getHubData,
  getHubSupportersData,
  getLinkedHubsData,
} from "../../../public/lib/getHubData";
import getHubTheme from "../../../src/themes/fetchHubTheme";
import { transformThemeData } from "../../../src/themes/transformThemeData";
import { getImageUrl } from "../../../public/lib/imageOperations";
import theme from "../../../src/themes/hubTheme";

const useStyles = makeStyles((theme) => ({
  linkedHubsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  linkedHubsContainerMobile: {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    gap: theme.spacing(2),
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
  },
  subHubInfoText: {
    fontStyle: "italic",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "left" as const,
  },
}));

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

export async function getHubEventsServerSideProps(ctx: GetServerSidePropsContext) {
  const parentHubUrl = Array.isArray(ctx.query.hubUrl)
    ? ctx.query.hubUrl[0]
    : ctx.query.hubUrl ?? "";
  const subHubSegment = Array.isArray(ctx.query.subHub)
    ? ctx.query.subHub[0]
    : ctx.query.subHub ?? null;
  const { subHub } = extractHubUrlsFromContext(ctx);

  const hubSlug = subHub || parentHubUrl;

  const { featureToggles } = await getFeatureTogglesFromRequest(ctx.req);
  if (!featureToggles.EVENT_CALENDAR_FEATURE) {
    return { notFound: true };
  }

  const locale = ctx.locale ?? "en";
  const token = NextCookies(ctx).auth_token;

  const hubs = await getAllHubs(locale);
  const hubExists = hubs.some((h: any) => h.url_slug === parentHubUrl || h.url_slug === hubSlug);
  if (!hubExists) {
    return { notFound: true };
  }

  const sectorOptions = await getSectorOptions(locale);

  const [hubData, hubThemeData, linkedHubs] = await Promise.all([
    getHubData(hubSlug, locale),
    getHubTheme(parentHubUrl),
    getLinkedHubsData(hubSlug),
  ]);

  const querySearch = (ctx.query.search as string) || "";
  const querySectors = (ctx.query.sectors as string) || "";
  const queryDate = ctx.query.date as string | undefined;

  let startDateStr: string;
  let initialSelectedDay: string | undefined;
  if (queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate)) {
    const [y, m, d] = queryDate.split("-").map(Number);
    startDateStr = toOffsetIso(new Date(y, m - 1, d, 0, 0, 0));
    initialSelectedDay = queryDate;
  } else {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    startDateStr = toOffsetIso(start);
  }

  let initialEvents: any[] = [];
  let initialHasMore = false;
  try {
    const params = new URLSearchParams({
      start_date: startDateStr,
      page: "1",
      page_size: "12",
      hub: hubSlug,
    });
    if (querySearch) params.set("search", querySearch);
    if (querySectors) params.set("sectors", querySectors);
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
      hubUrl: parentHubUrl,
      subHubUrl: subHub || null,
      subHubSegment: subHubSegment || null,
      filterChoices: { sectors: sectorOptions },
      initialEvents,
      initialHasMore,
      initialSearch: querySearch,
      initialSectors: querySectors ? querySectors.split(",") : [],
      initialSelectedDay: initialSelectedDay || null,
      hubData,
      hubThemeData,
      linkedHubs: linkedHubs || [],
    },
  };
}

export const getServerSideProps: GetServerSideProps = getHubEventsServerSideProps;

export default function HubEventsPage({
  hubs,
  hubUrl,
  subHubUrl,
  subHubSegment,
  filterChoices,
  initialEvents,
  initialHasMore,
  initialSearch,
  initialSectors,
  initialSelectedDay,
  hubData,
  hubThemeData,
  linkedHubs,
}: any) {
  const { locale } = useContext(UserContext);
  const router = useRouter();
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const texts = useMemo(() => getTexts({ page: "hub", locale: locale, hubName: hubData?.name }), [
    locale,
    hubData?.name,
  ]);
  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
  const classes = useStyles();

  const isLocationHub = isLocationHubLikeHub(hubData?.hub_type, hubData?.parent_hub);
  const [hubAmbassador, setHubAmbassador] = useState(null);
  const [hubSupporters, setHubSupporters] = useState(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const effectiveHubUrl = subHubUrl || hubUrl;
  const browsePath = subHubSegment
    ? `/hubs/${hubUrl}/${subHubSegment}/browse`
    : `/hubs/${hubUrl}/browse`;

  useEffect(() => {
    (async () => {
      const retrievedHubAmbassador = await getHubAmbassadorData(effectiveHubUrl, locale);
      setHubAmbassador(retrievedHubAmbassador);
      if (isLocationHub) {
        const retrievedHubSupporters = await getHubSupportersData(effectiveHubUrl, locale);
        setHubSupporters(retrievedHubSupporters);
      }
    })();
  }, [effectiveHubUrl, locale]);

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const TYPES_BY_TAB_VALUE = ["projects", "organizations", "members", "events"];
  const EVENTS_TAB_INDEX = TYPES_BY_TAB_VALUE.indexOf("events");
  const type_names = {
    projects: texts.projects,
    organizations: isNarrowScreen ? texts.orgs : texts.organizations,
    members: texts.members,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tab = TYPES_BY_TAB_VALUE[newValue];
    if (tab === "events") return;
    router.push(`${browsePath}#${tab}`);
  };

  const BROWSE_TAB_TYPES = ["projects", "organizations", "members"];
  const handleBrowseTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tab = BROWSE_TAB_TYPES[newValue];
    router.push(`${browsePath}#${tab}`);
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
        TYPES_BY_TAB_VALUE={BROWSE_TAB_TYPES}
        tabValue={-1}
        handleTabChange={handleBrowseTabChange}
        type_names={type_names}
        hubUrl={hubUrl}
        className=""
        allHubs={hubs}
        fromPage="hub"
        subHubSegment={subHubSegment}
      />
      <div ref={contentRef}>
        <Container maxWidth="lg">
          {isNarrowScreen && linkedHubs && linkedHubs.length > 0 && (
            <div className={classes.linkedHubsContainerMobile}>
              {linkedHubs.map((linkedHub: any) => (
                <HubLinkButton key={linkedHub.hubUrl} hub={linkedHub} pageContext="events" />
              ))}
            </div>
          )}
          {!isNarrowScreen && linkedHubs && linkedHubs.length > 0 && (
            <div className={classes.linkedHubsContainer}>
              {linkedHubs.map((linkedHub: any) => (
                <HubLinkButton key={linkedHub.hubUrl} hub={linkedHub} pageContext="events" />
              ))}
            </div>
          )}
          {hubData?.parent_hub && (
            <div className={classes.subHubInfoText}>{texts.you_are_seeing_events_related_to}</div>
          )}
        </Container>
        <EventCalendarContent
          initialEvents={initialEvents}
          initialHasMore={initialHasMore}
          initialSearch={initialSearch}
          initialSectors={initialSectors}
          initialSelectedDay={initialSelectedDay}
          filterChoices={filterChoices}
          hubUrl={effectiveHubUrl}
          subHubName={hubData?.parent_hub ? hubData?.name : undefined}
        />
      </div>
      {isNarrowScreen && (
        <MobileBottomMenu
          tabValue={EVENTS_TAB_INDEX}
          handleTabChange={handleTabChange}
          TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
          hubAmbassador={hubAmbassador}
          hubUrl={hubUrl}
        />
      )}
    </WideLayout>
  );
}
