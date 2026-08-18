import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import Head from "next/head";

export async function getServerSideProps() {
  return { props: {} };
}

export default function BrowseRedirect() {
  const router = useRouter();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    const localePrefix = router.locale && router.locale !== "en" ? `/${router.locale}` : "";
    const hash = window.location.hash.replace("#", "");
    let target = "/projects";
    if (hash === "organizations") target = "/organisations";
    else if (hash === "members") target = "/members";
    const search = window.location.search;
    redirectedRef.current = true;
    router.replace(`${localePrefix}${target}${search}`);
  }, [router]);

  const localePrefix = router.locale && router.locale !== "en" ? `/${router.locale}` : "";

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content={`1;url=${localePrefix}/projects`} />
      </Head>
      <p>Redirecting...</p>
    </>
  );
}
