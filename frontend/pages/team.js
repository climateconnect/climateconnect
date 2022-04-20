//This is a page where just part of the content comes from the codebase.
//The other part comes from webflow pages that our design team built
//The skeleton for this page was built using this tutorial: https://dev.to/kennedyrose/integrating-webflow-and-next-js-39kk

import React from "react";
import WebflowPage from "../src/components/webflow/WebflowPage";
import { retrievePage } from "../src/utils/webflow";

//Static page caught from Webflow where we show information about our team
export default function Team({ bodyContent, headContent }) {
  return <WebflowPage bodyContent={bodyContent} headContent={headContent} pageKey="team" />;
}

export async function getServerSideProps(ctx) {
  const WEBFLOW_URLS = {
    de: "https://climateconnect.webflow.io/team-de",
    en: "https://climateconnect.webflow.io/team-en",
  };
  const props = await retrievePage(WEBFLOW_URLS[ctx.locale]);
  return {
    props: props,
  };
}
