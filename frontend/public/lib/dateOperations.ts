import { format, isThisYear, isToday } from "date-fns";

export function getDateTime(rawDate) {
  const date = new Date(rawDate);
  if (isToday(date)) return format(date, "hh:mm");
  if (isThisYear(date)) return format(date, "MMM dd HH:mm");
  else return format(date, "MMM dd yyyy HH:mm");
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
