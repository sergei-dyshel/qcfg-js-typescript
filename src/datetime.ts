export { format as formatDate } from "date-fns";

export function epochToDate(epoch: number) {
  const date = new Date(0);
  date.setUTCSeconds(epoch);
  return date;
}

export function getPastDate(days: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

export function dateToEpoch(date: Date): number {
  return date.getTime() / 1000;
}

export function addToDate(date: Date, add: { seconds?: number; milliseconds?: number }): Date {
  const result = new Date(date);
  result.setSeconds(
    date.getSeconds() + (add.seconds ?? 0),
    date.getMilliseconds() + (add.milliseconds ?? 0),
  );
  return result;
}

export function relativeTime(since: Date): string {
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  const seconds = Math.round((new Date().getTime() - since.getTime()) / 1000);
  if (seconds < 30) {
    return "now";
  }

  let value;
  let unit;
  if (seconds < minute) {
    value = seconds;
    unit = "second";
  } else if (seconds < hour) {
    value = Math.floor(seconds / minute);
    unit = "minute";
  } else if (seconds < day) {
    value = Math.floor(seconds / hour);
    unit = "hour";
  } else if (seconds < week) {
    value = Math.floor(seconds / day);
    unit = "day";
  } else if (seconds < month) {
    value = Math.floor(seconds / week);
    unit = "week";
  } else if (seconds < year) {
    value = Math.floor(seconds / month);
    unit = "month";
  } else {
    value = Math.floor(seconds / year);
    unit = "year";
  }

  if (value > 1) {
    unit += "s";
  } else {
    value = "a";
  }
  return `${value} ${unit} ago`;
}
