import React from "react";
import * as Sentry from "@sentry/nextjs";
import { apiRequest } from "../../../public/lib/apiOperations";
import { buildGoogleCalendarUrl } from "../../../src/utils/calendarHelpers";

export async function getServerSideProps(ctx) {
  const res = ctx.res;
  const slug = ctx.query.projectId;

  let event;
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + encodeURIComponent(slug) + "/",
      locale: ctx.locale,
    });
    event = resp.data;
  } catch (err) {
    Sentry.captureException(err);
    res.statusCode = 404;
    res.end("Not Found");
    return { props: {} };
  }

  if (!event || !event.project_type || event.project_type.type_id !== "event" || event.is_draft) {
    res.statusCode = 404;
    res.end("Not Found");
    return { props: {} };
  }

  const BASE_URL = process.env.BASE_URL || "https://climateconnect.earth";
  const localePrefix = ctx.locale === "en" ? "" : `/${ctx.locale}`;
  const eventUrl = `${BASE_URL}${localePrefix}/projects/${slug}`;
  const googleUrl = buildGoogleCalendarUrl(event, eventUrl);

  res.writeHead(302, { Location: googleUrl });
  res.end();

  return { props: {} };
}

const AddToGoogleCalendar = () => <></>;

export default AddToGoogleCalendar;
