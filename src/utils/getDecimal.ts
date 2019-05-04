export const getDecimal = (num: number) => {
  let str = '' + num;
  const zeroPos = str.indexOf('.');
  if (zeroPos === -1) {
    return '.0';
  }
  str = str.slice(zeroPos);
  return str;
};
