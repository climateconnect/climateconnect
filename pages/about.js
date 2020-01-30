//global imports
import React from "react";
import AboutLayout from "../src/components/layouts/AboutLayout";
import { Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//data
import about_page_info from "../public/data/about_page_info";
import members from "../public/data/members.json";
import links from "../public/data/links.json";
//local components
import AboutHeaderImage from "../src/components/about/AboutHeaderImage";
import InfoBubble from "../src/components/about/InfoBubble";
import InfoLink from "../src/components/about/InfoLink";
import Member from "../src/components/about/Member";

const useStyles = makeStyles(theme => {
  return {
    centeredText: {
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
      verticalAlign: "top",
      padding: 0
    },
    mainFocuses: {
      width: 800,
      margin: "0 auto"
    }
  };
});

export default function Home() {
  const classes = useStyles();
  return (
    <>
      <AboutLayout>
        <AboutHeaderImage />
        <Typography
          component="h1"
          variant="h4"
          color="primary"
          className={`${classes.centeredText} ${classes.textBlock}`}
        >
          We are an international team of volunteers building a non-profit climate action platform
        </Typography>
        <Typography
          component="h2"
          variant="h3"
          color="primary"
          className={`${classes.centeredText} ${classes.textBlock} ${classes.sectionHeadline}`}
        >
          Our goal is to help you fight climate change most effectively
        </Typography>
        <Container maxWidth="lg" className={classes.bubbleGrid}>
          {about_page_info.map((info, index) => (
            <InfoBubble data={info} key={index} />
          ))}
        </Container>
        <Typography
          variant="h3"
          color="primary"
          className={`${classes.centeredText}  ${classes.sectionHeadline}`}
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
          className={`${classes.centeredText}  ${classes.sectionHeadline}`}
        >
          Join our team
        </Typography>
        <Container maxWidth="lg" className={classes.memberGrid}>
          {members.map((member, index) => (
            <Member member={member} key={index} />
          ))}
        </Container>
        <Typography color="primary" variant="h6" className={classes.mainFocuses}>
          Current main focuses:
          <ul>
            <li>Developing the platform (frontend: React, backend: Node, Postgres)</li>
            <li>Finishing up the design</li>
            <li>Collecting user feedback: questionnaires, interviews</li>
            <li>Developing our social media campaigns</li>
            <li>
              Developing a generic method to assess the impact of different types of climate
              projects
            </li>
          </ul>
        </Typography>
        <Typography color="primary" variant="h4" className={classes.root}>
          If you would like to join our volunteer team, please send your application to
          <a href="mailto:contact@climateconnect.earth">contact@climateconnect.earth</a>
        </Typography>
      </AboutLayout>
    </>
  );
}
