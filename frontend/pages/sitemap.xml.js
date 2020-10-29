import React from "react";
import globby from "globby"

const NOT_LISTED = ["/_app.js", "/_document.js"]

async function createSitemap() {
  const staticPages = (await globby([
    'pages/*.js'
  ])).map(pageUrl => pageUrl.replace("pages", ""))
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth"
  console.log(staticPages)
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${renderEntries(BASE_URL, staticPages)}
    </urlset>`;
}

const renderEntries = (BASE_URL, entries, priority, changefreq, lastmod) => {
  return entries.map(entry=>
    `<url>
      <loc>${BASE_URL}${entry}/</loc>
      <priority>${priority ? priority : 1}</priority>
      <changefreq>${changefreq ? changefreq : "weekly"}</changefreq>
      ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ``}
    </url>`
  ).join("")
}

export async function getServerSideProps(ctx) {
  console.log(ctx.res)
  const res = ctx.res
  res.setHeader('Content-Type', 'text/xml');
  //const projects = await getProjects(0, token)
  res.write(await createSitemap());
  res.end();

  //Don't forget this line, even if it seems useless.
  //Without it NextJs will be complaining about:
  //TypeError: Cannot convert undefined or null to object
  return { props: {} };
}
const Sitemap = () => (<></>)

export default Sitemap;