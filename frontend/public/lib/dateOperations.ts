import { format, isThisYear, isToday } from "date-fns";
import { de, enUS } from "date-fns/locale";
import dayjs from "dayjs";
import { getProjectTypeDateOptions } from "../data/projectTypeOptions";

export function getDayAndMonth(date) {
  return format(date, "dd.MM.");
}

export function getTime(date) {
  return format(date, "HH:mm");
}

export function getDateAndTime(date) {
  return format(date, "dd.MM. HH:mm");
}

export function getDateTime(rawDate) {
  const date = new Date(rawDate);
  if (isToday(date)) return format(date, "hh:mm");
  if (isThisYear(date)) return format(date, "MMM dd HH:mm");
  else return format(date, "MMM dd yyyy HH:mm");
}

export function getDateTimeRange(rawStartDate, rawEndDate, locale) {
  const startDate = new Date(rawStartDate);
  const endDate = new Date(rawEndDate);
  let startDateString = format(startDate, "PPP p", { locale: locale === "de" ? de : enUS });
  //Case 1: start and end are on the same day
  if (startDate.getDate() === endDate.getDate()) {
    return `${startDateString} - ${format(endDate, "p", { locale: locale === "de" ? de : enUS })}`;
  } else {
    startDateString = format(startDate, "P p", { locale: locale === "de" ? de : enUS });
    const endDateString = format(endDate, "P p", { locale: locale === "de" ? de : enUS });
    return `${startDateString} - ${endDateString}`;
  }
}

export function durationFromMiliseconds(miliseconds, texts) {
  const yearInMiliseconds = 1000 * 60 * 60 * 24 * 365;
  const monthInMiliseconds = 1000 * 60 * 60 * 24 * 30;
  const dayInMiliseconds = 1000 * 60 * 60 * 24;
  let str = "";
  const numberYears = Math.floor(miliseconds / yearInMiliseconds);
  const numberMonths = Math.floor((miliseconds % yearInMiliseconds) / monthInMiliseconds);
  const numberDays = Math.floor((miliseconds % monthInMiliseconds) / dayInMiliseconds);
  if (numberYears > 0) {
    str += `${numberYears} ${numberYears > 1 ? texts.years : texts.year}`;
  }
  if (numberMonths > 0) {
    str += `${numberYears > 0 ? (numberDays === 0 ? " and " : ", ") : ""}${numberMonths} ${
      numberMonths > 1 ? texts.months : texts.month
    }`;
  }
  if (numberDays > 0) {
    str += `${numberMonths > 0 || numberYears > 0 ? " and " : ""}${numberDays} ${
      numberDays > 1 ? texts.days : texts.day
    }`;
  }
  return str;
}

export function checkProjectDatesValid(project, texts, isDraft = false) {
  const PROJECT_TYPE_OPTIONS = getProjectTypeDateOptions(texts);
  if (PROJECT_TYPE_OPTIONS[project.project_type.type_id].enableStartDate) {
    //We handle date errors manually because props like 'required' aren't supported by mui-x-date-pickers
    // For non-draft mode, start_date is required
    if (!isDraft && !project.start_date) {
      return {
        valid: false,
        error: {
          key: "start_date",
          value: `${texts.please_fill_out_this_field}: ${texts.start_date}`,
        },
      };
    }

    // If start_date is present, it must be valid (regardless of draft status)
    if (project.start_date && !dayjs(project.start_date).isValid()) {
      return {
        valid: false,
        error: {
          key: "start_date",
          value: `${texts.invalid_value}: ${texts.start_date}`,
        },
      };
    }

    if (PROJECT_TYPE_OPTIONS[project.project_type.type_id].enableEndDate) {
      // If end_date is present, it must be valid (regardless of draft status)
      if (project.end_date && !dayjs(project.end_date).isValid()) {
        return {
          valid: false,
          error: {
            key: "end_date",
            value: `${texts.invalid_value}: ${texts.end_date}`,
          },
        };
      }
      // If both dates are present, end_date must be after start_date
      if (
        project.start_date &&
        project.end_date &&
        dayjs(project.end_date) < dayjs(project.start_date)
      ) {
        return {
          valid: false,
          error: {
            key: "end_date",
            value: `${texts.end_date_must_be_after_start_date}`,
          },
        };
      }
    }
  }
  return {
    valid: true,
  };
}
