import React, { useContext, useCallback } from "react";
import TimeAgo from "react-timeago";
import UserContext from "../context/UserContext";

interface LocalizedTimeAgoProps {
  date: Date | string | number;
  [key: string]: any;
}

type Unit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
type Suffix = "ago" | "from now";

export default function LocalizedTimeAgo({ date, ...props }: LocalizedTimeAgoProps) {
  const { locale } = useContext(UserContext);

  // Formatter function that handles locale-specific formatting
  const formatter = useCallback(
    (value: number, unit: Unit, suffix: Suffix, epochMilliseconds: number): React.ReactNode => {
      const units_de = {
        year: {
          singular: "Jahr",
          plural: "Jahren", // we always use the dative plural (in 2 Jahren, vor 2 Jahren)
        },
        month: {
          singular: "Monat",
          plural: "Monaten", // we always use the dative plural (in 2 Monaten, vor 2 Monaten)
        },
        week: {
          singular: "Woche",
          plural: "Wochen",
        },
        day: {
          singular: "Tag",
          plural: "Tagen", // we always use the dative plural (in 2 Tagen, vor 2 Tagen)
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
        // date we're trying to format (epochMilliseconds), and Date.now(). We then
        // convert that to the total number of days since epoch, and account
        // for overflow with 365 days in a year.
        const differenceInMiliseconds = Date.now() - epochMilliseconds;
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
          return `Vor ${value} ${pluralizedYears} und ${dayWithinYear} ${pluralizedDays}`;
        return `${value} ${pluralizedYears} and ${dayWithinYear} ${pluralizedDays} ago`;
      }

      // Otherwise, just default. This logic comes from:
      // https://github.com/nmn/react-timeago/blob/master/src/defaultFormatter.js
      let unitString: string;
      if (value !== 1) {
        if (locale === "de") {
          unitString = units_de[unit].plural;
        } else {
          unitString = unit + "s";
        }
      } else if (locale === "de") {
        unitString = units_de[unit].singular;
      } else {
        unitString = unit;
      }

      if (locale === "de" && suffix === "ago") {
        return `vor ${value} ${unitString}`;
      }
      if (locale === "de" && suffix === "from now") {
        return `in ${value} ${unitString}`;
      }
      return `${value} ${unitString} ${suffix}`;
    },
    [locale]
  );

  return <TimeAgo date={date} formatter={formatter} {...props} />;
}
