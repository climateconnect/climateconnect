import { Link as MuiLink, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import GenericDialog from "../dialogs/GenericDialog";
import { getLocalePrefix } from "../../../public/lib/apiOperations";

const useStyles = makeStyles((theme) => ({
  calendarOptionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
    paddingBottom: theme.spacing(2),
  },
  calendarOption: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.spacing(1),
    textDecoration: "none",
    color: theme.palette.text.primary,
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: theme.palette.grey[50],
    },
  },
  calendarOptionLabel: {
    fontWeight: 500,
  },
  registrationReminder: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    fontSize: 14,
  },
  registered: {
    backgroundColor: theme.palette.success?.light || "#e8f5e9",
    color: theme.palette.success?.dark || "#2e7d32",
  },
  notRegistered: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.secondary,
  },
}));

type Props = {
  open: boolean;
  onClose: (_value: boolean) => void;
  slug: string;
  locale: string;
  isEvent: boolean;
  registrationConfig: any;
  isUserRegistered: boolean;
  user: any;
  texts: any;
};

export default function AddToCalendarDialog({
  open,
  onClose,
  slug,
  locale,
  isEvent,
  registrationConfig,
  isUserRegistered,
  user,
  texts,
}: Props) {
  const classes = useStyles();
  const localePrefix = getLocalePrefix(locale);

  const handleClose = () => {
    onClose(false);
  };

  const icalUrl = `${localePrefix}/projects/${slug}.ical`;
  const googleCalUrl = `${localePrefix}/projects/${slug}/add-to-google-calendar`;
  const outlookUrl = `${localePrefix}/projects/${slug}/add-to-outlook`;

  const showRegistrationReminder =
    isEvent && registrationConfig && !registrationConfig.is_draft && user;

  return (
    <GenericDialog onClose={handleClose} open={open} title={texts.add_to_calendar}>
      <div className={classes.calendarOptionsContainer}>
        <MuiLink href={googleCalUrl} className={classes.calendarOption} underline="none">
          <Typography className={classes.calendarOptionLabel}>
            {texts.add_to_google_calendar}
          </Typography>
        </MuiLink>
        <MuiLink href={icalUrl} className={classes.calendarOption} underline="none">
          <Typography className={classes.calendarOptionLabel}>
            {texts.add_to_apple_calendar}
          </Typography>
        </MuiLink>
        <MuiLink href={outlookUrl} className={classes.calendarOption} underline="none">
          <Typography className={classes.calendarOptionLabel}>{texts.add_to_outlook}</Typography>
        </MuiLink>
      </div>
      {showRegistrationReminder && (
        <div
          className={`${classes.registrationReminder} ${
            isUserRegistered ? classes.registered : classes.notRegistered
          }`}
        >
          {isUserRegistered
            ? texts.you_are_registered_for_this_event
            : texts.not_registered_yet_reminder}
        </div>
      )}
    </GenericDialog>
  );
}
