export const getRandomNumber = (from: number, to: number) => Math.floor(Math.random() * to) + from;
export const getRandomFloat =
  (from: number, to: number, precision: number) => (Math.round((Math.random() * to + from) * 10 ** precision)) / 10 ** precision;
