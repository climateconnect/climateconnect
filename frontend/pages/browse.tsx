import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Head from "next/head";

export async function getServerSideProps() {
  return { props: {} };
}

export default function BrowseRedirect() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    let target = "/projects";
    if (hash === "organizations") target = "/organisations";
    else if (hash === "members") target = "/members";
    const search = window.location.search;
    router.replace(`${target}${search}`);
  }, [router]);

  return (
    <>
      <Head>
        <meta httpEquiv="refresh" content="0;url=/projects" />
      </Head>
      <p>Redirecting...</p>
    </>
  );
}
