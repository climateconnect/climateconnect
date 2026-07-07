import { GetServerSideProps } from "next";
import NextCookies from "next-cookies";
import React, { useContext, useMemo } from "react";
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
import EventCalendarContent from "../../../src/components/eventCalendar/EventCalendarContent";

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

const getDefaultWindowParams = (hubUrl: string): Record<string, string> => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 90, 23, 59, 59);
  return {
    start_date: toOffsetIso(start),
    end_date: toOffsetIso(end),
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

  let initialEvents: any[] = [];
  try {
    const params = new URLSearchParams(getDefaultWindowParams(hubUrl));
    const { data } = await apiRequest({
      method: "get",
      url: `/api/events/?${params.toString()}`,
      token,
      locale: locale as any,
    });
    initialEvents = Array.isArray(data) ? data : [];
  } catch (e) {
    // Initial fetch failed; the client will retry when filters change.
  }

  return {
    props: {
      hubs,
      hubUrl,
      filterChoices: { sectors: sectorOptions },
      initialEvents,
    },
  };
};

export default function HubEventsPage({ hubs, hubUrl, filterChoices, initialEvents }: any) {
  const { locale } = useContext(UserContext);
  const router = useRouter();
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const texts = useMemo(() => getTexts({ page: "hub", locale: locale }), [locale]);

  const TYPES_BY_TAB_VALUE = ["projects", "organizations", "members"];
  const type_names = {
    projects: texts.projects,
    organizations: isNarrowScreen ? texts.orgs : texts.organizations,
    members: texts.members,
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const tab = TYPES_BY_TAB_VALUE[newValue];
    router.push(`/hubs/${hubUrl}#${tab}`);
  };

  return (
    <WideLayout>
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
      <EventCalendarContent
        initialEvents={initialEvents}
        filterChoices={filterChoices}
        hubUrl={hubUrl}
      />
    </WideLayout>
  );
}
