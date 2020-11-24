import React from "react";
import { Typography, makeStyles, Container, useMediaQuery } from "@material-ui/core";
import SmallCloud from "./SmallCloud";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  contentWrapper: {
    background: theme.palette.primary.light,
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      maxHeight: 175,
      zIndex: 1
    }
  },
  contentContainer: {
    display: "flex",
    height: 180,
    alignItems: "center",
    maxWidth: theme.breakpoints.md,
    margin: "0 auto",
    paddingTop: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      height: 150,
      marginBottom: theme.spacing(3),
      justifyContent: "flex-start",
      paddingLeft: theme.spacing(6)
    },
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(1),
      marginBottom: 0,
      height: "auto"
    }
  },
  imageContainer: props => ({
    background: `url('${props.img}')`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    width: 300,
    height: "100%",
    zIndex: 1,
    marginBottom: -50,
    [theme.breakpoints.down("sm")]: {
      width: 220,
      marginBottom: 0
    },
    [theme.breakpoints.down("xs")]: {
      width: 160,
      height: 100
    }
  }),
  headersContainer: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(1),
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      marginLeft: theme.spacing(1)
    }
  },
  headline: {
    color: theme.palette.yellow.main,
    fontSize: 40,
    fontWeight: "bold",
    textShadow: `2px 2px ${theme.palette.primary.main}`,
    [theme.breakpoints.down("xs")]: {
      fontSize: 28
    }
  },
  subHeader: {
    fontSize: 19,
    fontWeight: 600
  },
  mobileSubheaderContainer: {
    [theme.breakpoints.down("sm")]: {
      paddingLeft: theme.spacing(4)
    },
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      marginTop: 10
    },
    marginTop: 30
  },
  bottomTriangle: {
    width: "100%",
    height: 70,
    background: theme.palette.primary.light,
    clipPath: "polygon(0 0, 100% 0, 100% 0%, 0% 100%)",
    [theme.breakpoints.down("xs")]: {
      marginTop: -1
    }
  },
  smallCloud2: {
    position: "absolute",
    width: 90,
    height: 75,
    bottom: 0,
    right: 20,
    [theme.breakpoints.down("sm")]: {
      top: 5,
      right: 5
    }
  },
  smallCloud1: {
    position: "absolute",
    width: 120,
    height: 90,
    top: -20,
    right: -60,
    [theme.breakpoints.down("sm")]: {
      display: "none"
    }
  }
}));
export default function TopSection({ headline, subHeader, img }) {
  const classes = useStyles({ img: img });
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div className={classes.root}>
      <div className={classes.contentWrapper}>
        <Container className={classes.contentContainer}>
          <div className={classes.imageContainer} />
          <div className={classes.headersContainer}>
            <Typography component="h1" className={classes.headline}>
              {headline}
            </Typography>
            {!isNarrowScreen && (
              <Typography component="h2" color="secondary" className={classes.subHeader}>
                {subHeader}
              </Typography>
            )}
            <SmallCloud type={1} className={classes.smallCloud1} />
          </div>
        </Container>
        {isNarrowScreen && (
          <Container className={classes.mobileSubheaderContainer}>
            <Typography component="h2" color="secondary" className={classes.subHeader}>
              {subHeader}
            </Typography>
          </Container>
        )}
        <SmallCloud type={2} reverse className={classes.smallCloud2} />
      </div>
      <div className={classes.bottomTriangle} />
    </div>
  );
}
