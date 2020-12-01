import { Container, makeStyles, Typography } from "@material-ui/core";

import React from "react";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import GroupWorkOutlinedIcon from "@material-ui/icons/GroupWorkOutlined";
import Value from "./Value";

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(4)
    }
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center"
    }
  },
  textBody: {
    color: "white",
    fontWeight: 600,
    maxWidth: 700,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      textAlign: "center"
    },
    [theme.breakpoints.down("xs")]: {
      marginBottom: 0,
    }
  },
  yellow: {
    color: theme.palette.yellow.main
  },
  valuesListWrapper: {
    display: "flex",
    paddingLeft: theme.spacing(16),
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      paddingLeft: 0,
      paddingTop: 40,
      width: "100%",
      justifyContent: "center"
    }
  },
  leftValuesWrapper: {
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(6),
    zIndex: 1
  },
  rightValuesWrapper: {
    zIndex: 1
  },
  bigCloudContainer: {
    background: "url('/images/about-values-cloud.svg')",
    position: "absolute",
    top: -40,
    left: -15,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    width: 550,
    [theme.breakpoints.down("sm")]: {
      left: 0,
      right: 0,
      marginLeft: "auto",
      marginRight: "auto",
      width: 550,
      top: 0
    },
    [theme.breakpoints.down("xs")]: {
      left: -30,
      top: 5
    }
  },
  bigCloudImg: {
    visibility: "hidden",
    height: 460
  }
}));

export default function Values({ headlineClass }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container className={classes.wrapper}>
        <div>
          <Typography className={`${headlineClass} ${classes.headline}`}>Our Values</Typography>
          <Typography className={classes.textBody}>
            Climate Connect is a <span className={classes.yellow}>donation based</span> NGO - we
            dedicate all our work to make an impact on climate change. Being an independent
            organisation allows us to work with <span className={classes.yellow}>everyone{" "}
            involved in fighting climate change.</span> This is also why we include our community as much
            as possible. Our code-base is <span className={classes.yellow}>open source</span>, we
            organize regular network events and let our users help us decide what steps to take
            next.
          </Typography>
        </div>
        <div className={classes.valuesListWrapper}>
          <div className={classes.leftValuesWrapper}>
            <Value iconSrc="/icons/donate-icon-bold.svg" text="Free & Non-Profit" />
            <Value icon={{ src: LockOpenIcon }} text="Open Source" />
          </div>
          <div className={classes.rightValuesWrapper}>
            <Value icon={{ src: GroupWorkOutlinedIcon }} text="Community driven" />
            <Value iconSrc="/icons/independent-icon.svg" text="Independent" />
          </div>
          <div className={classes.bigCloudContainer}>
            <img src="/images/about-values-cloud.svg" className={classes.bigCloudImg} />
          </div>
        </div>
      </Container>
    </div>
  );
}
