import { Box, Link, useMediaQuery } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FacebookIcon from "@material-ui/icons/Facebook";
import FavoriteIcon from "@material-ui/icons/Favorite";
import GitHubIcon from "@material-ui/icons/GitHub";
import InstagramIcon from "@material-ui/icons/Instagram";
import TwitterIcon from "@material-ui/icons/Twitter";
import YouTubeIcon from "@material-ui/icons/YouTube";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import SocialMediaButton from "../general/SocialMediaButton";
import LargeFooter from "./LargeFooter";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: theme.spacing(8),
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    width: "100%",
  },
  absolutePosition: {
    position: "absolute",
    bottom: 0,
  },
  relativePosition: {
    position: "fixed",
    bottom: 0,
    backgroundColor: "#FFFFFF",
  },
  spacingTop: {
    marginTop: theme.spacing(2),
  },
  flexContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
    },
  },
  centerText: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    margin: "0 auto",
  },
  rightBox: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(2),
    },
  },
  leftBox: {
    marginRight: "auto",
    [theme.breakpoints.down("sm")]: {
      marginRight: 0,
      marginBottom: theme.spacing(1),
    },
  },
  socialMediaLink: {
    height: 20,
    marginLeft: theme.spacing(1),
    color: "inherit",

    "&:hover": {
      color: theme.palette.primary.main,
    },
  },

  inheritColor: {
    color: "inherit",
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
  link: {
    marginRight: theme.spacing(1),
  },
}));

//TODO: make footer stay on bottom on normal layout again
export default function Footer({
  className,
  noSpacingTop,
  noAbsolutePosition,
  showOnScrollUp,
  large,
}) {
  if (!large)
    return (
      <SmallFooter
        className={className}
        noSpacingTop={noSpacingTop}
        noAbsolutePosition={noAbsolutePosition}
        showOnScrollUp={showOnScrollUp}
      />
    );
  else return <LargeFooter className={className} />;
}

const SmallFooter = ({ className, noSpacingTop, noAbsolutePosition, showOnScrollUp }) => {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });

  return (
    <Box
      component="footer"
      className={`${className} ${classes.root} ${!noSpacingTop && classes.spacingTop} ${
        !noAbsolutePosition &&
        (showOnScrollUp === true ? classes.relativePosition : classes.absolutePosition)
      }`}
    >
      <Box className={classes.flexContainer}>
        <Box className={classes.leftBox}>
          <Link href={getLocalePrefix(locale) + "/imprint"} color="inherit">
            <span className={`${classes.inheritColor} ${classes.link}`}>{texts.imprint}</span>
          </Link>
          <Link href={getLocalePrefix(locale) + "/privacy"} color="inherit">
            <span className={`${classes.inheritColor} ${classes.link}`}>{texts.privacy}</span>
          </Link>
          <Link href={getLocalePrefix(locale) + "/terms"} color="inherit">
            <span className={classes.inheritColor}>{texts.terms}</span>
          </Link>
        </Box>
        {!isNarrowScreen && (
          <Box component="span" className={classes.centerText}>
            Made with <FavoriteIcon className={classes.heart} /> for{" "}
            <img
              className={classes.earth}
              src="/images/earth.svg"
              alt={texts.picture_of_our_earth}
            />
          </Box>
        )}
        <Box component="span" className={classes.rightBox}>
          <SocialMediaButton
            href="https://github.com/climateconnect/climateconnect"
            icon={<GitHubIcon alt="GitHub" className={classes.socialMediaLink} />}
          />
          <SocialMediaButton
            href="https://twitter.com/ConnectClimate"
            icon={<TwitterIcon className={classes.socialMediaLink} alt="Twitter" />}
          />
          <SocialMediaButton
            href="https://www.instagram.com/climate_connect.earth/"
            icon={<InstagramIcon className={classes.socialMediaLink} alt="Instagram" />}
          />
          <SocialMediaButton
            href="https://www.facebook.com/climateconnect.earth/"
            icon={<FacebookIcon className={classes.socialMediaLink} alt="Facebook" />}
          />
          <SocialMediaButton
            href="https://www.youtube.com/channel/UC10rPriptUxYilMfvt-8Tkw"
            icon={<YouTubeIcon className={classes.socialMediaLink} alt="YouTube" />}
          />
        </Box>
      </Box>
    </Box>
  );
};
