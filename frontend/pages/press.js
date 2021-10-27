//This is a page where just part of the content comes from the codebase.
//The other part comes from webflow pages that our design team built
//The skeleton for this page was built using this tutorial: https://dev.to/kennedyrose/integrating-webflow-and-next-js-39kk

import parseHtml from 'html-react-parser'
import Head from 'next/head'
import React from "react"
import WideLayout from '../src/components/layouts/WideLayout'

export default function Press({bodyContent, headContent}) {
  return (
    <>
      <Head>
          {parseHtml(headContent)}
        </Head>
      <WideLayout title="Press" hideHeadline isStaticPage noSpacingBottom>
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      </WideLayout>
    </>
  )
}

export async function getStaticProps(ctx) {
  // Import modules in here that aren't needed in the component
  const cheerio = await import(`cheerio`)
  const axios = (await import(`axios`)).default
  const WEBFLOW_URL = "https://climateconnect.webflow.io/presse"

  // Fetch HTML
  const res = await axios(WEBFLOW_URL).catch((err) => {
    console.error(err)
  })
  const html = res.data

  // Parse HTML with Cheerio
  const $ = cheerio.load(html)
  const bodyContent = $(`body`).html()
const headContent = $(`head`).html()

  // Send HTML to component via props
  return {
    props: {
      bodyContent,
      headContent
    },
  }
}