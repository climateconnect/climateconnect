import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../../public/lib/apiOperations";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import GenericDialog from "../../dialogs/GenericDialog";
import DonorBadgeExplainerList from "./DonorBadgeExplainerList";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 500,
  },
  explainerText: {
    fontSize: 16,
  },
  avatar: {
    width: 60,
    height: 60,
  },
  callToActionText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  donateButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
}));

export default function DonorForestExplainerDialog({ onClose, open, possibleBadges }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "donate", locale: locale });
  return (
    <GenericDialog onClose={onClose} open={open} title={texts.forest_explainer_dialog_title}>
      <div className={classes.root}>
        <Typography className={classes.explainerText}>
          {texts.donor_forest_dialog_explainer_text}
        </Typography>
        <DonorBadgeExplainerList possibleBadges={possibleBadges} />
        <Typography className={classes.callToActionText}>
          {texts.donor_forest_dialog_call_to_action_text}
        </Typography>
        <div className={classes.donateButtonContainer}>
          <Button href={`${getLocalePrefix(locale)}/donate`} color="primary" variant="contained">
            {texts.donate}
          </Button>
        </div>
      </div>
    </GenericDialog>
  );
}
