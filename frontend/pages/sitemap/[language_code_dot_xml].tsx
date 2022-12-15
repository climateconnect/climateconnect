import globby from "globby";
import React from "react";
import { apiRequest } from "../../public/lib/apiOperations";
import { getAllHubs } from "../../public/lib/hubOperations";

const NOT_LISTED = [
  "/_app",
  "/_document",
  "/inbox",
  "/accountcreated",
  "/editprofile",
  "/inbox",
  "/createorganization",
  "/resend_verification_email",
  "/resetpassword",
  "/settings",
  "/share",
  "/sitemap.xml",
  "/stream",
];

const STATIC_PAGE_PROPS = {
  "/": {
    priority: 1,
    changefreq: "hourly",
  },
  "/about": {
    priority: 0.9,
    changefreq: "daily",
  },
  "/browse": {
    priority: 1,
    changefreq: "hourly",
  },
  "/donate": {
    priority: 0.9,
    changefreq: "daily",
  },
  "/faq": {
    priority: 0.9,
    changefreq: "daily",
  },
  "/imprint": {
    priority: 0.5,
    changefreq: "monthly",
  },
  "/privacy": {
    priority: 0.5,
    changefreq: "weekly",
  },
  "/signin": {
    priority: 0.8,
    changefreq: "weekly",
  },
  "/signup": {
    priority: 1,
    changefreq: "weekly",
  },
  "/terms": {
    priority: 0.5,
    changefreq: "weekly",
  },
  "/zoom": {
    priority: 0.5,
    changefreq: "monthly",
  },
};

async function createSitemap(
  projectEntries,
  organizationEntries,
  memberEntries,
  hubEntries,
  language_code
) {
  let staticPages = (await globby(["pages/*.tsx"]))
    .map((pageUrl) => pageUrl.replace("pages", "").replace(".tsx", ""))
    .filter((pageUrl) => !NOT_LISTED.includes(pageUrl));
  if (language_code) {
    staticPages = staticPages.map((pageUrl) => {
      return `/${language_code}${pageUrl}`;
    });
  }
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${getStaticPageEntries(staticPages)
      .map((p) => renderEntry(BASE_URL, p.url, p.priority, p.changefreq, p.lastmod))
      .join("")}
    ${projectEntries
      .map((p) => renderEntry(BASE_URL, p.url_slug, 1, "daily", p.updated_at))
      .join("")}
    ${organizationEntries
      .map((o) => renderEntry(BASE_URL, o.url_slug, 0.9, "daily", o.updated_at))
      .join("")}
    ${memberEntries
      .map((m) => renderEntry(BASE_URL, m.url_slug, 0.8, "daily", m.updated_at))
      .join("")}
    ${hubEntries.map((m) => renderEntry(BASE_URL, m.url_slug, 1, "daily", m.updated_at)).join("")}
    </urlset>`;
}

const getStaticPageEntries = (staticPages) => {
  return staticPages.map((p) => {
    const entry = {
      url: p === "/index" ? "/" : p,
    };
    if (STATIC_PAGE_PROPS[p]) return { ...entry, ...STATIC_PAGE_PROPS[p] };
    return entry;
  });
};

const renderEntry = (BASE_URL, url, priority, changefreq, lastmod) => {
  return `<url>
      <loc>${BASE_URL}${url}</loc>
      <priority>${priority ? priority : 1}</priority>
      <changefreq>${changefreq ? changefreq : "daily"}</changefreq>
      ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ``}
    </url>`;
};

export async function getServerSideProps(ctx) {
  //We need the ".xml" at the end of the file to display an xml file in the browser.
  //But for dynamic pages in nextjs the filename always has to be [variable].js.
  //Therefore our variable "language_code" mus include a ".xml" at the end and therefore the variable is called language_code_dot_xml
  const language_code_parsed = ctx.query.language_code_dot_xml.replace(".xml", "");
  const language_code = language_code_parsed === "en" ? "" : language_code_parsed;
  const [projectEntries, organizationEntries, memberEntries, hubEntries] = await Promise.all([
    getEntries("projects", ctx.locale, language_code),
    getEntries("organizations", ctx.locale, language_code),
    getEntries("members", ctx.locale, language_code),
    getEntries("hubs", ctx.locale, language_code),
  ]);
  const res = ctx.res;
  res.setHeader("Content-Type", "text/xml");
  //const projects = await getProjects(0, token)
  res.write(
    await createSitemap(
      projectEntries,
      organizationEntries,
      memberEntries,
      hubEntries,
      language_code
    )
  );
  res.end();

  //Don't forget this line, even if it seems useless.
  //Without it NextJs will be complaining about:
  //TypeError: Cannot convert undefined or null to object
  return { props: {} };
}

const getEntries = async (entryTypePlural, locale, language_code_for_url) => {
  if (entryTypePlural === "hubs") {
    const hubs = await getAllHubs(locale);
    return parseEntries(entryTypePlural, hubs, language_code_for_url);
  } else {
    try {
      const resp = await apiRequest({
        method: "get",
        url: "/api/sitemap/" + entryTypePlural + "/?page_size=1000",
        locale: locale,
      });
      if (resp.data.length === 0) return null;
      else {
        return parseEntries(entryTypePlural, resp.data.results, language_code_for_url);
      }
    } catch (err) {
      console.log(err);
    }
  }
};

//language code for url is for providing sitemaps in different languages.
const parseEntries = (entryTypePlural, entries, language_code_for_url) => {
  const firstLevelPath = entryTypePlural === "members" ? "profiles" : entryTypePlural;
  return entries.map((e) => {
    return {
      url_slug: `/${
        language_code_for_url ? `${language_code_for_url.replace(".xml", "")}/` : ""
      }${firstLevelPath}/${encodeURIComponent(e.url_slug)}`,
      updated_at: e.updated_at,
    };
  });
};

const Sitemap = () => <></>;

export default Sitemap;
