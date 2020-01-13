import React from "react";
import Head from "next/head";
import Layout from "../src/components/layout";
import AboutLayout from "../src/layouts/AboutLayout";
const Home = () => (
  <div>
    <Head>
      <title>About</title>
      <link rel="icon" href="icons/favicon.ico" />
      <link
        rel="stylesheet"
        href="https://use.fontawesome.com/releases/v5.11.2/css/all.css"
        integrity="sha384-KA6wR/X5RY4zFAHpv/CnoG2UW1uogYfdnP67Uv7eULvTveboZJg0qUpmJZb5VqzN"
        crossOrigin="anonymous"
      />
    </Head>

    <Layout>
      <AboutLayout />
    </Layout>
  </div>
);

export default Home;
