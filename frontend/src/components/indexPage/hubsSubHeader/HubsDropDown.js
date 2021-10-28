import { Button, makeStyles } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import React, { useRef } from "react";
import DropDownList from "../../header/DropDownList";

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

export default function HubsDropDown({
  open,
  hubs,
  label,
  isNarrowScreen,
  onToggleOpen,
  onOpen,
  onClose,
}) {
  const classes = useStyles();
  const buttonRef = useRef(null);

  const toggleButtonProps = {};
  if (!isNarrowScreen) {
    toggleButtonProps.onMouseEnter = onOpen;
    toggleButtonProps.onMouseLeave = onClose;
  }

  const handleBlur = () => {
    if (isNarrowScreen) {
      onClose();
    }
  };

  return (
    <span onBlur={handleBlur}>
      <Button
        {...toggleButtonProps}
        onClick={onToggleOpen}
        aria-haspopup="true"
        ref={buttonRef}
        className={classes.hubsDropDownButton}
      >
        {label}
        <ArrowDropDownIcon />
      </Button>
      <DropDownList
        buttonRef={buttonRef}
        handleOpen={onOpen}
        items={hubs.map((h) => ({
          href: `/hubs/${h.url_slug}/`,
          text: h.name,
        }))}
        handleClose={onClose}
        open={open}
      />
    </span>
  );
}
