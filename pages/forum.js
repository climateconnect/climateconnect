import React from "react";
import Head from "next/head";
import Layout from "../src/components/layout";

const Home = () => (
  <div>
    <Head>
      <title>Forum</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Layout />
  </div>
);

export default Home;
