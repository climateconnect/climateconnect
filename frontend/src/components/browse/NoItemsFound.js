import { makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => {
  return {
    infoMessage: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

export default function NoItemsFound() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <Typography component="h4" variant="h5" className={classes.infoMessage}>
      {texts.no_results}
    </Typography>
  );
}
