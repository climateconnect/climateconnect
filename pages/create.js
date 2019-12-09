import React from "react";
import Head from "next/head";
import Layout from "../src/components/layout";
import CreateProjectLayout from "../src/layouts/CreateProjectLayout";

const Home = () => (
  <div>
    <Head>
      <title>Create a Project</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Layout>
      <CreateProjectLayout></CreateProjectLayout>
    </Layout>
  </div>
);

export default Home;
