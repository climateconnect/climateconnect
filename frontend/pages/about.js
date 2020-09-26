//global imports
import React from "react";
import WideLayout from "../src/components/layouts/WideLayout";
import { Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//data
import about_page_info from "../public/data/about_page_info";
import members from "../public/data/members.json";
import links from "../public/data/links.js";
import quotes_with_images from "../public/data/quotes_with_images.js";
import open_positions from "../public/data/open_positions";
//local components
import HeaderImage from "../src/components/staticpages/HeaderImage";
import InfoBubble from "../src/components/about/InfoBubble";
import InfoLink from "../src/components/about/InfoLink";
import MemberCarousel from "../src/components/about/MemberCarousel";
import QuoteSlideShow from "../src/components/about/QuoteSlideShow";

const useStyles = makeStyles(theme => {
  return {
    headerImageContainer: {
      marginBottom: theme.spacing(5)
    },
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
      justifyContent: "space-around",
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
    },
    openPositionsHeadline: {
      display: "block",
      width: "100%",
      marginBottom: theme.spacing(4),
      fontWeight: "bold",
      paddingLeft: theme.spacing(4)
    },
    bold: {
      fontWeight: "bold"
    }
  };
});

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

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
  return (
    <>
      <WideLayout title="About Climate Connect" isStaticPage>
        <HeaderImage className={classes.headerImageContainer} src={"images/about_background.jpg"} />
        <Typography
          component="h1"
          variant="h4"
          color="secondary"
          className={`${classes.centeredText} ${classes.textBlock}`}
        >
          <Typography component="h2" variant="h4" className={classes.bold}>
            Climate Connect is a non-profit climate action platform.
          </Typography>
          <div>
            Our goal is to connect climate protectors worldwide by giving them a platform to share
            their projects or ideas to receive feedback, find specific help on a project and get
            inspired for climate actions.
          </div>
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
        <QuoteSlideShow
          image={quotes_with_images[0].image_path}
          className={classes.quoteSlideShow}
        />
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
        <QuoteSlideShow
          image={quotes_with_images[1].image_path}
          className={classes.quoteSlideShow}
        />
        <Container maxWidth="lg">
          <Typography
            component="h2"
            variant="h3"
            color="primary"
            className={`${classes.centeredText}  ${classes.sectionHeadline}`}
          >
            Our Team
          </Typography>
          <MemberCarousel members={shuffle(members)} className={classes.memberGrid} />
        </Container>
        <QuoteSlideShow
          image={quotes_with_images[2].image_path}
          className={classes.quoteSlideShow}
        />
        <Typography
          component="h2"
          variant="h3"
          color="primary"
          className={`${classes.centeredText}  ${classes.sectionHeadline}`}
        >
          Get involved by joining our Team of volunteers!
        </Typography>
        <Container maxWidth="lg" className={classes.bubbleGrid}>
          <Typography
            component="h2"
            variant="h4"
            color="primary"
            className={classes.openPositionsHeadline}
          >
            Open positions:
          </Typography>
          {open_positions.map((info, index) => {
            return (
              <InfoBubble
                data={info}
                key={index}
                iconColor="secondary"
                textColor="primary"
                bold={true}
                maxWidth={330}
              />
            );
          })}
          <Typography
            component="h5"
            variant="h4"
            color="secondary"
            className={`${classes.centeredText} ${classes.textBlock}`}
          >
            Send your application to contact@climateconnect.earth
          </Typography>
        </Container>
        <Typography
          component="h2"
          variant="h4"
          color="primary"
          className={`${classes.centeredText}  ${classes.sectionHeadline}`}
        >
          Support us financially
        </Typography>
        <Typography
          component="h5"
          variant="h4"
          color="secondary"
          className={`${classes.centeredText} ${classes.textBlock}`}
        >
          Climate Connect gUG (haftungsbeschränkt)
          <br />
          IBAN: <span className={classes.bold}>DE02430609671072519500</span>
          <br />
          BIC: <span className={classes.bold}>GENODEM1GLS</span>
        </Typography>
      </WideLayout>
    </>
  );
}
