import PropTypes from "prop-types";
import React, { useContext } from "react";
// TODO upgrade react-timeago to latest version when possible
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import germanStrings from "react-timeago/lib/language-strings/de";
import englishStrings from "react-timeago/lib/language-strings/en";
import UserContext from "../context/UserContext";

const ONE_WEEK_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 7;

const shorten = (strings, languageCode) => {
  const about_in_language = {
    en: "about ",
    de: "etwa ",
  };
  return Object.keys(strings).reduce((shortenedStrings, curKey) => {
    shortenedStrings[curKey] = strings[curKey]
      ? strings[curKey].replace(about_in_language[languageCode], "")
      : strings[curKey];
    return shortenedStrings;
  }, {});
};

export default function DateDisplay({ date, className, short = false }) {
  const { locale } = useContext(UserContext);
  const formatters = {
    de: short ? shorten(germanStrings, "de") : germanStrings,
    en: short ? shorten(englishStrings, "en") : englishStrings,
  };
  const formatter = buildFormatter(formatters[locale]);
  const olderThanOneWeek = new Date().getTime() - date > ONE_WEEK_IN_MILLISECONDS;
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
