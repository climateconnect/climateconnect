import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import FixedPreviewCards from "./FixedPreviewCards";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    maxWidth: 1280,
    margin: "0 auto",
  },
  headline: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      fontSize: 21,
      marginBottom: theme.spacing(2),
    },
  },
  explainerText: {
    maxWidth: 750,
    marginBottom: theme.spacing(3),
  },
}));

export default function HubsBox({ hubs, isLoading }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale, classes: classes });
  return (
    <div className={classes.root}>
      <Typography color="primary" component="h1" className={classes.headline}>
        {texts.find_climate_projects_in_each_sector_in_our_hubs}
      </Typography>
      <Typography color="secondary" className={classes.explainerText}>
        {texts.find_climate_projects_in_each_sector_in_our_hubs_text}
      </Typography>
      <FixedPreviewCards isLoading={isLoading} elements={hubs} type="hub" />
    </div>
  );
}
