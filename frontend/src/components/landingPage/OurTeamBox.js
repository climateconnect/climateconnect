import React from "react";
import { Typography, makeStyles, useMediaQuery, Container } from "@material-ui/core";
import theme from "../../themes/theme";
import SmallCloud from "./SmallCloud";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(10),
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(5)
    }
  },
  content: {
    display: "flex",
    maxWidth: 1280,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      width: "100%"
    }
  },
  infoLinkBox: {
    display: "flex",
    alignItems: "center",
    maxWidth: 600,
    marginLeft: theme.spacing(5),
    background: "#E6E5E5",
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: 700,
      margin: "0 auto",
      marginTop: theme.spacing(3)
    }
  },
  headline: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    ["@media (max-width: 400px)"]: {
      fontSize: 21
    }
  },
  text: {
    fontWeight: 600
  },
  icon: {
    marginRight: theme.spacing(3),
    width: 80,
    ["@media (max-width: 400px)"]: {
      width: 45
    }
  },
  infoLinkBoxes: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative"
  },
  teamImage: {
    maxWidth: "48%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "100%"
    }
  },
  smallCloud1: {
    position: "absolute",
    right: 110,
    top: 160,
    width: 120,
    height: 90,
    [theme.breakpoints.down("md")]: {
      display: "none"
    }
  },
  smallCloud2: {
    position: "absolute",
    width: 120,
    height: 90,
    top: -60,
    left: 100,
    [theme.breakpoints.down("xs")]: {
      left: 30,
      top: -30,
      width: 80
    }
  }
}));

export default function OurTeamBox({ h1ClassName }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    <Container className={classes.root}>
      <SmallCloud type={2} reverse className={classes.smallCloud2} />
      <Typography color="primary" component="h1" className={h1ClassName}>
        Our Team
      </Typography>
      <div className={classes.content}>
        <img
          src="/images/team.jpg"
          className={classes.teamImage}
          alt="Climate Connect's core team: A group of 9 people wearing Climate Connect T-Shirts"
        />
        <div className={classes.infoLinkBoxes}>
          <div className={classes.infoLinkBox}>
            <img src="/icons/group-icon.svg" className={classes.icon} alt="Icon display 2 people" />
            <div>
              <Typography color="primary" component="h2" className={classes.headline}>
                Who we are
              </Typography>
              <Typography color="secondary" className={classes.text}>
                Find out about our team{" "}
                {!isNarrowScreen && "and why we are doing what we are doing"}
              </Typography>
              <SmallCloud type={1} className={classes.smallCloud1} />
            </div>
          </div>
          <div className={classes.infoLinkBox}>
            <img
              src="/icons/donate-icon.svg"
              className={classes.icon}
              alt="Open hand offering a seedling with a heart instead of leaves"
            />
            <div>
              <Typography color="primary" component="h2" className={classes.headline}>
                Our Mission
              </Typography>
              <Typography color="secondary" className={classes.text}>
                Learn about our goals and values
                {!isNarrowScreen &&
                  " and what we want to achieve with creating a climate community"}
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
