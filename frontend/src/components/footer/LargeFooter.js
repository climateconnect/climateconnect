import { Button, Container, Link, makeStyles, Typography } from "@material-ui/core";
import FacebookIcon from "@material-ui/icons/Facebook";
import FavoriteIcon from "@material-ui/icons/Favorite";
import GitHubIcon from "@material-ui/icons/GitHub";
import InstagramIcon from "@material-ui/icons/Instagram";
import LinkedInIcon from "@material-ui/icons/LinkedIn";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FeedbackButton from "../feedback/FeedbackButton";

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
    display: "block",
    "margin-bottom": theme.spacing(1),
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
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div className={`${className} ${classes.root}`}>
      <Container maxWidth="lg">
        <SiteLinks texts={texts} locale={locale} />
        <SocialLinks />
        <MadeWithLoveForEarth texts={texts} />
      </Container>
    </div>
  );
}

const MadeWithLoveForEarth = (texts) => {
  const classes = useStyles();
  return (
    <div className={classes.madeWith}>
      Made with <FavoriteIcon className={classes.heart} /> for{" "}
      <img className={classes.earth} src="/images/earth.svg" alt={texts.picture_of_our_earth} />
    </div>
  );
};

const SocialLinks = () => {
  const classes = useStyles();
  return (
    <div className={classes.socialIconsContainer}>
      <Link target="_blank" href="https://www.instagram.com/climate_connect.earth/">
        <InstagramIcon color="primary" className={classes.socialIcon} alt="Instagram" />
      </Link>
      <Link target="_blank" href="https://github.com/climateconnect/climateconnect">
        <GitHubIcon className={classes.socialIcon} alt="GitHub" />
      </Link>
      <Link target="_blank" href="https://twitter.com/ConnectClimate">
        <TwitterIcon color="primary" className={classes.socialIcon} alt="Twitter" />
      </Link>
      <Link target="_blank" href="https://www.linkedin.com/company/climateconnect">
        <LinkedInIcon color="primary" className={classes.socialIcon} alt="LinkedIn" />
      </Link>
      <Link target="_blank" href="https://www.facebook.com/climateconnect.earth">
        <FacebookIcon color="primary" className={classes.socialIcon} alt="Facebook" />
      </Link>
      <Link target="_blank" href="https://www.youtube.com/channel/UC10rPriptUxYilMfvt-8Tkw">
        <YouTubeIcon color="primary" className={classes.socialIcon} alt="YouTube" />
      </Link>
    </div>
  );
};

const SiteLinks = ({ texts, locale }) => {
  const classes = useStyles();
  return (
    <div className={classes.siteLinks}>
      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          {texts.general}
        </Typography>
        <div className={classes.links}>
          <FooterLink href={getLocalePrefix(locale) + "/faq"}>{texts.faq}</FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/donate"}>{texts.donate}</FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/about"}>{texts.about}</FooterLink>
        </div>
      </div>

      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          {texts.contact}
        </Typography>
        <div className={classes.links}>
          <FooterLink href="mailto:contact@climateconnect.earth">
            contact@climateconnect.earth
          </FooterLink>
          <FooterLink href="tel:+4915730101056">+4915730101056</FooterLink>
          <FeedbackButton justLink>
            <Typography className={classes.li}>{texts.leave_feedback}</Typography>
          </FeedbackButton>
        </div>
      </div>

      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          {texts.browse}
        </Typography>
        <div className={classes.links}>
          <FooterLink href={getLocalePrefix(locale) + "/browse"}>{texts.projects}</FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/browse#organizations"}>
            {texts.organizations}
          </FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/browse#members"}>
            {texts.members}
          </FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/hubs"}>{texts.hubs}</FooterLink>
        </div>
      </div>

      <div className={classes.linksSection}>
        <Typography color="primary" component="h3" className={classes.headline}>
          {texts.legal}
        </Typography>
        <div className={classes.links}>
          <FooterLink href={getLocalePrefix(locale) + "/imprint"}>{texts.imprint}</FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/privacy"}>{texts.privacy}</FooterLink>
          <FooterLink href={getLocalePrefix(locale) + "/terms"}>{texts.terms}</FooterLink>
        </div>
      </div>

      <div className={`${classes.newsLetterBox} ${classes.linksSection}`}>
        <Typography color="primary" component="h3" className={classes.headline}>
          {texts.newsletter}
        </Typography>
        <Typography className={`${classes.li} ${classes.newsletterBlurb}`}>
          {texts.sign_up_to_get_updates_about_climate_connect}
        </Typography>
        <Button
          className={classes.newsletterSubscribeButton}
          color="primary"
          variant="contained"
          target="_blank"
          href={process.env.LATEST_NEWSLETTER_LINK}
        >
          {texts.latest_newsletter}
        </Button>
      </div>
    </div>
  );
};
