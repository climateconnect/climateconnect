import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import TextLoop from "react-text-loop";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import LoadingSpinner from "../../general/LoadingSpinner";

const useStyles = makeStyles((theme) => ({
  spinner: {
    marginBottom: theme.spacing(2),
  },
  root: {
    textAlign: "center",
    marginBottom: theme.spacing(8),
  },
  text: {
    [theme.breakpoints.down("sm")]: {
      fontSize: 12,
    },
  },
}));

export default function IdeaCreationLoadingScreen() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "idea", locale: locale });
  return (
    <div className={classes.root}>
      <LoadingSpinner isLoading className={classes.spinner} />
      <TextLoop mask={true} interval={3000}>
        <Typography className={classes.text}>{texts.sending_your_idea_to_our_server}...</Typography>
        <Typography className={classes.text}>
          {texts.saving_your_idea_in_our_database}...
        </Typography>
        <Typography className={classes.text}>
          {texts.preparing_your_idea_to_be_published}...
        </Typography>
        <Typography className={classes.text}>{texts.publishing_your_idea}...</Typography>
      </TextLoop>
    </div>
  );
}
