export const getNormalizedPriceString = (value: number) => {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const nFormatter = (
  num: number | undefined,
  digits: number = 1
): string => {
  if (!num) return '0';
  var si = [
    { symbol: '', value: 1 },
    { symbol: 'K', value: 1e3 },
    { symbol: 'M', value: 1e6 },
    { symbol: 'G', value: 1e9 },
    { symbol: 'T', value: 1e12 },
    { symbol: 'P', value: 1e15 },
    { symbol: 'E', value: 1e18 },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
};

export function sign(val: number): string {
  if (val > 0) return '+';
  else if (val < 0) return '-';
  else return '';
}
