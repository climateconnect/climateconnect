//This is a page where just part of the content comes from the codebase.
//The other part comes from webflow pages that our design team built
//The skeleton for this page was built using this tutorial: https://dev.to/kennedyrose/integrating-webflow-and-next-js-39kk

import parseHtml from 'html-react-parser'
import Head from 'next/head'
import React from "react"
import WideLayout from '../src/components/layouts/WideLayout'
import { retrievePage } from "../src/utils/webflow"

export default function Press({bodyContent, headContent}) {

  return (
    <>
      <Head>
        {parseHtml(headContent)}
      </Head>
      <WideLayout title="Press" hideHeadline isStaticPage noSpaceBottom>
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      </WideLayout>
    </>
  )
}

export async function getStaticProps(ctx) {
  const WEBFLOW_URLS = {
    de: "https://climateconnect.webflow.io/presse",
    en: "https://climateconnect.webflow.io/press-en"
  }
  const props = await retrievePage(WEBFLOW_URLS[ctx.locale])
  return {
    props: props,
  }
}