import React from "react";
import Link from "next/link";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import GitHubIcon from "@material-ui/icons/GitHub";
import TwitterIcon from "@material-ui/icons/Twitter";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    height: theme.spacing(8),
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    width: "100%",
    bottom: 0
  },
  centerText: {
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
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <Box component="footer" className={classes.root}>
      <Box className={classes.leftBox}>
        <Link href="/impressum">
          <a className={classes.inheritColor}>Impressum</a>
        </Link>
      </Box>
      <Box component="span" className={classes.centerText}>
        © Climate Connect {new Date().getFullYear()}
      </Box>
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
      </Box>
    </Box>
  );
}
