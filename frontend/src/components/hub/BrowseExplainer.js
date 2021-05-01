import { Container, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  browseExplainer: {
    fontSize: 18,
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  headline: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: 22,
    marginBottom: theme.spacing(2),
  },
}));

export default function BrowseExplainer() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  return (
    <Container>
      <Typography component="div" className={classes.browseExplainer}>
        <Typography component="h2" className={classes.headline}>
          {texts.browse_explainer_text}
        </Typography>
      </Typography>
    </Container>
  );
}
