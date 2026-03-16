import React, { useContext } from "react";
import { Link } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import UserContext from "../context/UserContext";
import { getWasseraktionswochenUrl } from "../../../public/data/wasseraktionswochen_config.js";

const useStyles = makeStyles((theme) => ({
  wasseraktionsLink: {
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  wasseraktionsButton: {
    backgroundColor: "#D5F1FF",
    color: theme.palette.primary.main,
    borderRadius: theme.spacing(3),
    padding: theme.spacing(0.75, 2),
    fontWeight: 600,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    columnGap: theme.spacing(1),
    "&:hover": {
      backgroundColor: "#C0E6FF",
      textDecoration: "none",
    },
  },
  wasseraktionsIcon: {
    width: 20,
    height: 20,
    flexShrink: 0,
  },
}));

export default function WasseraktionswochenLink() {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const wasseraktionswochenUrl = getWasseraktionswochenUrl(locale);

  return (
    <Link
      className={`${classes.wasseraktionsLink} ${classes.wasseraktionsButton}`}
      href={wasseraktionswochenUrl}
      underline="none"
      aria-label="Wasseraktionswochen campaign"
    >
      <img
        src="/icons/actionswochenlogo-icon.png"
        alt=""
        role="presentation"
        className={classes.wasseraktionsIcon}
      />
      Wasseraktionswochen
    </Link>
  );
}
