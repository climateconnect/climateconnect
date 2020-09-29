import { isToday, format, isThisYear } from "date-fns";

export function getDateTime(rawDate) {
  const date = new Date(rawDate);
  if (isToday(date)) return format(date, "hh:mm");
  if (isThisYear(date)) return format(date, "MMM dd HH:mm");
  else return format(date, "MMM dd yyyy HH:mm");
}
