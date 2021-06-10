import { PropTypes } from "prop-types";
import React, { useContext } from "react";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import germanStrings from "react-timeago/lib/language-strings/de";
import englishStrings from "react-timeago/lib/language-strings/en";
import UserContext from "../context/UserContext";

const ONE_WEEK_IN_MINISECONDS = 1000 * 60 * 60 * 24 * 7;

export default function DateDisplay({ date, className }) {
  const { locale } = useContext(UserContext);
  const formatters = {
    de: germanStrings,
    en: englishStrings,
  };
  const formatter = buildFormatter(formatters[locale]);
  const olderThanOneWeek = new Date() - date > ONE_WEEK_IN_MINISECONDS;
  return (
    <span className={className ? className : {}}>
      {olderThanOneWeek ? (
        new Intl.DateTimeFormat(locale).format(date)
      ) : (
        <TimeAgo date={date} formatter={formatter} />
      )}
    </span>
  );
}

DateDisplay.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  className: PropTypes.string,
};
