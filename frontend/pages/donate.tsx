//This is a page where just part of the content comes from the codebase.
//The other part comes from webflow pages that our design team built
//The skeleton for this page was built using this tutorial: https://dev.to/kennedyrose/integrating-webflow-and-next-js-39kk

import React from "react";
import WebflowPage from "../src/components/webflow/WebflowPage";
import { retrievePage } from "../src/utils/webflow";

export default function Donate({ bodyContent, headContent }) {
  // Add scriptUrls here.
  const scriptUrls = [
    "js/webflow.js",
    "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=615d9a37fbb2467a53e09161"
  ];
  return <WebflowPage bodyContent={bodyContent} headContent={headContent} pageKey="donate" scriptUrls={scriptUrls} />;
}

export async function getServerSideProps(ctx) {
  const WEBFLOW_URLS = {
    de: "https://climateconnect.webflow.io/spenden",
    en: "https://climateconnect.webflow.io/donate",
  };
  const props = await retrievePage(WEBFLOW_URLS[ctx.locale]);
  return {
    props: props,
  };
}
