import { scaleLinear, scaleTime } from 'd3';
import { extent, max, min } from 'd3-array';
import { subMonths } from 'date-fns/esm';
import capitalize from 'lodash-es/capitalize';
import find from 'lodash-es/find';
import flatten from 'lodash-es/flatten';
import uniq from 'lodash-es/uniq';
import uniqBy from 'lodash-es/uniqBy';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { componentFromObservable } from '../utils/componentFromObservable';
import { createEventHandler } from '../utils/createEventHandler';
import { longFormatDate, shortFormatDate } from '../utils/dates';
import { pairwise } from '../utils/pairwise';
import { pick } from '../utils/pick';
import { separateDigits } from '../utils/separateDigits';
import { or, surely } from '../utils/undefined';
import { ChartTableTooltip } from '../ChartTableTooltip';
import { ChartTooltip, ChartTooltipItem, ChartTooltipTheme } from '../ChartTooltip';

enum LinearChartGradient {
  Opacity = 'opacity-gradient',
  OpacityFull = 'opacity-gradient-full',
}

export interface LinearChartPoint {
  date: number;
  value: number | undefined;
  percent?: number;
  insignificant?: boolean;
}

export interface LinearChartLine {
  name: string;
  color: string;
  token?: string;
  points: LinearChartPoint[];
}

export interface LinearChartData {
  lines: LinearChartLine[];
  title: string;
}

export enum LinearChartTheme {
  Default = 'Default',
  Naked = 'Naked',
  Small = 'Small',
  White = 'White',
  Short = 'Short',
  WhiteShort = 'WhiteShort',
}

export enum LinearChartTooltipType {
  Simple = 'Simple',
  Table = 'Table',
}

interface Props {
  width: number;
  height: number;
  monthsInPeriod?: number;
  theme?: LinearChartTheme;
  units?: string;
  devicesIsEmpty?: boolean;
  lines: LinearChartLine[];
  hoveredLineId?: number;
  tooltipType?: LinearChartTooltipType;
  tooltipTitle?: React.ReactChild;
  percentYAxis?: boolean;
  selectedPeriod?: number[];
}

const getValue = (point: LinearChartPoint) => {
  if (!Boolean(point) || point.value === undefined) {
    return '';
  } else if (Boolean(point.insignificant)) {
    return '***';
  } else {
    return point.value.toFixed(1);
  }
};

const valueSegments = 5;

const Tooltip = styled.div`
  position: absolute;
  z-index: 10;
  top: -20px;
  left: 9px;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const SVG = styled.svg`
  position: absolute;
  z-index: 6;
  top: -3px;
  left: -3px;
  width: calc(100% + 6px);
  height: calc(100% + 3px);
  pointer-events: none;
`;

const ChartEmpty = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ChartEmptyMessage = styled.div`
  padding: 10px 20px;
  font-size: 13px;
  color: #A3ACC5;
  background-color: #FBFBFF;
`;

const Vertical = styled.div`
  position: absolute;
  z-index: 4;
  top: -5px;
  bottom: 10px;
  left: 2px;
  width: 100%;
`;

const Horizontal = styled.div`
  position: absolute;
  z-index: 3;
  bottom: -9px;
  left: 0;
  width: 100%;
  height: 0;
`;

const HorizontalLabel = styled.div`
  position: absolute;
  color: #A3ACC5;
  font-size: 11px;
  white-space: nowrap;
  letter-spacing: 0.6px;
  transform: translateX(-50%);
`;

const VerticalLabel = styled.div`
  position: absolute;
  left: 0;
  color: #A3ACC5;
  font-size: 11px;
  letter-spacing: 0.2px;
  transform: translateY(-50%);
`;

const Segments = styled.div`
  position: absolute;
  z-index: 5;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Shadow = styled.div`
  position: absolute;
  z-index: 8;
  left: -900px;
  right: -900px;
  bottom: 0;
  height: 45px;
  background-image: linear-gradient(0deg, rgba(40, 68, 145, 0.072) 0%, rgba(47, 70, 131, 0.0190939) 22.65%, rgba(25, 57, 145, 0) 100%);
  pointer-events: none;
`;

const VerticalSegment = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  transform: translateX(-50%);

  &::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    display: block;
    content: '';
    width: 1px;
    height: 100%;
    background-image: linear-gradient(0deg, #EBF0FF 0%, rgba(235, 240, 255, 0) 134.52%);
  }

  &:hover::after {
    background-image: linear-gradient(0deg, #5A6B8C 0%, rgba(235, 240, 255, 0) 134.52%);
  }
`;

const Line = styled.line`
  transition: 0.3s ease-out;
`;

const ShadowStyles = css`
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: #EBF0FF;
`;

const ChartTheme = styledTheme('mode', {
  [LinearChartTheme.Default]: css`
    margin-left: 15px;

    ${Vertical} {
      margin-left: -15px;
    }

    ${VerticalSegment}:last-child:not(:first-child), ${HorizontalLabel}:last-child:not(:first-child) {
      display: none;
    }
  `,
  [LinearChartTheme.White]: css`
    margin-left: -14px;
    padding-right: 10px;

    ${Vertical} {
      margin-left: 14px;
    }

    ${Shadow} {
      ${ShadowStyles};
      left: 14px;
      right: -10px;
    }

    ${VerticalSegment}:last-child:not(:first-child), ${HorizontalLabel}:last-child:not(:first-child) {
      display: none;
    }
  `,
  [LinearChartTheme.WhiteShort]: css`
    margin-left: 20px;
    padding-right: 10px;

    ${Vertical} {
      margin-left: -22px;
    }

    ${Shadow} {
      ${ShadowStyles};
      right: -10px;
    }

    ${VerticalSegment}:last-child:not(:first-child):not(:nth-of-type(2)), ${HorizontalLabel}:last-child:not(:first-child):not(:nth-of-type(2)) {
      display: none;
    }

    ${VerticalSegment}:nth-of-type(2), ${HorizontalLabel}:nth-of-type(2) {
      display: block;
      left: 70px;
    }
  `,
  [LinearChartTheme.Naked]: css`
    margin-left: 50px;

    ${Vertical} {
      margin-left: -40px;
    }

    ${Shadow} {
      ${ShadowStyles};
      left: -40px;
    }
  `,
  [LinearChartTheme.Small]: css`
    margin-left: -14px;
    padding-right: 10px;

    ${Vertical} {
      margin-left: 45px;
    }

    ${Horizontal} {
      bottom: -14px
    }

    ${HorizontalLabel} {
      font-size: 13px;
    }

    ${Shadow} {
      ${ShadowStyles};
      left: 46px;
      right: -20px;
    }

    ${VerticalSegment}:last-child:not(:first-child), ${HorizontalLabel}:last-child:not(:first-child) {
      display: none;
    }
  `,
  [LinearChartTheme.Short]: css`
    margin-left: 52px;
    padding-right: 10px;

    ${Vertical} {
      margin-left: -22px;
    }

    ${Horizontal} {
      bottom: -14px
    }

    ${HorizontalLabel} {
      font-size: 13px;
    }

    ${Shadow} {
      ${ShadowStyles};
      right: -20px;
    }

    ${VerticalSegment}:last-child:not(:first-child):not(:nth-of-type(2)), ${HorizontalLabel}:last-child:not(:first-child):not(:nth-of-type(2)) {
      display: none;
    }

    ${VerticalSegment}:nth-of-type(2), ${HorizontalLabel}:nth-of-type(2) {
      display: block;
      left: 70px;
    }
  `,
});

const Chart = styled.div`
  position: relative;

  ${ChartTheme}
`;

const ColumnTitle = styled.div<{ color: string }>`
  padding-left: 17px;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 10px;
    height: 10px;
    background-color: ${props => props.color};
    transform: translateY(-50%);
  }
`;

export const LinearChart = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const { handler: changeHoveredDate, observable: hoveredDate$ } = createEventHandler<number | undefined>();

  const computations = props$.pipe(
    pick('height', 'width', 'lines', 'percentYAxis', 'selectedPeriod'),
    map(({ height, width, lines, percentYAxis, selectedPeriod }) => {
      const allPoints = flatten(lines.map(item => item.points));

      const isEmpty = allPoints.every(point => !Boolean(point.value));

      const points = allPoints.map(item => Boolean(percentYAxis) ? or(item.percent, 0) : or<number>(item.value !== undefined ? item.value : 0, 0));

      const uniqDates = uniqBy(allPoints, point => point.date).map(point => point.date);
      const availablePeriod = selectedPeriod !== undefined ? selectedPeriod : uniqDates;
      const valueScale = scaleLinear()
        .range([height, 3])
        .domain([0, or(max(points), 1)])
        .nice(5);

      const dateScale = scaleTime()
        .range([0, width])
        .domain(extent(availablePeriod) as [number, number]);

      return {
        uniqDates,
        availablePeriod,
        valueScale,
        dateScale,
        isEmpty,
      };
    }),
  );

  return combineLatest(
    props$,
    computations,
    hoveredDate$.pipe(startWith(undefined)),
  ).pipe(
    map((
      [
        {
          devicesIsEmpty,
          width,
          height,
          lines,
          theme = 'Default',
          units = '',
          monthsInPeriod = 0,
          hoveredLineId,
          tooltipType = LinearChartTooltipType.Simple,
          tooltipTitle = '',
          percentYAxis,
        },
        {
          uniqDates,
          availablePeriod,
          valueScale,
          dateScale,
          isEmpty,
        },
        hoveredDate,
      ]) => {
      const handleMouseLeave = () => changeHoveredDate(undefined);
      const handleSegmentHover = (date: number) => () => changeHoveredDate(date);

      const isChartEmpty = (linesArr: LinearChartLine[]) => linesArr.length === 0 ||
        linesArr.every(item => item.points.length === 0) || uniqDates.length === 0 || isEmpty;

      const getPeriodLabel = (date: number) => {
        const prevDate = subMonths(date, monthsInPeriod).getTime();
        const prevDateFormatted = longFormatDate(prevDate);
        const nowDateFormatted = longFormatDate(date);

        return monthsInPeriod > 1
          ? `${prevDateFormatted} – ${nowDateFormatted}`
          : nowDateFormatted;
      };

      const gradient = theme === LinearChartTheme.Naked || theme === LinearChartTheme.Short || theme === LinearChartTheme.WhiteShort
        ? LinearChartGradient.OpacityFull
        : LinearChartGradient.Opacity;

      const renderVerticalScale = (item: number, index: number, arr: number[]) => <VerticalLabel
        key={index}
        style={{
          top: valueScale(item),
          opacity: index === 0 && arr.length > 1 ? 0 : 1,
        }}
      >
        {Boolean(percentYAxis) ? `${item}%` : separateDigits(item, or(max(arr), 0) - or(min(arr), 0) >= valueSegments ? 0 : 1)}
      </VerticalLabel>;

      const renderHorizontalScale = (date: number, index: number) => {
        const prevDate = subMonths(date, monthsInPeriod).getTime();
        const prevDateFormatted = shortFormatDate(prevDate);
        const nowDateFormatted = shortFormatDate(date);

        const periodLabel = monthsInPeriod > 1
          ? (<>
            {prevDateFormatted}–
            <br/>
            –{nowDateFormatted}
          </>)
          : nowDateFormatted;

        return (
          <HorizontalLabel
            key={index}
            style={{
              left: dateScale(date),
            }}
          >
            {!Boolean((index % 2)) || availablePeriod.length <= 6 ? periodLabel : undefined}
          </HorizontalLabel>
        );
      };

      const renderSimpleTooltip = () => {
        const positionX = hoveredDate !== undefined ? dateScale(hoveredDate) : 0;
        const periodLabel = hoveredDate !== undefined ? getPeriodLabel(hoveredDate) : '';

        const tooltipItems: ChartTooltipItem[] = lines.map(item => {
          const hoveredPoint = item.points.find(
            (point: LinearChartPoint) => point.date === hoveredDate,
          );

          return {
            color: item.color,
            title: item.name,
            value: surely(hoveredPoint, getValue),
          };
        });

        return (
          <ChartTooltip
            isShown={Boolean(hoveredDate)}
            rightBound={positionX > width / 2}
            title={capitalize(periodLabel)}
            dimension={units}
            items={tooltipItems}
            theme={ChartTooltipTheme.Linear}
          />
        );
      };

      const renderTableTooltip = () => {
        const positionX = hoveredDate !== undefined ? dateScale(hoveredDate) : 0;
        const periodLabel = hoveredDate !== undefined ? getPeriodLabel(hoveredDate) : '';

        const tooltipItems = lines.map(item => {
          const hoveredPoint = find(item.points.map(point => ({
            date: point.date,
            value: point.value !== undefined ? point.value.toFixed(1) : '',
            percent: point.percent !== undefined ? point.percent.toFixed(1) : '',
          })), { date: hoveredDate });

          return {
            color: item.color,
            title: item.name,
            point: hoveredPoint,
          };
        });

        const rows = tooltipItems.map(item => [
          <ColumnTitle color={item.color}>{item.title}</ColumnTitle>,
          item.point !== undefined ? item.point.percent : '',
          item.point !== undefined ? item.point.value : '',
        ]);

        return (
          <ChartTableTooltip
            isShown={Boolean(hoveredDate)}
            rightBound={positionX > width / 2}
            title={capitalize(periodLabel)}
            headers={[
              {
                title: tooltipTitle,
              },
              {
                title: '% от населения',
                width: 85,
              },
              {
                title: units,
                width: 50,
              },
            ]}
            rows={rows}
          />
        );
      };

      const renderLine = (line: LinearChartLine, lineIndex: number) => {
        const points = line.points.slice().sort((a, b) => a.date - b.date);
        const renderedLines = pairwise(points);
        const lineUniqDates = uniq(line.points.map(item => item.date));
        const singleDotPoint: LinearChartPoint | undefined = line.points.filter(point => point.value !== undefined).length === 1 || lineUniqDates.length === 1 ? line.points.find(point => point.value !== undefined) : undefined;

        const dots = points.map((point, circleIndex) => hoveredDate === point.date && point.value !== undefined ? (
          <circle
            key={circleIndex}
            cx={dateScale(point.date)}
            cy={valueScale(Boolean(percentYAxis) ? (or(point.percent, 0)) : point.value)}
            r='2.5'
            strokeWidth='1.25'
            stroke={line.color}
            fill={Boolean(point.insignificant) ? 'white' : line.color}
          />
        ) : '');

        const singleDot = singleDotPoint !== undefined && singleDotPoint.value !== undefined && (hoveredLineId === undefined || hoveredLineId === lineIndex) ? (
          <circle
            key='singleDot'
            cx={dateScale(singleDotPoint.date)}
            cy={valueScale(Boolean(percentYAxis) ? (or(singleDotPoint.percent, 0)) : singleDotPoint.value)}
            r='2.5'
            strokeWidth='1.25'
            stroke={line.color}
            fill={Boolean(singleDotPoint.insignificant) ? 'white' : line.color}
          />) : '';

        return (
          <g key={lineIndex}>
            <g mask={`url(#mask)`}>
              {renderedLines.map(([start, end], renderedLineIndex) => start.value !== undefined && end.value !== undefined ? (
                <Line
                  key={renderedLineIndex}
                  x1={dateScale(start.date)}
                  x2={dateScale(end.date)}
                  y1={valueScale(Boolean(percentYAxis) ? or(start.percent, 0) : start.value)}
                  y2={valueScale(Boolean(percentYAxis) ? or(end.percent, 0) : end.value) + 0.0001}
                  stroke={line.color}
                  strokeWidth='1px'
                  strokeDasharray={Boolean(end.insignificant) ? '5 5' : 'none'}
                  style={{ opacity: hoveredLineId === undefined || hoveredLineId === lineIndex ? 1 : 0.2 }}>
                </Line>
              ) : '')}
            </g>
            {dots}
            {singleDot}
          </g>
        );
      };

      const renderVerticalSegments = (date: number, index: number, points: number[]) => {
        let segmentWidth = 100;
        const currentPosition = dateScale(date);
        const next = points[index + 1];
        if (Boolean(next) && points.length !== 2) {
          segmentWidth = Math.abs(dateScale(next) - currentPosition);
        }

        return (
          <VerticalSegment
            key={index}
            style={{
              left: currentPosition,
              width: segmentWidth,
              zIndex: 1000 - index,
            }}
            onMouseEnter={handleSegmentHover(date)}
          />
        );
      };

      const renderEmptyChart = () => (
        <ChartEmpty style={{ width, height }}>
          <ChartEmptyMessage>{Boolean(devicesIsEmpty) ? 'Ничего не выбрано' : 'Нет данных'}</ChartEmptyMessage>
        </ChartEmpty>
      );

      const renderChart = () => (
        <ThemeProvider theme={{ mode: theme }}>
          <Chart
            style={{ width, height }}
            onMouseLeave={handleMouseLeave}
          >
            <Shadow/>
            <Vertical>
              {valueScale.ticks(valueSegments).map(renderVerticalScale)}
            </Vertical>
            <Horizontal>
              {availablePeriod.map(renderHorizontalScale)}
            </Horizontal>
            <Segments>
              {availablePeriod.map(renderVerticalSegments)}
            </Segments>
            <SVG>
              <defs>
                <linearGradient id='opacity-gradient'>
                  <stop stopColor='white' stopOpacity='0' offset='0%'/>
                  <stop stopColor='white' stopOpacity='0' offset='5%'/>
                  <stop stopColor='white' stopOpacity='0.2' offset='5.01%'/>
                  <stop stopColor='white' stopOpacity='1' offset='40%'/>
                  <stop stopColor='white' stopOpacity='1' offset='100%'/>
                </linearGradient>

                <linearGradient id='opacity-gradient-full'>
                  <stop stopColor='white' stopOpacity='0.2' offset='0%'/>
                  <stop stopColor='white' stopOpacity='1' offset='40%'/>
                  <stop stopColor='white' stopOpacity='1' offset='100%'/>
                </linearGradient>

                <mask style={{ width, height }} id='mask'>
                  <rect
                    x={0}
                    y={0}
                    width={width}
                    height={height}
                    fill={`url(#${gradient})`}
                  />
                </mask>
              </defs>
              <g style={{ transform: 'translateX(3px)' }}>
                {lines.map(renderLine)}
              </g>
            </SVG>
            <Tooltip>
              {tooltipType === LinearChartTooltipType.Simple
                ? renderSimpleTooltip()
                : renderTableTooltip()
              }
            </Tooltip>
          </Chart>
        </ThemeProvider>
      );

      return isChartEmpty(lines) ? renderEmptyChart() : renderChart();
    }));
});
