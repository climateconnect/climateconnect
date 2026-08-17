import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Head from "next/head";

export async function getServerSideProps() {
  return { props: {} };
}

export default function HubBrowseRedirect() {
  const router = useRouter();
  const { hubUrl } = router.query;

  useEffect(() => {
    if (!hubUrl) return;
    const hash = window.location.hash.replace("#", "");
    let target = `/hubs/${hubUrl}/projects`;
    if (hash === "organizations") target = `/hubs/${hubUrl}/organisations`;
    else if (hash === "members") target = `/hubs/${hubUrl}/members`;
    const search = window.location.search;
    router.replace(`${target}${search}`);
  }, [router, hubUrl]);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`0;url=/hubs/${hubUrl || ""}/projects`} />
      </Head>
      <p>Redirecting...</p>
    </>
  );
}
