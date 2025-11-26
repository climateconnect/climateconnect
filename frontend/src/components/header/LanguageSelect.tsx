import { Button, Theme, useMediaQuery, Popper, Paper, MenuList } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import LanguageIcon from "@mui/icons-material/Language";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { getCookieProps } from "../../../public/lib/cookieOperations";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import StyledMenu from "../general/StyledMenu";
import StyledMenuItem from "../general/StyledMenuItem";

const useStyles = makeStyles<
  Theme,
  {
    transparentHeader: boolean;
    isCustomHub: boolean;
    isNarrowScreen: boolean;
    isLandingPage?: boolean;
  }
>((theme) => ({
  root: (props) => ({
    color:
      props.transparentHeader || (props.isLandingPage && !props.isNarrowScreen)
        ? "white"
        : props.isCustomHub
        ? !props.isNarrowScreen
          ? theme.palette.primary.contrastText
          : theme.palette.background.default_contrastText
        : theme.palette.primary.main,
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
  popper: {
    width: "67px",
    zIndex: 99,
  },
}));

/**
 * Hover button that's used in the global navbar to switch
 * between multiple languages on hover (currently German and
 * English).
 */
type LanguageSelectProps = {
  transparentHeader?: boolean;
  isCustomHub: boolean;
  isLandingPage?: boolean;
};

export default function LanguageSelect({
  transparentHeader = false,
  isCustomHub,
  isLandingPage = false,
}: LanguageSelectProps) {
  const { locale, locales, startLoading } = useContext(UserContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(buttonRef.current);
  const [open, setOpen] = useState(false);
  const isMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const classes = useStyles({ transparentHeader, isCustomHub, isNarrowScreen, isLandingPage });
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
        window.location.href = "/" + newLocale + router.asPath;
        startLoading();
      } else {
        router.push(router.asPath, router.asPath, { locale: newLocale });
      }
    }
  };

  const hoverButtonProps: any = {};

  if (!isNarrowScreen) {
    (hoverButtonProps.onMouseEnter = handleOpen), (hoverButtonProps.onMouseLeave = handleClose);
  }

  // TODO: this could be generalized into a HoverButton component,
  // and used in the Welcome Blurb feature on /hubs

  const MenuItems = () => (
    <>
      {locales?.map((l) => (
        <StyledMenuItem
          key={l}
          className={classes.centerText}
          selected={l === locale}
          dense={!isMediumScreen}
          onClick={(e) => handleLanguageClick(e, l)}
        >
          {l.toUpperCase()}
        </StyledMenuItem>
      ))}
    </>
  );

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
      {isNarrowScreen ? (
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
          <MenuItems />
        </StyledMenu>
      ) : (
        // For some reason, the StyledMenu component doesn't work as expected on Desktop
        // so we use the Popper and Paper component instead of StyledMenu
        // (on our new home page, we have focus problem with StyledMenu)
        (<Popper open={open} anchorEl={buttonRef.current} className={classes.popper}>
          <Paper {...hoverButtonProps} className={classes.paper}>
            <MenuList>
              <MenuItems />
            </MenuList>
          </Paper>
        </Popper>)
      )}
    </>
  );
}
