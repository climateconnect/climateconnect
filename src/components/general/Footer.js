import React from "react";
import Link from "next/link";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  footer: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
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
    marginLeft: theme.spacing(1)
  },
  footerContainer: {
    position: "relative",
    height: 58
  },
  inheritColor: {
    color: "inherit"
  },
  twitter: {
    height: 30
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <Box component="footer" className={classes.footer}>
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
        >
          <img src="/images/github.png" className={classes.socialMediaLink} />
        </a>
        <a href="https://twitter.com/ConnectClimate" target="_blank" rel="noopener noreferrer">
          <img
            src="/icons/twitter.svg"
            className={`${classes.socialMediaLink} ${classes.twitter}`}
          />
        </a>
        <a
          href="https://www.instagram.com/climate_connect.earth/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/instagram.svg" className={classes.socialMediaLink} />
        </a>
        <a
          href="https://www.facebook.com/climateconnect.earth/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/facebook.svg" className={classes.socialMediaLink} />
        </a>
      </Box>
    </Box>
  );
}
