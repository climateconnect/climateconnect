import React from "react";
import Head from "next/head";
import Layout from "../src/components/layouts/aboutLayout";
import AboutHeaderImage from "../src/components/about/AboutHeaderImage";
import { Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import info from "../public/data/info.json";
import members from "../public/data/members.json";
import links from "../public/data/links.json";
import InfoBubble from "../src/components/about/InfoBubble";
import InfoLink from "../src/components/about/InfoLink";
import Member from "../src/components/about/Member";

const backgroundImage = `url("images/about_background.png")`;
//TODO: adapt textBlocks to different screen sizes
const useStyles = makeStyles(theme => {
  return {
    root: {
      textAlign: "center"
    },
    textBlock: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1)
    },
    sectionHeadline: {
      marginBottom: theme.spacing(6)
    },
    bubbleGrid: {
      padding: 0,
      maxWidth: 1390,
      margin: "0 auto",
      textAlign: "center"
    },
    memberGrid: {
      maxWidth: 1390,
      margin: "0 auto",
      textAlign: "center",
      verticalAlign: "top"
    }
  };
});

export default function Home() {
  const classes = useStyles();
  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.11.2/css/all.css"
          integrity="sha384-KA6wR/X5RY4zFAHpv/CnoG2UW1uogYfdnP67Uv7eULvTveboZJg0qUpmJZb5VqzN"
          crossOrigin="anonymous"
        />
      </Head>
      <Layout>
        <AboutHeaderImage image={{ url: backgroundImage }} />
        <Typography variant="h4" color="primary" className={`${classes.root} ${classes.textBlock}`}>
          We are an international team of volunteers building a non-profit climate action
          webplatform
        </Typography>
        <Typography
          variant="h3"
          color="primary"
          className={`${classes.root} ${classes.textBlock} ${classes.sectionHeadline}`}
        >
          Our goal is to help you fight climate change most effectively
        </Typography>
        <Container maxWidth="lg" className={classes.bubbleGrid}>
          {info.map((info, index) => (
            <InfoBubble data={info} key={index} />
          ))}
        </Container>
        <Typography
          variant="h3"
          color="primary"
          className={`${classes.root}  ${classes.sectionHeadline}`}
        >
          Find out more
        </Typography>
        <Container maxWidth="lg">
          {links.map((link, index) => (
            <InfoLink data={link} key={index} />
          ))}
        </Container>
        <Typography
          variant="h3"
          color="primary"
          className={`${classes.root}  ${classes.sectionHeadline}`}
        >
          Join our team
        </Typography>
        <Container maxWidth="lg" className={classes.memberGrid}>
          {members.map((member, index) => (
            <Member member={member} key={index} />
          ))}
        </Container>
        <Typography color="primary" variant="h4" className={classes.root}>
          Interested in joining our volunteer team?
        </Typography>
        <Typography color="primary" variant="h6" className={classes.root}>
          Current main focuses:
          <div>
            -Developing a generic method to assess the impact of different types of climate projects
          </div>
          <div>-Developing in the platform (frontend: react, backend: node, postgres)</div>
          <div>-Collecting user feedback: questionaires, interviews</div>
          <div>-Developing our Social Media campaigns</div>
          <div>-Finishing up the design</div>
        </Typography>
        <Typography color="primary" variant="h4" className={classes.root}>
          If you would like to join our volunteer team, please send your application to
          contact@climateconnect.earth
        </Typography>
      </Layout>
    </div>
  );
}
