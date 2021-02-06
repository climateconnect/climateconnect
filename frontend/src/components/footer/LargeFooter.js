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
  newsletterBlurb: {
    color: "white",
  },
  li: {
    fontWeight: 600,
    [theme.breakpoints.down("md")]: {
      fontSize: 14,
    },
  },
  footerLink: {
    color: "white",
    "&:hover": {
      color: theme.palette.primary.main,
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
    color: theme.palette.primary.main,
    "&:hover": {
      color: theme.palette.secondary.main,
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

const FooterLink = ({ children, href }) => {
  const classes = useStyles();
  return (
    <Link underline="none" href={href} className={classes.footerLink}>
      <Typography className={classes.li}>{children}</Typography>
    </Link>
  );
};

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
      <Link target="_blank" href="https://www.instagram.com/climate_connect.earth/">
        <InstagramIcon color="primary" className={classes.socialIcon} />
      </Link>
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
          <FooterLink href="/faq">FAQ</FooterLink>
          <FooterLink href="/donate">Donate</FooterLink>
          <FeedbackButton justLink>
            <Typography className={classes.li}>Leave feedback</Typography>
          </FeedbackButton>
          <FooterLink href="/about">About</FooterLink>
        </div>
      </div>

      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Browse
        </Typography>
        <div className={classes.links}>
          <FooterLink href="/browse">Projects</FooterLink>
          <FooterLink href="/browse#organizations">Organizations</FooterLink>
          <FooterLink href="/browse#members">Members</FooterLink>
          <FooterLink href="/hubs">Hubs</FooterLink>
        </div>
      </div>

      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Legal
        </Typography>
        <div className={classes.links}>
          <FooterLink href="mailto:contact@climateconnect.earth">Send email</FooterLink>
          <FooterLink href="/imprint">Imprint</FooterLink>
          <FooterLink href="/privacy">Privacy</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
        </div>
      </div>

      <div className={`${classes.newsLetterBox} ${classes.linksSection}`}>
        <Typography color="primary" component="h3" className={classes.headline}>
          Newsletter
        </Typography>
        <Typography className={`${classes.li} ${classes.newsletterBlurb}`}>
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
