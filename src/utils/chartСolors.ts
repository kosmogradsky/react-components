export const chartColors: string[] = [
  '#00AA95',
  '#FCE800',
  '#604695',
  '#006FB8',
  '#E95288',
  '#4485E8',
  '#EF5205',
  '#3C3C3B',
  '#FAA72B',
  '#777776',
];

export const getChartColor = (index: number) => chartColors[index % chartColors.length];
