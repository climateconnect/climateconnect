import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import DonorForestExplainerDialog from "./DonorForestExplainerDialog";

const useStyles = makeStyles((theme) => ({
  explainerContainer: {
    background: theme.palette.primary.extraLight,
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderRadius: 15,
    width: 360,
    textAlign: "center",
    zIndex: 1,
  },
  headline: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  text: {
    fontWeight: 600,
  },
  donateButton: {
    marginTop: theme.spacing(1.5),
    width: 220,
  },
  link: {
    textDecoration: "underline",
    fontWeight: 600,
    marginTop: theme.spacing(1.5),
    cursor: "pointer",
  },
}));

export default function DonorForestExplainer({ className, possibleBadges }) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "donate", locale: locale });

  const handleOpenExplainerDialog = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={`${className} ${classes.explainerContainer}`}>
      <Typography className={classes.headline} color="primary">
        {texts.forest_explainer_headline}
      </Typography>
      <Typography className={classes.text}>{texts.forest_explainer_text}</Typography>
      <Button
        variant="contained"
        color="primary"
        href={getLocalePrefix(locale) + "/donate"}
        className={classes.donateButton}
      >
        {texts.donate}
      </Button>
      <Typography onClick={handleOpenExplainerDialog} className={classes.link}>
        {texts.how_it_works}
      </Typography>
      <DonorForestExplainerDialog
        open={open}
        onClose={handleClose}
        possibleBadges={possibleBadges}
      />
    </div>
  );
}
