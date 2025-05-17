/**
 * 任意の値を Date オブジェクトに変換する
 * @param {Date | string | number} value - 日付型、日付文字列、またはUNIXタイムスタンプ
 * @returns {Date | null} - 有効な Date オブジェクト、または null
 */
export const parseToDate = (value) => {
  if (value instanceof Date && !isNaN(value)) {
    return new Date(value.getTime());
  }

  if (typeof value === 'string') {
    // 対応形式: YYYY-MM-DD or YYYY/MM/DD
    const normalized = value.replace(/-/g, '/');
    const parsed = new Date(normalized);
    return isNaN(parsed) ? null : parsed;
  }

  if (typeof value === 'number' && value > 999999999999) {
    const date = new Date(value);
    return isNaN(date) ? null : date;
  }

  return null;
};

export const getFormatedDate = (date, format = 'YYYY-MM-DD', isZeroPad = true) => {
  const zeroPad = (num) => (isZeroPad ? String(num).padStart(2, '0') : String(num));
  const d = parseToDate(date) || new Date();
  const map = {
    YYYY: d.getFullYear(),
    YY: String(d.getFullYear()).slice(2),
    MM: zeroPad(d.getMonth() + 1),
    DD: zeroPad(d.getDate()),
    h: zeroPad(d.getHours()),
    m: zeroPad(d.getMinutes()),
    s: zeroPad(d.getSeconds()),
  };

  return Object.entries(map).reduce((str, [key, val]) => {
    return str.replace(new RegExp(key, 'g'), val);
  }, format);
};
