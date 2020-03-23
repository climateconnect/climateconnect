import React from "react";
import { PropTypes } from "prop-types";
import TimeAgo from "react-timeago";
const ONE_WEEK_IN_MINISECONDS = 1000 * 60 * 60 * 24 * 7;

export default function DateDisplay({ date, className }) {
  const olderThanOneWeek = new Date() - date > ONE_WEEK_IN_MINISECONDS;
  return (
    <span className={className ? className : {}}>
      {olderThanOneWeek ? new Intl.DateTimeFormat("en-US").format(date) : <TimeAgo date={date} />}
    </span>
  );
}

DateDisplay.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  className: PropTypes.string
};
