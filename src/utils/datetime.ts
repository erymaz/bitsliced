const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT = [
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May',
  'June',
  'July',
  'Aug.',
  'Sep.',
  'Oct.',
  'Nov.',
  'Dec.',
];

function getFormattedDate(
  date: Date,
  prefomattedDate: string | null = null,
  hideYear = false
) {
  const day = date.getDate();
  const month = MONTH_NAMES_SHORT[date.getMonth()];
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours = hours24 % 12 || 12;
  let minutes: number | string = date.getMinutes();

  if (minutes < 10) {
    // Adding leading zero to minutes
    minutes = `0${minutes}`;
  }

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${prefomattedDate} at ${hours}:${minutes} ${ampm}`;
  }

  if (hideYear) {
    // 10 January at 10:20
    return `${day} ${month} at ${hours}:${minutes} ${ampm}`;
  }

  // 10 January 2017 at 10:20
  return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
}

// --- Main function
export function timeAgo(dateParam: Date) {
  if (!dateParam) {
    return null;
  }

  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = new Date();
  const yesterday = new Date(today.getTime() - DAY_IN_MS);
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();

  if (seconds < 5) {
    return 'now';
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 90) {
    return 'about a min ago';
  } else if (minutes < 60) {
    return `${minutes} mins ago`;
  } else if (isToday) {
    return getFormattedDate(date, 'Today'); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, 'Yesterday'); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, null, true); // 10 January at 10:20
  }

  return getFormattedDate(date); // 10 January 2017 at 10:20
}

export const getDateISOFormat = (dt: Date): string => {
  return `${dt.getFullYear()}-${dt.getMonth() < 9 ? '0' : ''}${
    dt.getMonth() + 1
  }-${dt.getDate() < 10 ? '0' : ''}${dt.getDate()}`;
};

// all the time value should be in milliseconds
export const time2ms = (time?: number): number => {
  const value = time ?? 0;
  return Math.ceil(value > 10000000000 ? value : value * 1000);
};

// forblockchain, all the time value should be in seconds
export const time2s = (time?: number): number => {
  const value = time ?? 0;
  return Math.ceil(value > 10000000000 ? value / 1000 : value);
};
