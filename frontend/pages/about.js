//global imports
import React from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { Typography, Container, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//data
import about_page_info from "../public/data/about_page_info";
import members from "../public/data/members.json";
import links from "../public/data/links.js";
import quotes_with_images from "../public/data/quotes_with_images.js";
//local components
import AboutHeaderImage from "../src/components/about/AboutHeaderImage";
import InfoBubble from "../src/components/about/InfoBubble";
import InfoLink from "../src/components/about/InfoLink";
import MemberCarousel from "../src/components/about/MemberCarousel";
import QuoteSlideShow from "../src/components/about/QuoteSlideShow";
//icons
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles(theme => {
  return {
    centeredText: {
      textAlign: "center"
    },
    textBlock: {
      margin: "0 auto",
      display: "block", 
      maxWidth: 1200,         
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(1),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    },
    sectionHeadline: {
      margin: "0 auto",
      display: "block",
      marginBottom: theme.spacing(6),
      marginTop: theme.spacing(8),
      fontWeight: "bold"
    },
    bubbleGrid: {
      padding: 0,
      width: "100%",
      maxWidth: 1390,
      margin: "0 auto",
      display: "flex",
      justifyContent: "space-between",
      flexFlow: "wrap"
    },
    memberGrid: {
      width: "100%",
      maxWidth: 1390,
      margin: "0 auto"
    },
    mainFocuses: {
      width: 800,
      margin: "0 auto"
    },
    quoteSlideShow: {
      marginTop: theme.spacing(7)
    },
    linksContainer: {
      display: "flex",
      justifyContent: "space-around",
      flexFlow: "wrap",
      maxWidth: 1000
    }
  };
});

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default function About() {
  const classes = useStyles();
  const [showAllMembers, setShowAllMembers] = React.useState(false);
  const handleToggleAllMembersClick = () => {
    setShowAllMembers(!showAllMembers)
  }
  return (
    <>
      <WideLayout title="About Climate Connect">
        <AboutHeaderImage />
        <Typography
          component="h1"
          variant="h4"
          color="secondary"
          className={`${classes.centeredText} ${classes.textBlock}`}
        >
          Climate Connect is a non-profit climate action platform that is currently in development. Our goal is to connect climate protectors worldwide by giving them a platform to share their projects or ideas to receive feedback, find specific help on a project and get inspired for climate actions.
        </Typography>
        <Typography
          component="h2"
          variant="h3"
          color="primary"
          className={`${classes.centeredText} ${classes.textBlock} ${classes.sectionHeadline}`}
        >
          Our Vision
        </Typography>
        <Container maxWidth="lg" className={classes.bubbleGrid}>
          {about_page_info.map((info, index) => (
            <InfoBubble data={info} key={index} />
          ))}
        </Container>
        <QuoteSlideShow image={quotes_with_images[0].image_path} className={classes.quoteSlideShow}/>
        <Typography
          component="h2"
          variant="h3"
          color="primary"
          className={`${classes.centeredText}  ${classes.sectionHeadline}`}
        >
          Find out more
        </Typography>
        <Container maxWidth="lg" className={classes.linksContainer}>
          {links.map((link, index) => (
            <InfoLink data={link} key={index} />
          ))}
        </Container>
        <QuoteSlideShow image={quotes_with_images[1].image_path} className={classes.quoteSlideShow}/>
        <Typography
          component="h2"
          variant="h3"
          color="primary"
          className={`${classes.centeredText}  ${classes.sectionHeadline}`}
        >
          Our Team
        </Typography>
        <MemberCarousel members={shuffle(members)} className={classes.memberGrid} />
        <Button className={classes.expandButton} onClick={handleToggleAllMembersClick}>
          {showAllMembers ? (
            <div>
              <ExpandLessIcon className={classes.icon} /> Show less
            </div>
          ) : (
            <div>
              <ExpandMoreIcon className={classes.icon} /> Show more
            </div>
          )}
        </Button>
        <QuoteSlideShow image={quotes_with_images[2].image_path} className={classes.quoteSlideShow}/>
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
        <Typography color="primary" variant="h5" className={classes.centeredText}>
          If you would like to join our volunteer team, please send your application to{" "}
          <a href="mailto:contact@climateconnect.earth">contact@climateconnect.earth</a>
        </Typography>
      </WideLayout>
    </>
  );
}
