import { Button, ButtonProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useRouter } from "next/router";
import React, { useContext, useRef } from "react";
import getTexts from "../../../../public/texts/texts";
import UserContext from "../../context/UserContext";
import DropDownList from "../../header/DropDownList";

type MakeStylesProps = {
  height: number;
};

const useStyles = makeStyles((theme) => ({
  hubsDropDownButton: (props: MakeStylesProps) => ({
    textTransform: "none",
    color: theme.palette.primary.contrastText,
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
  const { locale, user } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
  const router = useRouter();
  const isEventsPage = router.pathname.includes("events");

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

  const currentHash = typeof window !== "undefined" ? window.location.hash : "";
  const dropDownHubItems = hubs.map((h) => ({
    href: isEventsPage
      ? `/hubs/${h.url_slug}/events`
      : (!user && h.landing_page_component ? `/hubs/${h.url_slug}` : `/hubs/${h.url_slug}/browse`) +
        currentHash,
    text: h.name,
  }));
  const allLocationsHref = isEventsPage ? "/events" : `/browse${currentHash}`;

  const dropDownItems = addLocationHubExplainerLink
    ? [
        ...dropDownHubItems,
        {
          href: allLocationsHref,
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
