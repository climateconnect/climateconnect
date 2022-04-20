import { Button, makeStyles, useMediaQuery } from "@material-ui/core";
import LanguageIcon from "@material-ui/icons/Language";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { getCookieProps } from "../../../public/lib/cookieOperations";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import StyledMenu from "../general/StyledMenu";
import StyledMenuItem from "../general/StyledMenuItem";

const useStyles = makeStyles((theme) => ({
  root: (props) => ({
    color: props.transparentHeader ? "white" : theme.palette.primary.main,
    cursor: "pointer",
  }),
  languageIcon: {
    fontSize: 16,
  },
  popover: {
    pointerEvents: "none",
  },
  popoverContent: {
    pointerEvents: "auto",
  },
  centerText: {
    textAlign: "center",
  },
}));

/**
 * Hover button that's used in the global navbar to switch
 * between multiple languages on hover (currently German and
 * English).
 */
export default function LanguageSelect({ transparentHeader }) {
  const classes = useStyles({ transparentHeader: transparentHeader });
  const { locale, locales, startLoading } = useContext(UserContext);
  const buttonRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(buttonRef.current);
  const [open, setOpen] = useState(false);
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const router = useRouter();
  useEffect(function () {
    setAnchorEl(buttonRef.current);
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleToggleOpen = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageClick = (e, newLocale) => {
    e.preventDefault();
    setOpen(false);
    if (newLocale !== locale) {
      const now = new Date();
      const cookies = new Cookies();
      const expiry = new Date(now.setFullYear(now.getFullYear() + 1));
      const cookieProps = getCookieProps(expiry);
      cookies.set("NEXT_LOCALE", newLocale, cookieProps);
      const hasHash = router.asPath.split("#").length > 1;
      if (hasHash) {
        window.location = "/" + newLocale + router.asPath;
        startLoading();
      } else {
        router.push(router.asPath, router.asPath, { locale: newLocale });
      }
    }
  };

  const hoverButtonProps = {};

  if (!isNarrowScreen) {
    (hoverButtonProps.onMouseEnter = handleOpen), (hoverButtonProps.onMouseLeave = handleClose);
  }

  // TODO: this could be generalized into a HoverButton component,
  // and used in the Welcome Blurb feature on /hubs
  return (
    <>
      <Button
        {...hoverButtonProps}
        className={classes.root}
        ref={buttonRef}
        aria-owns="language-select"
        aria-haspopup="true"
        onClick={handleToggleOpen}
        startIcon={<LanguageIcon className={classes.languageIcon} />}
      >
        {locale}
      </Button>
      <StyledMenu
        id="language-select"
        className={classes.popover}
        classes={{
          paper: classes.popoverContent,
        }}
        anchorEl={anchorEl}
        onClose={handleClose}
        keepMounted
        open={open}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        container={anchorEl?.parentNode}
        PaperProps={{ onMouseEnter: handleOpen, onMouseLeave: handleClose }}
      >
        {locales?.map((l, index) => (
          <StyledMenuItem
            key={index}
            className={classes.centerText}
            selected={l === locale}
            dense={!isMediumScreen}
            onClick={(e) => handleLanguageClick(e, l)}
          >
            {l.toUpperCase()}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
}
