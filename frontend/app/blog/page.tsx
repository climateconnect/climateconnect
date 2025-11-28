import React from "react";
import { headers } from "next/headers";
import { retrievePage } from "../../src/utils/webflow";
import BlogClient from "./BlogClient";

export default async function Blog() {
  const headersList = headers();
  const locale = headersList.get("x-next-intl-locale") || "en";

  const WEBFLOW_URLS = {
    de: "https://climateconnect.webflow.io/blog-de",
    en: "https://climateconnect.webflow.io/blog-en",
  };

  const { bodyContent, headContent } = await retrievePage(WEBFLOW_URLS[locale]);

  return <BlogClient bodyContent={bodyContent} headContent={headContent} />;
}
