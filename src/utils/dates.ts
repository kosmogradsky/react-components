import { format as formatDateFns, startOfMonth as startOfMonthFns } from 'date-fns';
import { ru } from 'date-fns/esm/locale';
import capitalize from 'lodash-es/capitalize';

export type Period = [Date, Date];

const options = {
  locale: ru,
  awareOfUnicodeTokens: true,
};

const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

export const format = (date: Date | number, formatType: string) => formatDateFns(date, formatType, options);

export const shortFormatDate = (dateParameter: Date | number) => {
  const date = new Date(dateParameter);
  const monthNumber = date.getMonth();
  const year = date.getFullYear();
  return `${months[monthNumber]}.${year % 100}`;
};
export const longFormatDate = (date: Date | number) => format(date, 'LLLL YYYY');

export const formatPeriod = ([beginDate, endDate]: Period) => {
  const formatBeginDate = capitalize(format(beginDate, 'LLLL YYYY'));
  const formatEndDate = format(endDate, 'LLLL YYYY');
  return `${formatBeginDate} - ${formatEndDate}`;
};

export const makeValidDateString = (date: string) => `${date.substring(0, 4)}-${date.substring(4)}`;

export const startOfMonth = (year: number, monthNumber: number) => startOfMonthFns(new Date(year, monthNumber));
