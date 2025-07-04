import { Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import Image from "next/image";

const PRIO1_SLUG = "prio1";
const PERTH_SLUG = "perth";

type StyleProps = {
  hubSlug?: string;
};

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => {
  return {
    background: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -10,
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
    prioOneAccentBackground: {
      backgroundColor: theme.palette.secondary.light,
    },
    splitBackgroundContainer: {
      position: "relative",
    },
    backgroundBorderLeft: (props) => ({
      borderLeftColor:
        props.hubSlug === PRIO1_SLUG
          ? theme.palette.secondary.light
          : theme.palette.background.default,
    }),

    splitBackground: {
      width: 0,
      height: 0,
      borderBottom: "85vh solid transparent",
      borderLeftWidth: `250vw`,
      borderLeftStyle: "solid",
      position: "absolute",
      top: 0,
      left: 0,
      transform: "rotate(0deg)",
    },

    defaultBackground: (props) => ({
      backgroundColor:
        props.hubSlug === PRIO1_SLUG ? theme.palette.secondary.main : theme.palette.primary.main,
    }),
  };
});

type Props = { hubUrl: string | undefined };

type BackgroundComponentProps = {
  mobileScreenSize: boolean;
  classes: ReturnType<typeof useStyles>;
};

const isAuthPath = (pathname: string): boolean => {
  return (
    pathname.endsWith("/signup") ||
    pathname.endsWith("/signin") ||
    pathname.endsWith("/accountcreated")
  );
};

export function CustomBackground({ hubUrl }: Props) {
  const classes = useStyles({ hubSlug: hubUrl });
  const mobileScreenSize = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const pathname = window.location.pathname;
  const browseRegex = /\/hubs\/[^/]+\/browse$/;
  const browsePath = browseRegex.test(pathname);
  const isAuthPage = isAuthPath(pathname);

  if (!hubUrl) {
    return null;
  }

  if (browsePath) {
    return null;
  }

  if (!isAuthPage) {
    return null;
  }

  switch (hubUrl.toLowerCase()) {
    case PRIO1_SLUG:
      return <PrioOneBackgroundAuth mobileScreenSize={mobileScreenSize} classes={classes} />;
    case PERTH_SLUG:
      return <PerthBackgroundAuth mobileScreenSize={mobileScreenSize} classes={classes} />;
    default:
      return null;
  }
}

const BackgroundSplitSection = ({ classes }) => {
  return (
    <div className={classes.splitBackgroundContainer}>
      <div className={`${classes.backgroundBorderLeft} ${classes.splitBackground}`} />
    </div>
  );
};

function PrioOneBackgroundAuth({ mobileScreenSize, classes }: BackgroundComponentProps) {
  if (mobileScreenSize) {
    return <></>;
  }

  return (
    <div className={`${classes.background} ${classes.defaultBackground}`}>
      <BackgroundSplitSection classes={classes} />
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
function PerthBackgroundAuth({ mobileScreenSize, classes }: BackgroundComponentProps) {
  if (mobileScreenSize) {
    return <></>;
  }
  return (
    <div className={`${classes.background} ${classes.defaultBackground}`}>
      <BackgroundSplitSection classes={classes} />
    </div>
  );
}

export function PrioOneBackgroundBrowse({ isLoggedInUser }: { isLoggedInUser: boolean }) {
  const classes = useStyles();
  const largeScreenSize = useMediaQuery("(max-width: 1300px)");

  return (
    <div className={`${classes.background} ${classes.prioOneDefaultBackground}`}>
      {/* upper triangle (top left corner) - actually it is a trapezoid */}
      <div
        style={{
          width: "100%",
          height: "100%",

          // Note: clipPath is needed with the traditional way the percentages
          // are not supported:
          // boorderBottom: "100% solid blue"
          clipPath: "polygon(0% 100%, 100% 55%, 100% 0%, 0% 0%)",
        }}
        className={classes.prioOneAccentBackground}
      />
      {!isLoggedInUser && !largeScreenSize && (
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "0.5vw",
            width: "11rem",
            height: "11rem",
          }}
        >
          <Image src={"/images/custom_hubs/" + PRIO1_SLUG + "_group.svg"} layout="fill"></Image>
        </div>
      )}
    </div>
  );
}

export function PrioOneBackgroundBrowseIcon() {
  const largeScreenSize = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));

  let width = 160;
  let height = 160;
  if (largeScreenSize) {
    width = 130;
    height = 130;
  }

  return (
    <Image
      src={"/images/custom_hubs/" + PRIO1_SLUG + "_group.svg"}
      width={width}
      height={height}
    ></Image>
  );
}
