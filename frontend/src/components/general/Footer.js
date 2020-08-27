import React from "react";
import Link from "next/link";
import { Box, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GitHubIcon from "@material-ui/icons/GitHub";
import TwitterIcon from "@material-ui/icons/Twitter";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";
import YouTubeIcon from "@material-ui/icons/YouTube";
import FavoriteIcon from "@material-ui/icons/Favorite";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    height: theme.spacing(8),
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    width: "100%"
  },
  absolutePosition: {
    position: "absolute",
    bottom: 0
  },
  spacingTop: {
    marginTop: theme.spacing(2)
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  centerText: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "0 auto"
  },
  rightBox: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center"
  },
  leftBox: {
    marginRight: "auto"
  },
  socialMediaLink: {
    height: 20,
    marginLeft: theme.spacing(1),
    color: "inherit"
  },
  inheritColor: {
    color: "inherit"
  },
  heart: {
    color: "red",
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5)
  },
  earth: {
    color: "blue",
    marginLeft: theme.spacing(1),
    height: 20
  },
  link: {
    marginRight: theme.spacing(1)
  }
}));

//TODO: make footer stay on bottom on normal layout again
export default function Footer({ className, noSpacingTop, noAbsolutePosition }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

  return (
    <Box
      component="footer"
      className={`${className} ${classes.root} ${!noSpacingTop &&
        classes.spacingTop} ${!noAbsolutePosition && classes.absolutePosition}`}
    >
      <Box className={classes.flexContainer}>
        <Box className={classes.leftBox}>
          <Link href="/imprint">
            <a className={`${classes.inheritColor} ${classes.link}`}>Imprint</a>
          </Link>
          <Link href="/privacy">
            <a className={`${classes.inheritColor} ${classes.link}`}>Privacy</a>
          </Link>
          <Link href="/terms">
            <a className={classes.inheritColor}>Terms</a>
          </Link>
        </Box>
        {!isNarrowScreen && (
          <Box component="span" className={classes.centerText}>
            Made with <FavoriteIcon className={classes.heart} /> for{" "}
            <img className={classes.earth} src="/images/earth.svg" />
          </Box>
        )}
        <Box component="span" className={classes.rightBox}>
          <a
            href="https://github.com/climateconnect/climateconnect"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.inheritColor}
          >
            <GitHubIcon className={classes.socialMediaLink} />
          </a>
          <a
            href="https://twitter.com/ConnectClimate"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.inheritColor}
          >
            <TwitterIcon className={classes.socialMediaLink} />
          </a>
          <a
            href="https://www.instagram.com/climate_connect.earth/"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.inheritColor}
          >
            <InstagramIcon className={classes.socialMediaLink} />
          </a>
          <a
            href="https://www.facebook.com/climateconnect.earth/"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.inheritColor}
          >
            <FacebookIcon className={classes.socialMediaLink} />
          </a>
          <a
            href="https://www.youtube.com/channel/UC10rPriptUxYilMfvt-8Tkw"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.inheritColor}
          >
            <YouTubeIcon className={classes.socialMediaLink} />
          </a>
        </Box>
      </Box>
    </Box>
  );
}
