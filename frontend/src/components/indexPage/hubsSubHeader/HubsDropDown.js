import { Button, makeStyles } from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import React, { useContext, useRef } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
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

//Generic component to show a list of hubs in the HubsSubHeader
export default function HubsDropDown({
  open,
  hubs,
  label,
  isNarrowScreen,
  onToggleOpen,
  onOpen,
  onClose,
  addLocationHubExplainerLink,
}) {
  const classes = useStyles();
  const buttonRef = useRef(null);
  const popperRef = useRef(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });

  const toggleButtonProps = {};
  if (!isNarrowScreen) {
    toggleButtonProps.onMouseEnter = onOpen;
    toggleButtonProps.onMouseLeave = onClose;
  }

  const handleBlur = (e) => {
    if (isNarrowScreen && !popperRef?.current.contains(e.relatedTarget)) {
      onClose();
    }
  };

  const dropDownHubItems = hubs.map((h) => ({
    href: `/hubs/${h.url_slug}/`,
    text: h.name,
  }));

  const dropDownItems = addLocationHubExplainerLink
    ? [
        ...dropDownHubItems,
        {
          href: `/climatehubs`,
          text: texts.more_info,
        },
      ]
    : [...dropDownHubItems];

  return (
    <span onBlur={handleBlur} id={`dropdown-${label.toLowerCase()}`}>
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
        items={dropDownItems}
        handleClose={onClose}
        open={open}
        popperRef={popperRef}
      />
    </span>
  );
}
