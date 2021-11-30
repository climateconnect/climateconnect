import { Container, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import SmallCloud from "./SmallCloud";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    marginBottom: props.fixedHeight || props.noMarginBottom ? 0 : theme.spacing(2),
  }),
  contentContainer: (props) => ({
    display: "flex",
    alignItems: "center",
    padding: props.fixedHeight ? 0 : theme.spacing(3),
    position: "relative",
    height: props.fixedHeight && 0,
    [theme.breakpoints.down("md")]: {
      padding: 0,
    },
  }),
  headersContainer: {
    position: "absolute",
    width: 500,
    top: -75,
    background: theme.palette.primary.main,
    padding: theme.spacing(2),
    border: `2px solid ${theme.palette.primary.light}`,
    boxShadow: "5px 5px 5px #00000029",
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(1),
      left: theme.spacing(1),
    },
    [theme.breakpoints.down("xs")]: {
      width: 350,
      left: theme.spacing(0.5),
    },
  },
  headline: {
    color: theme.palette.yellow.main,
    fontSize: 40,
    fontWeight: "bold",
    [theme.breakpoints.down("md")]: {
      fontSize: 25,
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: 20,
    },
  },
  subHeader: {
    fontSize: 19,
    fontWeight: 600,
    color: "white",
    [theme.breakpoints.down("md")]: {
      fontSize: 17,
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: 16,
      fontWeight: 500,
    },
  },
  mobileSubheaderContainer: {
    marginTop: 30,
  },
  imageContainer: {
    backgroundImage: "url('/images/static_page_header.svg')",
    backgroundSize: "cover",
    borderBottom: `1px solid ${theme.palette.primary.light}`,
  },
  image: {
    width: "100%",
    maxWidth: 1720,
    minHeight: 100,
    visibility: "hidden",
    [theme.breakpoints.up("md")]: {
      minHeight: 125,
    },
  },
}));

export default function TopSection({ headline, subHeader, fixedHeight, noMarginBottom }) {
  const classes = useStyles({
    fixedHeight: fixedHeight,
    noMarginBottom: noMarginBottom,
  });
  return (
    <div className={classes.root}>
      <div className={classes.imageContainer}>
        <img src="/images/static_page_header.svg" className={classes.image} />
      </div>
      <Container className={classes.contentContainer}>
        <div className={classes.headersContainer}>
          <Typography component="h1" className={classes.headline}>
            {headline}
          </Typography>
          <Typography component="h2" className={classes.subHeader}>
            {subHeader}
          </Typography>
          <SmallCloud type={1} className={classes.smallCloud1} />
        </div>
      </Container>
    </div>
  );
}
