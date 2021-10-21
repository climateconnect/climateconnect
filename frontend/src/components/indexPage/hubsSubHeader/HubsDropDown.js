import { Button, makeStyles } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import React, { useRef, useState } from "react";
import DropDownList from "./DropDownList";

const useStyles = makeStyles((theme) => ({
  hubsDropDownButton: {
    textTransform: "none",
    color: "white",
    fontSize: 16,
    height: 54,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

export default function HubsDropDown({ hubs, label, isNarrowScreen }) {
  const classes = useStyles();
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggleOpen = (e) => {
    e.preventDefault();
    setOpen(!open);
  };

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleButtonProps = {};
  if (!isNarrowScreen) {
    toggleButtonProps.onMouseEnter = handleOpen;
    toggleButtonProps.onMouseLeave = handleClose;
  }

  return (
    <>
      <Button
        {...toggleButtonProps}
        onClick={handleToggleOpen}
        aria-haspopup="true"
        ref={buttonRef}
        className={classes.hubsDropDownButton}
      >
        {label}
        <ArrowDropDownIcon />
      </Button>
      <DropDownList
        buttonRef={buttonRef}
        handleOpen={handleOpen}
        hubs={hubs}
        handleClose={handleClose}
        open={open}
      />
    </>
  );
}
