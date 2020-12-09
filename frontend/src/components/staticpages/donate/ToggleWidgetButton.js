import React from "react";
import { makeStyles, Button } from "@material-ui/core";
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
          Donate now
        </Button>
      </div>
      {goal_name && (
        <DonationGoal
          name={goal_name}
          current={current_amount}
          goal={goal_amount}
          className={classes.donationGoal}
        />
      )}
      <DonationWigetDialog open={overlayOpen} title="" onClose={handleDialogClose} />
    </>
  );
}
