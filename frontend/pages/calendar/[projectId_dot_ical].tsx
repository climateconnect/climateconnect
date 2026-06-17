import React from "react";
import icalGenerator from "ical-generator";
import { apiRequest } from "../../public/lib/apiOperations";

function escapeIcalText(text) {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

async function fetchEvent(slug, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + encodeURIComponent(slug) + "/",
      locale: locale,
    });
    console.log("Fetched event data for iCal export:", resp.data);
    return resp.data;
  } catch (err) {
    console.log("Error fetching event data for iCal export:", err);
    return null;
  }
}

export async function getServerSideProps(ctx) {
  const res = ctx.res;
  const slugParam = ctx.query.projectId_dot_ical;
  const slug = slugParam.replace(/\.ical$/, "");

  const event = await fetchEvent(slug, ctx.locale);

  if (!event || !event.project_type || event.project_type.type_id !== "event" || event.is_draft) {
    res.statusCode = 404;
    res.end("Not Found");
    console.log("Event not found or not an event or is draft");
    return { props: {} };
  }

  const BASE_URL = process.env.BASE_URL || "https://climateconnect.earth";
  const localePrefix = ctx.locale === "en" ? "" : `/${ctx.locale}`;
  const eventUrl = `${BASE_URL}${localePrefix}/projects/${slug}`;

  const cal = icalGenerator({
    name: "Climate Connect",
    prodId: { company: "Climate Connect", product: "Climate Connect" },
  });

  const eventData = {
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    summary: event.name,
    url: eventUrl,
    description: event.description
      ? escapeIcalText(event.description) + "\\n\\n" + eventUrl
      : eventUrl,
    location: event.is_online ? "Online" : event.location || "",
  };

  cal.createEvent(eventData);

  const icalString = cal.toString();

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${slug}.ics"`);
  res.write(icalString);
  res.end();

  return { props: {} };
}

const ICalPage = () => <></>;

export default ICalPage;
