import React from "react";
import globby from "globby";
import axios from "axios";

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
  "/stream"
];

const STATIC_PAGE_PROPS = {
  "/": {
    priority: 1,
    changefreq: "hourly"
  },
  "/about": {
    priority: 0.9,
    changefreq: "daily"
  },
  "/browse": {
    priority: 1,
    changefreq: "hourly"
  },
  "/donate": {
    priority: 0.9,
    changefreq: "daily"
  },
  "/faq": {
    priority: 0.9,
    changefreq: "daily"
  },
  "/imprint": {
    priority: 0.5,
    changefreq: "monthly"
  },
  "/privacy": {
    priority: 0.5,
    changefreq: "weekly"
  },
  "/signin": {
    priority: 0.8,
    changefreq: "weekly"
  },
  "/signup": {
    priority: 1,
    changefreq: "weekly"
  },
  "/terms": {
    priority: 0.5,
    changefreq: "weekly"
  },
  "/zoom": {
    priority: 0.5,
    changefreq: "monthly"
  }
};

async function createSitemap(projectEntries, organizationEntries, memberEntries) {
  const staticPages = (await globby(["pages/*.js"]))
    .map(pageUrl => pageUrl.replace("pages", "").replace(".js", ""))
    .filter(pageUrl => !NOT_LISTED.includes(pageUrl));
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${getStaticPageEntries(staticPages)
      .map(p => renderEntry(BASE_URL, p.url, p.priority, p.changefreq, p.lastmod))
      .join("")}
    ${projectEntries.map(p => renderEntry(BASE_URL, p.url_slug, 1, "daily", p.updated_at)).join("")}
    ${organizationEntries
      .map(o => renderEntry(BASE_URL, o.url_slug, 0.9, "daily", o.updated_at))
      .join("")}
    ${memberEntries
      .map(m => renderEntry(BASE_URL, m.url_slug, 0.8, "daily", m.updated_at))
      .join("")}
    </urlset>`;
}

const getStaticPageEntries = staticPages => {
  return staticPages.map(p => {
    const entry = {
      url: p === "/index" ? "/" : p
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
  const [projectEntries, organizationEntries, memberEntries] = await Promise.all([
    getEntries("projects"),
    getEntries("organizations"),
    getEntries("members")
  ]);
  const res = ctx.res;
  res.setHeader("Content-Type", "text/xml");
  //const projects = await getProjects(0, token)
  res.write(await createSitemap(projectEntries, organizationEntries, memberEntries));
  res.end();

  //Don't forget this line, even if it seems useless.
  //Without it NextJs will be complaining about:
  //TypeError: Cannot convert undefined or null to object
  return { props: {} };
}

const getEntries = async entryTypePlural => {
  try {
    const resp = await axios.get(process.env.API_URL + "/api/sitemap/" + entryTypePlural + "/");
    if (resp.data.length === 0) return null;
    else {
      return parseEntries(entryTypePlural, resp.data.results);
    }
  } catch (err) {
    console.log(err);
  }
};

const parseEntries = (entryTypePlural, entries) => {
  const firstLevelPath = entryTypePlural === "members" ? "profiles" : entryTypePlural;
  return entries.map(e => {
    return {
      url_slug: "/" + firstLevelPath + "/" + encodeURIComponent(e.url_slug),
      updated_at: e.updated_at
    };
  });
};

const Sitemap = () => <></>;

export default Sitemap;
