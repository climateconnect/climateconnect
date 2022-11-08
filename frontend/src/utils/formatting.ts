/**
 * This is thin wrapper on top of the formatter that's passed to
 * react-timeago. The desired date is a format that's something like
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

const germanYearAndDayFormatter = (
  value,
  unit,
  suffix,
  elapsedMilliseconds,
  /* eslint-disable-next-line no-unused-vars */
  defaultFormatter,
  now
) => {
  return yearAndDayFormatter(value, unit, suffix, elapsedMilliseconds, defaultFormatter, now, "de");
};

const yearAndDayFormatter = (
  value: number,
  unit: string,
  suffix: string,
  elapsedMilliseconds: number,
  /* eslint-disable-next-line no-unused-vars */
  defaultFormatter: any,
  now: () => number,
  locale: string
) => {
  const units_de = {
    year: {
      singular: "Jahr",
      plural: "Jahre",
    },
    month: {
      singular: "Monat",
      plural: "Monate",
    },
    week: {
      singular: "Woche",
      plural: "Wochen",
    },
    day: {
      singular: "Tag",
      plural: "Tage",
    },
    hour: {
      singular: "Stunde",
      plural: "Stunden",
    },
    minute: {
      singular: "Minute",
      plural: "Minuten",
    },
    second: {
      singular: "Sekunde",
      plural: "Sekunden",
    },
  };
  // Only apply custom logic for the year case
  if (unit === "year") {
    // The days calculation comes directly from react-timeago:
    // https://github.com/nmn/react-timeago/blob/master/src/formatters/buildFormatter.js#L84-L86

    // Should be 86,400,000: (1000ms, 60 seconds, 60 minutes, 24 hours)
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
      if (locale === "de") return `vor ${value} ${units_de[unit].singular}`;
      return `${value} ${unit} ago`;
    }

    // Case: plural "years" and "days"
    const pluralizeUnit = (value: number, unit: string) => {
      if (locale === "de")
        return value !== 1 ? `${units_de[unit].plural}` : units_de[unit].singular;
      return value !== 1 ? `${unit}s` : unit;
    };
    const pluralizedDays = pluralizeUnit(dayWithinYear, "day");
    const pluralizedYears = pluralizeUnit(value, "year");

    if (locale === "de")
      return `Vor ${value} ${pluralizedYears} and ${dayWithinYear} ${pluralizedDays}`;
    return `${value} ${pluralizedYears} and ${dayWithinYear} ${pluralizedDays} ago`;
  }
  // Otherwise, just default. This logic comes from:
  // https://github.com/nmn/react-timeago/blob/master/src/defaultFormatter.js
  if (value !== 1) {
    if (locale === "de") unit = units_de[unit].plural;
    else unit += "s";
  } else if (locale === "de") {
    unit = units_de[unit].singular;
  }
  if (locale === "de" && suffix === "ago") {
    return `vor ${value} ${unit}`;
  }
  if (locale === "de" && suffix === "from now") {
    return `in ${value} ${unit}`;
  }
  return `${value} ${unit} ${suffix}`;
};

export { yearAndDayFormatter, germanYearAndDayFormatter };
