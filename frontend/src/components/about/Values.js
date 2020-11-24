import { Container, makeStyles, Typography } from "@material-ui/core";

import React from "react";
import LightBigButton from "../staticpages/LightBigButton";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import GroupWorkOutlinedIcon from "@material-ui/icons/GroupWorkOutlined";
import Value from "./Value";

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2)
  },
  wrapper: {
    display: "flex",
    alignItems: "center"
  },
  textBody: {
    color: "white",
    fontWeight: 600,
    maxWidth: 700,
    marginBottom: theme.spacing(2)
  },
  yellow: {
    color: theme.palette.yellow.main
  },
  valuesListWrapper: {
    display: "flex",
    paddingLeft: theme.spacing(8),
    position: "relative"
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
    top: -0,
    left: 0,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat"
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
            organisation allows us to <span className={classes.yellow}>work with everyone</span>{" "}
            involved in fighting climate change. This is also why we include our community as much
            as possible. Our code-base is <span className={classes.yellow}>open source</span>, we
            organize regular network events and let our users help us decide what steps to take
            next.
          </Typography>
          <LightBigButton>Get involved</LightBigButton>
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
