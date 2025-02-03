import { Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import UserContext from "../context/UserContext";
import Image from "next/image";

const PRIO1_SLUG = "prio1";

const useStyles = makeStyles((theme) => ({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    overflow: "hidden",
  },

  prioOneDefaultBackground: {
    backgroundColor: theme.palette.secondary.main,
  },
  prioOneAuthIcon: {
    position: "absolute",
    top: "50vh",
    left: "70vw",
    width: "11rem",
    height: "11rem",

    [theme.breakpoints.up("xl")]: {
      top: "40vh",
      left: "auto",
      right: "4vw",
      width: "12rem",
      height: "12rem",
    },
  },
  prioOneMobileBackground: {
    backgroundColor: theme.palette.secondary.light,
  },
  prioOneAccentBackground: {
    borderLeftColor: theme.palette.secondary.light,
  },
}));

type Props = { hubUrl: string | undefined };

/**
 * Adds a custom background to the hub, if one is defined. Currently only PrioOne has a custom background.
 * Mind that this component determines itself whether and which background to render based on the hubUrl
 * and the current pathname. This means that the background is not customizable by the user.
 * Some backgrounds are limited to certain pages (e.g. auth pages or browse pages).
 * Additionally, mobile versions are not supported yet and will result in no background being rendered.
 * @param hubUrl The URL of the hub.
 *
 */
export default function CustomBackground({ hubUrl }: Props) {
  const mobileScreenSize = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  // TODO: mobileScreenSize is not yet supported
  if (!hubUrl) {
    return null;
  }
  const pathname = window.location.pathname;

  switch (hubUrl.toLowerCase()) {
    case "prio1": {
      if (pathname.endsWith("/hubs/prio1")) {
        if (mobileScreenSize) {
          return null;
        }
        return null;
        //temporarily disabled
        //return <PrioOneBackgroundBrowse />;
      } else if (
        pathname.endsWith("/signup") ||
        pathname.endsWith("/signin") ||
        pathname.endsWith("/accountcreated")
      ) {
        return <PrioOneBackgroundAuth mobileScreenSize={mobileScreenSize} />;
      }
    }
    default: {
      // all other hubs (and non hubs should not render a background)
      return null;
    }
  }
}

function PrioOneBackgroundBrowse() {
  const { user } = useContext(UserContext);
  const loggedIn = !!user;
  const classes = useStyles();
  const height = loggedIn ? 30 : 55.1;
  const width = 100;
  const triangleBottom = width * 0.5;
  const triangleLeft = width * 3;

  return (
    <div
      className={`${classes.background} ${classes.prioOneDefaultBackground}`}
      style={{ bottom: "auto", height: `${height}vh` }}
    >
      {/* Container within the background */}
      <div style={{ position: "relative" }}>
        {/* Upper triangle */}
        <div
          style={{
            width: 0,
            height: 0,
            borderBottom: `${triangleBottom}vh` + " solid transparent",
            borderLeftWidth: `${triangleLeft}vh`,
            borderLeftStyle: "solid",

            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(0deg)",
          }}
          className={classes.prioOneAccentBackground}
        />
      </div>
    </div>
  );
}

function PrioOneBackgroundAuth({ mobileScreenSize }) {
  const classes = useStyles();
  if (mobileScreenSize) {
    return <div className={`${classes.background} ${classes.prioOneMobileBackground}`}></div>;
  }
  return (
    <div className={`${classes.background} ${classes.prioOneDefaultBackground}`}>
      {/* Container within the background */}
      <div style={{ position: "relative" }}>
        {/* Upper triangle */}
        <div
          className={classes.prioOneAccentBackground}
          style={{
            width: 0,
            height: 0,
            borderBottom: "85vh solid transparent",
            borderLeftWidth: `250vw`,
            borderLeftStyle: "solid",
            position: "absolute",
            top: 0,
            left: 0,
            transform: "rotate(0deg)",
          }}
        />
      </div>
      <div className={classes.prioOneAuthIcon}>
        <Image
          className={classes.prioOneAuthIcon}
          src={"/images/custom_hubs/" + PRIO1_SLUG + "_group.svg"}
          layout="fill"
        ></Image>
      </div>
    </div>
  );
}
