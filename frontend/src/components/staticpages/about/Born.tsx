import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import HoverImage from "../HoverImage";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  textBlock: {
    color: "white",
    fontWeight: 600,
    [theme.breakpoints.down("md")]: {
      textAlign: "center",
      fontWeight: 500,
      fontSize: 18,
      marginTop: theme.spacing(3),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  textWrapper: {
    marginRight: theme.spacing(3),
    [theme.breakpoints.down("md")]: {
      marginRight: 0,
      marginTop: theme.spacing(3),
    },
  },
  imageWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    flexGrow: 1,
    padding: theme.spacing(6),
    maxHeight: 300,
    [theme.breakpoints.down("md")]: {
      maxHeight: 400,
      padding: 0,
      marginTop: theme.spacing(7),
      marginBottom: theme.spacing(7),
      paddingRight: theme.spacing(3),
      width: "80%",
      maxWidth: 630,
    },
  },
  hoverImage: {
    width: 300,
    height: 200,
    [theme.breakpoints.down("md")]: {
      width: "100%",
      height: "auto",
    },
  },
}));

export default function Born({ className, headlineClass }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "about", locale: locale });
  return (
    <div className={`${classes.root} ${className}`}>
      <Container className={classes.wrapper}>
        <div className={classes.textWrapper}>
          <Typography component="h1" className={headlineClass}>
            {texts.climate_connect_was_born}
          </Typography>
          <Typography className={classes.textBlock}>
            {texts.climate_connect_was_born_text}
          </Typography>
        </div>
        <div className={classes.imageWrapper}>
          <HoverImage
            src="/images/networking-event.jpg"
            text={texts.climate_connect_was_born_image_text}
            className={classes.hoverImage}
          />
        </div>
      </Container>
    </div>
  );
}
