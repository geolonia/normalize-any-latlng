/**
 * We call numbers like 360613.58925 as fat degree format.
 * It should be interpreted as 36°06'13.58925".
 */
export const isFatDegreeFormat = (deg: number) => {
  if (Math.abs(deg) > 1800000) return false;

  const unit = deg < 0 ? -1 : 1;

  const [integer, decimal = ''] = Math.abs(deg).toString().split('.');

  const numberStr = integer.padStart(7, '0');
  const degree = unit * parseInt(numberStr.slice(0, 3));
  const minute = unit * parseInt(numberStr.slice(3, 5));
  const second = unit * (parseInt(numberStr.slice(5, 7)) + parseInt(decimal) / 100000);
  if (
    Math.abs(minute) < 1 ||
    Math.abs(minute) > 59 ||
    Math.abs(second) > 60
  ) return false;
  return { degree, minute, second };
};
