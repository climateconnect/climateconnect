import { Button, makeStyles, Menu, MenuItem, useMediaQuery, withStyles } from "@material-ui/core";
import LanguageIcon from "@material-ui/icons/Language";
import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import { getCookieProps } from "../../../public/lib/cookieOperations";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";

const useStyles = makeStyles(() => ({
  languageIcon: {
    fontSize: 16,
  },
}));

export default function LanguageSelect() {
  const classes = useStyles();
  const { locale, locales } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageClick = (e, newLocale) => {
    e.preventDefault();
    setAnchorEl(null);
    if (newLocale !== locale) {
      const now = new Date();
      const cookies = new Cookies();
      const expiry = new Date(now.setFullYear(now.getFullYear() + 1));
      const cookieProps = getCookieProps(expiry);
      cookies.set("NEXT_LOCALE", newLocale, cookieProps);
      router.push(router.asPath, router.asPath, { locale: newLocale });
    }
  };

  console.log(locales);

  return (
    <>
      <Button onClick={handleClick} color="primary">
        <LanguageIcon className={classes.languageIcon} />
        {locale}
      </Button>
      <StyledMenu anchorEl={anchorEl} onClose={handleClose} open={Boolean(anchorEl)} keepMounted>
        {locales.map((l, index) => (
          <StyledMenuItem
            key={index}
            selected={l === locale}
            dense={!isNarrowScreen}
            onClick={(e) => handleLanguageClick(e, l)}
          >
            {l.toUpperCase()}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
}

const StyledMenu = withStyles({
  paper: {
    width: 64,
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(() => ({
  root: {
    color: "primary",
    textAlign: "center",
    fontWeight: 600,
  },
  selected: {
    color: "white",
  },
}))(MenuItem);
