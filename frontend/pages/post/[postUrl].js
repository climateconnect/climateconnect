//This is a page where just part of the content comes from the codebase.
//The other part comes from webflow pages that our design team built
//The skeleton for this page was built using this tutorial: https://dev.to/kennedyrose/integrating-webflow-and-next-js-39kk

import { makeStyles } from "@material-ui/core";
import React from "react";
import WebflowPage from "../../src/components/webflow/WebflowPage";
import { retrievePage } from "../../src/utils/webflow";

const useStyles = makeStyles({
  root: {
    position: "relative",
  },
});

export default function Blog({ bodyContent, headContent }) {
  const classes = useStyles();
  return (
    <WebflowPage
      bodyContent={bodyContent}
      headContent={headContent}
      pageKey="post"
      className={classes.root}
    />
  );
}

export async function getServerSideProps(ctx) {
  const url = `https://climateconnect.webflow.io/post/${ctx.query.postUrl}`;
  const props = await retrievePage(url);
  return {
    props: props,
  };
}
