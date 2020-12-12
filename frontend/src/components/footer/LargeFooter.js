import React from "react";
import { makeStyles, Typography, Link, Button, Container } from "@material-ui/core";
import FeedbackButton from "../feedback/FeedbackButton";

import InstagramIcon from "@material-ui/icons/Instagram";
import GitHubIcon from "@material-ui/icons/GitHub";
import TwitterIcon from "@material-ui/icons/Twitter";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import FacebookIcon from "@material-ui/icons/Facebook";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FavoriteIcon from "@material-ui/icons/Favorite";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.light,
  },
  siteLinks: {
    display: "flex",
    padding: theme.spacing(6),
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
      justifyContent: "space-around",
    },
    ["@media (max-width: 400px)"]: {
      flexDirection: "column",
      justifyContent: "center",
    },
  },
  li: {
    color: "white",
    fontWeight: 600,
    [theme.breakpoints.down("md")]: {
      fontSize: 14,
    },
  },
  headline: {
    fontSize: 25,
    marginBottom: theme.spacing(2),
    fontWeight: "bold",
    [theme.breakpoints.down("md")]: {
      fontSize: 22,
    },
  },
  links: {
    height: 110,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  newsLetterBox: {
    maxWidth: 250,
    position: "relative",
    [theme.breakpoints.up("lg")]: {
      maxWidth: 280,
      border: "6px solid " + theme.palette.primary.main,
      marginTop: -18,
      padding: theme.spacing(1.5),
      marginLeft: theme.spacing(2),
      borderRadius: theme.spacing(2),
      borderTopLeftRadius: 0,
      "&:after": {
        content: " ''",
        position: "absolute",
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth: "40px 0 0 40px",
        borderColor: theme.palette.primary.light + " transparent",
        top: 0,
        left: -40,
      },
      "&:before": {
        content: "''",
        position: "absolute",
        borderStyle: "solid",
        borderWidth: "55px 0 0 55px",
        borderColor: theme.palette.primary.main + " transparent",
        width: 0,
        height: 0,
        top: -6,
        left: -55,
      },
    },
  },
  socialIcon: {
    fontSize: 30,
    color: "black",
    "&:hover": {
      color: "blue",
    },
  },
  socialIconsContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(3),
    maxWidth: 280,
    margin: "0 auto",
  },
  madeWith: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: theme.spacing(2),
    color: theme.palette.secondary.main,
  },
  heart: {
    color: "red",
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  earth: {
    color: "blue",
    marginLeft: theme.spacing(1),
    height: 20,
  },
  newsletterSubscribeButton: {
    marginTop: theme.spacing(2),
  },
  linksSection: {
    [theme.breakpoints.down("sm")]: {
      minWidth: 120,
      textAlign: "center",
      marginBottom: theme.spacing(2),
    },
  },
}));

export default function LargeFooter({ className }) {
  const classes = useStyles();
  return (
    <div className={`${className} ${classes.root}`}>
      <Container maxWidth="lg">
        <SiteLinks />
        <SocialLinks />
        <MadeWithLoveForEarth />
      </Container>
    </div>
  );
}

const MadeWithLoveForEarth = () => {
  const classes = useStyles();
  return (
    <div className={classes.madeWith}>
      Made with <FavoriteIcon className={classes.heart} /> for{" "}
      <img className={classes.earth} src="/images/earth.svg" alt="Picture of our earth" />
    </div>
  );
};

const SocialLinks = () => {
  const classes = useStyles();
  return (
    <div className={classes.socialIconsContainer}>
      {/* <Link target="_blank" href="https://www.instagram.com/climate_connect.earth/">
        <InstagramIcon color="primary" className={classes.socialIcon} />
      </Link> */}
      <Link target="_blank" href="https://github.com/climateconnect/climateconnect">
        <GitHubIcon className={classes.socialIcon} />
      </Link>
      <Link target="_blank" href="https://twitter.com/ConnectClimate">
        <TwitterIcon color="primary" className={classes.socialIcon} />
      </Link>
      <Link target="_blank" href="https://www.linkedin.com/company/climateconnect">
        <LinkedInIcon color="primary" className={classes.socialIcon} />
      </Link>
      <Link target="_blank" href="https://www.facebook.com/climateconnect.earth">
        <FacebookIcon color="primary" className={classes.socialIcon} />
      </Link>
      <Link target="_blank" href="https://www.youtube.com/channel/UC10rPriptUxYilMfvt-8Tkw">
        <YouTubeIcon color="primary" className={classes.socialIcon} />
      </Link>
    </div>
  );
};

const SiteLinks = () => {
  const classes = useStyles();
  return (
    <div className={classes.siteLinks}>
      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          General
        </Typography>
        <div className={classes.links}>
          <Link underline="none" href="/faq">
            <Typography className={classes.li}>FAQ</Typography>
          </Link>
          <Link underline="none" href="/donate">
            <Typography className={classes.li}>Donate</Typography>
          </Link>
          <Link underline="none" href="/about">
            <Typography className={classes.li}>About</Typography>
          </Link>
        </div>
      </div>
      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Contact
        </Typography>
        <div className={classes.links}>
          <Link underline="none" href="mailto:contact@climateconnect.earth">
            <Typography className={classes.li}>contact@climateconnect.earth</Typography>
          </Link>
          <Link underline="none" href="tel:+4915730101056">
            <Typography className={classes.li}>+4915730101056</Typography>
          </Link>
          <FeedbackButton justLink>
            <Typography className={classes.li}>Leave Feedback</Typography>
          </FeedbackButton>
        </div>
      </div>
      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Browse
        </Typography>
        <div className={classes.links}>
          <Link underline="none" href="/browse">
            <Typography className={classes.li}>Projects</Typography>
          </Link>
          <Link underline="none" href="/browse#organizations">
            <Typography className={classes.li}>Organizations</Typography>
          </Link>
          <Link underline="none" href="/browse#members">
            <Typography className={classes.li}>Members</Typography>
          </Link>
        </div>
      </div>
      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Legal
        </Typography>
        <div className={classes.links}>
          <Link underline="none" href="/imprint">
            <Typography className={classes.li}>Imprint</Typography>
          </Link>
          <Link underline="none" href="/privacy">
            <Typography className={classes.li}>Privacy</Typography>
          </Link>
          <Link underline="none" href="/terms">
            <Typography className={classes.li}>Terms</Typography>
          </Link>
        </div>
      </div>
      <div className={`${classes.newsLetterBox} ${classes.linksSection}`}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Newsletter
        </Typography>
        <Typography className={classes.li}>
          Sign up to get updates about Climate Connect and a summary of highlight projects every
          month!
        </Typography>
        <Button
          className={classes.newsletterSubscribeButton}
          color="primary"
          variant="contained"
          target="_blank"
          href={process.env.LATEST_NEWSLETTER_LINK}
        >
          latest newsletter
        </Button>
      </div>
    </div>
  );
};
