//This is a page where just part of the content comes from the codebase.
//The other part comes from webflow pages that our design team built
//The skeleton for this page was built using this tutorial: https://dev.to/kennedyrose/integrating-webflow-and-next-js-39kk

import React from "react";
import WebflowPage from "../src/components/webflow/WebflowPage";
import { retrievePage } from "../src/utils/webflow";

//Explainer page for what a ClimateHub is and how we plan to spread them throughout Germany
export default function ClimateHubs({ bodyContent, headContent }) {
  return (
    <WebflowPage
      bodyContent={bodyContent}
      headContent={headContent}
      pageKey="climatehubs"
      hideFooter
    />
  );
}

export async function getServerSideProps(ctx) {
  const WEBFLOW_URLS = {
    de: "https://climateconnect.webflow.io",
    en: "https://climateconnect.webflow.io",
  };
  const props = await retrievePage(WEBFLOW_URLS[ctx.locale]);
  return {
    props: props,
  };
}
