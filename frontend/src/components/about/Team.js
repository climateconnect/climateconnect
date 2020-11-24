import { Container, makeStyles, Typography, Link } from "@material-ui/core";

import React from "react";
import HoverImage from "../staticpages/HoverImage";
import InfoLinkBox from "../staticpages/InfoLinkBox";

const useStyles = makeStyles(theme => ({
  contentWrapper: {
    display: "flex",
    marginTop: theme.spacing(6)
  },
  textContainer: {
    marginLeft: theme.spacing(6),
    padding: theme.spacing(3),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    maxWidth: 550,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  textBody: {
    fontWeight: 600,
    textAlign: "center"
  },
  infoLinkBox: {
    width: "100% !important",
    marginLeft: 0
  }
}));

export default function Team({ headlineClass, className }) {
  const classes = useStyles();
  return (
    <Container className={className}>
      <Typography color="primary" component="h1" className={headlineClass}>
        Our Team
      </Typography>
      <div className={classes.contentWrapper}>
        <HoverImage
          src="/images/team.jpg"
          background="primary"
          itemsPerLine={3}
          itemsPerRow={3}
          innerMosaicImage={[
            {
              src: "/images/ann-kathrin-strike.jpg",
              alt: "Ann-Kathrin Bernauer global climate strike Wuppertal"
            },
            {
              src: "/images/tobias-strike.jpg",
              alt: "Tobias Rehm global climate strike Erlangen"
            },
            {
              src: "/images/fabi-strike.jpg",
              alt: "Fabian Schiller global climate strike Erlangen"
            },
            {
              src: "/images/michi-strike.jpg",
              alt: "Michael Fischer global climate strike Aresing"
            },
            {
              src: "/images/nadine-strike.jpg",
              alt: "Nadine Schneider global climate strike Erlangen"
            },
            {
              src: "/images/chris-strike.jpg",
              alt: "Christoph Stoll global climate strike Erlangen"
            },
            {
              src: "/images/thomas-strike.jpg",
              alt: "Thomas Bove global climate strike Paris"
            },
            {
              src: "/images/julius-strike.jpg",
              alt: "Julius butze global climate strike Augsburg"
            }
          ]}
        />
        <div className={classes.textContainer}>
          <Typography color="secondary" className={classes.textBody}>
            We are an international Team of 3 people running Climate Connect full-time and around 15 volunteers dedicating their free-time to creating collaboration between climate actors. Contact us if {"you're"} interested in joining the team!<br/>
            <Link underline="always" href="mailto:contact@climateconnect.earth">Get in contact</Link>
          </Typography>
          <InfoLinkBox 
            className={classes.infoLinkBox}
            iconSrc="/icons/group-icon.svg"
            iconAlt="Icon display 2 people"
            headline="Find Out More"
            text={"Learn more about our team and why we do what we are doing - coming soon!"}
          />
        </div>
      </div>
    </Container>
  );
}
