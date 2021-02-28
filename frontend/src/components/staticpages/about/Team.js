import { Container, makeStyles, Typography, Link } from "@material-ui/core";

import React from "react";
import InfoLinkBox from "../InfoLinkBox";

const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    display: "flex",
    marginTop: theme.spacing(6),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  textContainer: {
    marginLeft: theme.spacing(6),
    padding: theme.spacing(3),
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    maxWidth: 550,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      maxWidth: 600,
      padding: 0,
      margin: 0,
      marginTop: theme.spacing(3),
    },
  },
  textBody: {
    fontWeight: 600,
    textAlign: "center",
  },
  infoLinkBox: {
    width: "100% !important",
    marginLeft: 0,
  },
  image: {
    visibility: "hidden",
    width: "100%",
    maxWidth: 600,
  },
  imageWrapper: {
    background: `url('/images/team.jpg')`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
  },
  imageContainer: {
    display: "flex",
    alignItems: "center",
  },
}));

export default function Team({ headlineClass, className }) {
  const classes = useStyles();
  return (
    <Container className={className}>
      <Typography color="primary" component="h1" className={headlineClass}>
        Our Team
      </Typography>
      <div className={classes.contentWrapper}>
        <div className={classes.imageContainer}>
          <div className={classes.imageWrapper}>
            <img src="/images/team.jpg" alt="Climate Connect's core team: A group of 9 people wearing Climate Connect T-Shirts" className={classes.image} />
          </div>
        </div>
        <div className={classes.textContainer}>
          <Typography color="secondary" className={classes.textBody}>
            We are an international team of 3 people running Climate Connect full-time and around 15
            volunteers dedicating their free-time to creating collaboration between climate actors.
            <br />
            <br />
            <Link underline="always" href="mailto:contact@climateconnect.earth">
              Contact us
            </Link>{" "}
            if {"you're"} interested in joining the team!
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
