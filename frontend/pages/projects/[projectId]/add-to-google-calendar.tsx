import React from "react";
import * as Sentry from "@sentry/nextjs";
import { apiRequest } from "../../../public/lib/apiOperations";

function toGoogleCalendarDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return (
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "Z"
  );
}

function buildGoogleCalendarUrl(event, eventUrl) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name || "",
    dates: `${toGoogleCalendarDate(event.start_date)}/${toGoogleCalendarDate(event.end_date)}`,
    details: event.description ? `${event.description}\n\n${eventUrl}` : eventUrl,
    location: event.is_online ? "Online" : event.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

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
