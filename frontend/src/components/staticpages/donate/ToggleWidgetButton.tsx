import { Button } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import DonationWigetDialog from "../../dialogs/DonationWigetDialog";
import DonationGoal from "./DonationGoal";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: 0,
    zIndex: 1,
    width: "100vw",
    display: "flex",
  },
  button: {
    width: "100%",
    borderRadius: 0,
    background: theme.palette.primary.light,
  },
}));

export default function ToggleWidgetButton({
  overlayOpen,
  setOverlayOpen,
  goal_name,
  current_amount,
  goal_amount,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "donate", locale: locale, classes: classes });

  const handleDialogClose = () => {
    setOverlayOpen(false);
  };

  const handleClickDialogOpen = () => {
    setOverlayOpen(true);
  };

  return (
    <>
      <div className={classes.root}>
        <Button
          size="large"
          variant="contained"
          className={classes.button}
          onClick={handleClickDialogOpen}
        >
          {texts.donate_now}
        </Button>
      </div>
      {goal_name && (
        <DonationGoal
          name={goal_name}
          current={current_amount}
          goal={goal_amount}
          /*TODO(undefined) className={classes.donationGoal} */
        />
      )}
      <DonationWigetDialog open={overlayOpen} title="" onClose={handleDialogClose} />
    </>
  );
}
