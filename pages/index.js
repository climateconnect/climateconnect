import React from "react";
import Head from "next/head";
import Layout from "./../src/components/layout";
import IndexLayout from "../src/layouts/IndexLayout";
const Home = () => (
  <div>
    <Head>
      <title>Home</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Layout>
      <IndexLayout></IndexLayout>
    </Layout>
  </div>
);

export default Home;
