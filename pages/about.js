import React from "react";
import Head from "next/head";
import Layout from "../src/components/layout";
import AboutLayout from "../src/layouts/AboutLayout";
const Home = () => (
  <div>
    <Head>
      <title>Browse</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Layout>
      <AboutLayout></AboutLayout>
    </Layout>
  </div>
);

export default Home;