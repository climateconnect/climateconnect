/**
 * This is thin wrapper on top of the formatter that's passed to
 * reat-timeago. The desired date is a format that's something like
 *
 * "X years and X days"
 *
 * which isn't supported by react-timeago out of the box.
 *
 * We add a little more custom logic to format calculate what
 * the number of days is since the input date, and
 * then append a suffix to pluralize number of days.
 *
 * See more on the formatting options, here:
 * https://github.com/nmn/react-timeago#formatter-optional
 */
const yearAndDayFormatter = (
  value,
  unit,
  suffix,
  elapsedMilliseconds,
  /* eslint-disable-next-line no-unused-vars */
  defaultFormatter,
  now
) => {
  // Only apply custom logic for the year case
  if (unit === "year") {
    // The days calculation comes directly from react-timeago:
    // https://github.com/nmn/react-timeago/blob/master/src/formatters/buildFormatter.js#L84-L86

    // Number of ms in a second: 1000
    // Number of seconds in a minute: 60
    // Number of minutes in an hour: 60
    // Number of hours in a day: 24
    // Should be 86,400,000
    const msInDays = 1000 * 60 * 60 * 24;

    // We want the time that's elapsed between
    // date we're tring to format (elapsedMiliseconds), and Date.now(). We then
    // convert that to the total number of days since epoch, and account
    // for overflow with 365 days in a year.
    const differenceInMiliseconds = now() - elapsedMilliseconds;
    const elapsedDaysSinceEpoch = Math.round(differenceInMiliseconds / msInDays);
    const dayWithinYear = elapsedDaysSinceEpoch % 365;

    // With the number of days, we can just append the remaining
    // days after taking into account the year overflow. We also
    // handle the "0 days ago" case
    if (dayWithinYear === 0) {
      return `${value} ${unit} ago`;
    }

    // Case: plural "years" and "days"
    const pluralizeUnit = (value, unit) => {
      return value !== 1 ? `${unit}s` : unit;
    };
    const pluralizedDays = pluralizeUnit(dayWithinYear, "day");
    const pluralizedYears = pluralizeUnit(value, "year");

    return `${value} ${pluralizedYears} and ${dayWithinYear} ${pluralizedDays} ago`;
  }

  // Otherwise, just default. This logic comes from:
  // https://github.com/nmn/react-timeago/blob/master/src/defaultFormatter.js
  if (value !== 1) {
    unit += "s";
  }

  return `${value} ${unit} ${suffix}`;
};

export { yearAndDayFormatter };
