import { Button, makeStyles, useMediaQuery } from "@material-ui/core";
import { useRouter } from "next/router";
import Cookies from "universal-cookie";
import React, { useContext, useEffect, useRef, useState } from "react";

import SelectDialog from "../dialogs/SelectDialog";
import { getCookieProps } from "../../../public/lib/cookieOperations";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";

import getTexts from "../../../public/texts/texts";

// TODO(piper): should export this and reuse
const getAvailabilityOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/availability/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

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

// TODO(pipeR):
// https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering
export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const texts = getTexts({ page: "organization", locale: ctx.locale });

  // if (ctx.req && !token) {
  //   const message = texts.you_have_to_log_in_to_manage_organization_members;
  //   return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  // }

  const [availabilityOptions] = await Promise.all([getAvailabilityOptions(token, ctx.locale)]);

  return {
    availabilityOptions: availabilityOptions,
    token: token,
  };
}

export default function RequestMembershipButton({ transparentHeader, token, availabilityOptions }) {
  const classes = useStyles({ transparentHeader: transparentHeader });
  const { locale, locales, startLoading } = useContext(UserContext);
  const buttonRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(buttonRef.current);

  const [open, setOpen] = useState(false);
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const texts = getTexts({ page: "profile", locale: locale });
  const router = useRouter();

  // TODO: fix, can't request to join a project you're already a member of!
  useEffect(() => {
    setAnchorEl(buttonRef.current);
  }, []);

  const handleToggleOpen = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAvailbilitySelection = (e, newLocale) => {
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

  return (
    <>
      <Button
        aria-haspopup="true"
        aria-owns="language-select"
        className={classes.root}
        onClick={handleToggleOpen}
        ref={buttonRef}
      >
        Request to join
      </Button>
      <SelectDialog
        onClose={handleClose}
        open={open}
        // * TODO(Piper): fix availability options here
        values={[{}]}
        // values={availabilityOptions}
        title={"Availability"}
        label={texts.hours_contributed_per_week}
      />
    </>
  );
}
