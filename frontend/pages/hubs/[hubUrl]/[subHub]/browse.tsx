import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import Head from "next/head";

export async function getServerSideProps() {
  return { props: {} };
}

export default function SubHubBrowseRedirect() {
  const router = useRouter();
  const { hubUrl, subHub } = router.query;
  const redirectedRef = useRef(false);
  const localePrefix = router.locale && router.locale !== "en" ? `/${router.locale}` : "";

  useEffect(() => {
    if (redirectedRef.current || !hubUrl || !subHub) return;
    const hash = window.location.hash.replace("#", "");
    let target = `/hubs/${hubUrl}/${subHub}/projects`;
    if (hash === "organizations") target = `/hubs/${hubUrl}/${subHub}/organisations`;
    else if (hash === "members") target = `/hubs/${hubUrl}/${subHub}/members`;
    const search = window.location.search;
    redirectedRef.current = true;
    router.replace(`${target}${search}`);
  }, [router, hubUrl, subHub]);

  return (
    <>
      <Head>
        <meta
          httpEquiv="refresh"
          content={`1;url=${localePrefix}/hubs/${hubUrl || ""}/${subHub || ""}/projects`}
        />
      </Head>
      <p>Redirecting...</p>
    </>
  );
}
