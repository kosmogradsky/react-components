export const separateDigits = (num = 0, decimalCount = 2) => {
  const [integer, decimal] = num.toString().split('.');
  const integerFormatted = integer.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
  let decimalFormatted = '';

  if (Boolean(decimalCount)) {
    decimalFormatted = Boolean(decimal) ? decimal.slice(0, decimalCount) : '';
    decimalFormatted = `.${decimalFormatted}${'0'.repeat(decimalCount - decimalFormatted.length)}`;
  }

  return integerFormatted + decimalFormatted;
};
