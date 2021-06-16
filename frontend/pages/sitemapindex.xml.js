import React from "react";

export async function getServerSideProps(ctx) {
  const res = ctx.res;
  const BASE_URL = process.env.BASE_URL ? process.env.BASE_URL : "https://climateconnect.earth";
  res.setHeader("Content-Type", "text/xml");
  //const projects = await getProjects(0, token)
  res.write(`<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
            <loc>${BASE_URL}/sitemap/en.xml</loc>
            <loc>${BASE_URL}/sitemap/de.xml</loc>
        </sitemap>
    </sitemapindex>`);
  res.end();

  //Don't forget this line, even if it seems useless.
  //Without it NextJs will be complaining about:
  //TypeError: Cannot convert undefined or null to object
  return { props: {} };
}

const SitemapIndex = () => <></>;

export default SitemapIndex;
