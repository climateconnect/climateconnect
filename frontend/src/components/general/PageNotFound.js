import { Link, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(5),
  },
}));

export default function PageNotFound({ itemName, returnText, returnLink }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  return (
    <div className={classes.root}>
      <Typography variant="h1">
        {itemName ? `${itemName} ` : texts.page + " "} {texts.not_found_lowercase}
      </Typography>
      <p>
        <Link href={returnLink ? returnLink : "/browse"}>
          {returnText ? returnText : texts.return_to_home}
        </Link>
      </p>
    </div>
  );
}
