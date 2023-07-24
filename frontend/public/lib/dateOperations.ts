import { format, formatRelative, isThisYear, isToday } from "date-fns";
import { de } from "date-fns/locale";

export function getDayAndMonth(date) {
  return format(date, "dd.MM");
}

export function getTime(date) {
  return format(date, "HH:mm");
}

export function getDateAndTime(date) {
  return format(date, "dd.MM HH:mm");
}

export function getDateTime(rawDate) {
  const date = new Date(rawDate);
  if (isToday(date)) return format(date, "hh:mm");
  if (isThisYear(date)) return format(date, "MMM dd HH:mm");
  else return format(date, "MMM dd yyyy HH:mm");
}

export function getDateTimeRange(rawStartDate, rawEndDate) {
  const startDate = new Date(rawStartDate);
  const endDate = new Date(rawEndDate);
  //Case 1: start and end are on the same day
  if(startDate.getDate() === endDate.getDate()) {
    return formatRelative(startDate, new Date())
  }
  return formatRelative(startDate, new Date(), {locale: de})
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
