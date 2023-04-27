import React from "react";
import GenericDialog from "./GenericDialog";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles(() => ({
  widget: {
    height: "100%",
    width: "100%",
  },
}));

export default function DonationWigetDialog({ onClose, open, title }) {
  const classes = useStyles();
  const handleClose = () => {
    onClose();
  };

  return (
    <GenericDialog open={open} title={title} onClose={handleClose} fullScreen maxWidth="lg">
      <iframe
        src="https://spenden.twingle.de/climate-connect-gug-haftungsbeschrankt/climate-connect/tw5ee1f393e9a58/widget"
        className={classes.widget}
      />
    </GenericDialog>
  );
}
