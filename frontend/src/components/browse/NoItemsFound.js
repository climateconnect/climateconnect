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

export default function NoItemsFound({ type, hubName }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "filter_and_search", locale: locale, filterType: type, hubName: hubName });
  return (
    <Typography component="h4" variant="h5" className={classes.infoMessage}>
      {texts.could_not_find_any_items_of_type}
    </Typography>
  );
}
