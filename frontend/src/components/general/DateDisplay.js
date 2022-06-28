import { PropTypes } from "prop-types";
import React, { useContext } from "react";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import germanStrings from "react-timeago/lib/language-strings/de";
import englishStrings from "react-timeago/lib/language-strings/en";
import UserContext from "../context/UserContext";

const ONE_WEEK_IN_MINISECONDS = 1000 * 60 * 60 * 24 * 7;

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

export default function DateDisplay({ date, className, short, withoutTimeAgo }) {
  const { locale } = useContext(UserContext);
  const formatters = {
    de: short ? shorten(germanStrings, "de") : germanStrings,
    en: short ? shorten(englishStrings, "en") : englishStrings,
  };
  const formatter = buildFormatter(formatters[locale]);
  const olderThanOneWeek = new Date() - date > ONE_WEEK_IN_MINISECONDS;
  return (
    <span className={className ? className : {}}>
      {olderThanOneWeek || withoutTimeAgo ? (
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
