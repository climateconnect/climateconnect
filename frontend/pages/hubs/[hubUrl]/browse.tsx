import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import Head from "next/head";

export async function getServerSideProps() {
  return { props: {} };
}

export default function HubBrowseRedirect() {
  const router = useRouter();
  const { hubUrl } = router.query;
  const redirectedRef = useRef(false);
  const localePrefix = router.locale && router.locale !== "en" ? `/${router.locale}` : "";

  useEffect(() => {
    if (redirectedRef.current || !hubUrl) return;
    const hash = window.location.hash.replace("#", "");
    let target = `/hubs/${hubUrl}/projects`;
    if (hash === "organizations") target = `/hubs/${hubUrl}/organisations`;
    else if (hash === "members") target = `/hubs/${hubUrl}/members`;
    const search = window.location.search;
    redirectedRef.current = true;
    router.replace(`${target}${search}`);
  }, [router, hubUrl]);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`1;url=${localePrefix}/hubs/${hubUrl || ""}/projects`} />
      </Head>
      <p>Redirecting...</p>
    </>
  );
}
