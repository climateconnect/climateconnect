import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import GroupWorkOutlinedIcon from "@mui/icons-material/GroupWorkOutlined";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import Value from "./Value";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    marginTop: theme.spacing(5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      paddingTop: theme.spacing(4),
    },
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },
  textBody: {
    color: "white",
    fontWeight: 600,
    maxWidth: 700,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      textAlign: "center",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: 0,
    },
  },
  yellow: {
    color: theme.palette.yellow.main,
  },
  valuesListWrapper: {
    display: "flex",
    paddingLeft: theme.spacing(16),
    position: "relative",
    [theme.breakpoints.down("md")]: {
      paddingLeft: 0,
      paddingTop: 40,
      width: "100%",
      justifyContent: "center",
    },
  },
  leftValuesWrapper: {
    marginRight: theme.spacing(3),
    marginTop: theme.spacing(6),
    zIndex: 1,
  },
  rightValuesWrapper: {
    zIndex: 1,
  },
  bigCloudContainer: {
    background: "url('/images/about-values-cloud.svg')",
    position: "absolute",
    top: -40,
    left: -15,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    width: 550,
    [theme.breakpoints.down("md")]: {
      left: 0,
      right: 0,
      marginLeft: "auto",
      marginRight: "auto",
      width: 550,
      top: 0,
    },
    [theme.breakpoints.down("sm")]: {
      left: -30,
      top: 5,
    },
  },
  bigCloudImg: {
    visibility: "hidden",
    height: 460,
  },
}));

export default function Values({ headlineClass }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  return (
    <div className={classes.root}>
      <Container className={classes.wrapper}>
        <div>
          <Typography className={`${headlineClass} ${"" /*TODO(undefined) classes.headline*/}`}>
            {texts.our_values}
          </Typography>
          <Typography className={classes.textBody}>
            {texts.climate_connect_is_a_donation_funded_ngo}{" "}
            {texts.being_an_independent_organisation_allows_us_to_work_with}{" "}
            {texts.this_is_also_why_we_include_our_community_as_much_as_possible}
          </Typography>
        </div>
        <div className={classes.valuesListWrapper}>
          <div className={classes.leftValuesWrapper}>
            <Value iconSrc="/icons/donate-icon-bold.svg" text={texts.free_and_nonprofit} />
            <Value icon={{ src: LockOpenIcon }} text={texts.open_source} />
          </div>
          <div className={classes.rightValuesWrapper}>
            <Value icon={{ src: GroupWorkOutlinedIcon }} text={texts.community_driven} />
            <Value iconSrc="/icons/independent-icon.svg" text={texts.independent} />
          </div>
          <div className={classes.bigCloudContainer}>
            <img src="/images/about-values-cloud.svg" className={classes.bigCloudImg} />
          </div>
        </div>
      </Container>
    </div>
  );
}
