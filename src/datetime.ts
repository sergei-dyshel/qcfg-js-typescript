export function epochToDate(epoch: number) {
  const date = new Date(0);
  date.setUTCSeconds(epoch);
  return date;
}

export function formatDate(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  /* XXX: format date as UTC */
  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}`;
}

export function getPastDate(days: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

export function dateToEpoch(date: Date): number {
  return date.getTime() / 1000;
} // REFACTOR: move to datetime.ts

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
