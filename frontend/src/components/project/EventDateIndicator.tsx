import React, { useContext } from "react";
import { Tooltip, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { getDateAndTime, getDayAndMonth, getTime } from "../../../public/lib/dateOperations";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  eventDateIndicator: (props: any) => ({
    position: "absolute",
    top: 0,
    right: 20,
    background: props.isInPast
      ? props.isCustomHub
        ? theme.palette.grey.light
        : theme.palette.secondary.extraLight
      : props.isCustomHub
      ? theme.palette.primary.main
      : theme.palette.yellow.main,
    // background: props.isInPast ? theme.palette.secondary.extraLight : theme.palette.yellow.main,
    zIndex: 9,
    borderRadius: "0px 0px 8px 8px",
    padding: theme.spacing(1),
    boxShadow: `2px 3px 7px -2px ${theme.palette.text.primary}`,
  }),
  date: {
    fontWeight: 700,
    fontSize: 21,
    lineHeight: 1,
    textAlign: "center",
  },
  time: {
    fontWeight: 600,
    textAlign: "center",
    lineHeight: 1,
  },
  text: (props: any) => ({
    color: props.isInPast
      ? props.isCustomHub
        ? theme.palette.text.primary
        : theme.palette.secondary.main
      : theme.palette.background.default_contrastText,
  }),
}));

export default function EventDateIndicator({ project, hubUrl }) {
  const { CUSTOM_HUB_URLS } = useContext(UserContext)
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);

  const start_date = new Date(project.start_date);
  const end_date = new Date(project.end_date);
  const classes = useStyles({ isInPast: new Date() > end_date, isCustomHub });
  const ONE_DAY_IN_MILISECONDS = 1000 * 60 * 60 * 24;
  const event_duration = end_date.getTime() - start_date.getTime();
  const isMultiDayEvent =
    start_date.getDate() !== start_date.getDate() || event_duration > ONE_DAY_IN_MILISECONDS;

  return (
    <Tooltip title={`${getDateAndTime(start_date)} - ${getDateAndTime(end_date)}`}>
      <div className={classes.eventDateIndicator}>
        {isMultiDayEvent ? (
          <Typography className={`${classes.date} ${classes.text}`}>{`${getDayAndMonth(
            start_date
          )} - ${getDayAndMonth(end_date)}`}</Typography>
        ) : (
          <>
            <Typography className={`${classes.date} ${classes.text}`}>
              {getDayAndMonth(start_date)}
            </Typography>
            <Typography className={`${classes.time} ${classes.text}`}>
              {getTime(start_date)}
            </Typography>
          </>
        )}
      </div>
    </Tooltip>
  );
}
