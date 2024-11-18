import { Button, ButtonProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, { useContext, useRef } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import DropDownList from "../../header/DropDownList";
import {buildHubUrl} from "../../../../public/lib/urlBuilder";

type MakeStylesProps = {
  height: number;
};

const useStyles = makeStyles((theme) => ({
  hubsDropDownButton: (props: MakeStylesProps) => ({
    textTransform: "none",
    color: "white",
    fontSize: 16,
    height: props.height ? props.height : 54,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  }),
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
  height,
}: any) {
  const classes = useStyles({ height: height });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popperRef = useRef<HTMLAnchorElement | null>(null);
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });

  const toggleButtonProps: ButtonProps = {};
  if (!isNarrowScreen) {
    toggleButtonProps.onMouseEnter = onOpen;
    toggleButtonProps.onMouseLeave = onClose;
  }

  const handleBlur = (e) => {
    if (isNarrowScreen && !popperRef?.current?.contains(e.relatedTarget)) {
      onClose();
    }
  };

  const dropDownHubItems = hubs.map((h) => ({
    // href: `/hubs/${h.url_slug}/`,
    href: buildHubUrl({hubUrlSlug: h?.url_slug, pathType: "hubBrowse" }),
    text: h.name,
  }));

  const dropDownItems = addLocationHubExplainerLink
    ? [
        ...dropDownHubItems,
        {
          href: `/browse`,
          text: texts.all_locations,
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
