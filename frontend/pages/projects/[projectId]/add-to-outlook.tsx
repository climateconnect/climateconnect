import React from "react";
import { apiRequest } from "../../../public/lib/apiOperations";

function toOutlookDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString();
}

function buildOutlookUrl(event, eventUrl) {
  const params = new URLSearchParams({
    action: "compose",
    subject: event.name || "",
    startdt: toOutlookDate(event.start_date),
    enddt: toOutlookDate(event.end_date),
    body: event.description ? `${event.description}\n\n${eventUrl}` : eventUrl,
    location: event.is_online ? "Online" : event.location || "",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
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
  const outlookUrl = buildOutlookUrl(event, eventUrl);

  res.writeHead(302, { Location: outlookUrl });
  res.end();

  return { props: {} };
}

const AddToOutlook = () => <></>;

export default AddToOutlook;
