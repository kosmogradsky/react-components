import { arc, pie, sum, PieArcDatum } from 'd3';
import memoize from 'memoize-one';
import * as React from 'react';
import { config, Spring } from 'react-spring';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';
import { createEventHandler } from '../utils/createEventHandler';
import { fromReducers } from '../utils/fromReducers';
import { separateDigits } from '../utils/separateDigits';
import { or, surely } from '../utils/undefined';
import { OneItemTooltip } from '../OneItemTooltip';

export interface SectorData {
  color: string;
  title: string;
  value: number | undefined;
  percent: number | undefined;
  insignificant?: boolean;
}

interface HoverPosition {
  x: number;
  index: number;
}

interface Props {
  className?: string;
  total?: number;
  radius: number;
  units: string;
  period: string;
  data: SectorData[];
  hoveredIndex: number | undefined;
  onChangeHoveredIndex?: (index: number | undefined) => void;
}

interface State {
  className: string;
  radius: number;
  units: string;
  period: string;
  data: SectorData[];
  hoveredIndex: number | undefined;
  isTooltipRightBound: boolean;
  integerTotal: number;
  decimalTotal: string;
  pieData: PieArcDatum<SectorData>[];
}

const Chart = styled.div`
  position: relative;
`;

const Total = styled.div`
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Period = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  font-size: 11px;
  color: #A3ACC5;

  @media print {
    font-size: 16px;
  }
`;

const Value = styled.div`
  padding-top: 16px;
  padding-bottom: 3px;
  font-size: 36px;
  color: #5A6B8C;
`;

const Suffix = styled.div`
  font-size: 13px;
  color: #5A6B8C;
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;
`;

export const getPercentFromAngle = (datum: PieArcDatum<SectorData>) => (datum.endAngle - datum.startAngle) * 100 / (2 * Math.PI);

export const CircularChart = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const { handler: changeHoverPosition, observable: hoverPosition$ } = createEventHandler<HoverPosition | undefined>();
  const chartRect = { top: 0, left: 0 };

  const getComputations = memoize((data: SectorData[], propsTotal: number | undefined) => {
    const total = propsTotal === undefined ? sum(data, d => d.value) : propsTotal;
    const splitTotal = total.toString().split('.');
    const integerTotal = parseInt(splitTotal[0], 10);
    const decimalTotal = splitTotal[1] !== undefined && splitTotal[1].length > 1 ? splitTotal[1][0] : splitTotal[1] !== undefined ? splitTotal[1] : '0';

    const pieData = pie<unknown, SectorData>().sort(null)
      .value((sector: SectorData) => sector.value === undefined ? 0 : sector.value)(data);

    return {
      integerTotal,
      decimalTotal,
      pieData,
    };
  });

  const state$ = fromReducers(
    undefined,
    props$.pipe(map(props => (previousState: State) => ({
      ...previousState,
      ...props,
      ...getComputations(props.data, props.total),
      isTooltipRightBound: false,
    }))),
    hoverPosition$.pipe(map(hoverPosition => (previousState: State) => {
      if (hoverPosition === undefined) {
        return {
          ...previousState,
          hoveredIndex: undefined,
        };
      }

      const reverseX = hoverPosition.x - chartRect.left;

      return {
        ...previousState,
        hoveredIndex: hoverPosition.index,
        isTooltipRightBound: reverseX <= previousState.radius,
      };
    })),
  );

  return state$.pipe(
    map(({
      radius,
      data,
      className,
      period,
      units,
      hoveredIndex,
      isTooltipRightBound,
      integerTotal,
      decimalTotal,
      pieData,
      onChangeHoveredIndex = () => {},
    }) => {
      const renderSector = (startAngle: number, endAngle: number, weight: number, offset: number) => or(arc()({
        innerRadius: radius - offset,
        outerRadius: radius - offset - weight,
        startAngle,
        endAngle,
      }) as string | undefined, undefined);

      const handleRefChart = (ref: HTMLElement | null) => {
        if (ref === null) {
          return;
        }
        const { top, left } = ref.getBoundingClientRect();
        chartRect.top = top;
        chartRect.left = left;
      };

      const renderTooltip = () => {
        const currentElement = hoveredIndex !== undefined ? data[hoveredIndex] : undefined;

        return (
          currentElement !== undefined
            ? <OneItemTooltip
              isShown
              rightBound={isTooltipRightBound}
              units={units}
              title={currentElement.title}
              value={or(currentElement.value, 0).toFixed(1)}
              percentValue={or(currentElement.percent, 0).toFixed(1)}
              color={currentElement.color}
              insignificant={currentElement.insignificant}
            />
            : ''
        );
      };

      const onMouseEnter = (event: React.MouseEvent, index: number) => {
        changeHoverPosition({
          x: event.clientX,
          index,
        });

        onChangeHoveredIndex(index);
      };

      const onMouseLeave = () => {
        changeHoverPosition(undefined);
        onChangeHoveredIndex(undefined);
      };

      return (
        <Chart
          className={className}
          style={{ width: radius * 2, height: radius * 2 }}
          ref={handleRefChart}
        >
          <Total>
            <Period>
              {period}
            </Period>
            <Value>
              {separateDigits(integerTotal, 0)}
              {surely(decimalTotal, total => (
                <span>.{total}</span>
              ), '')}
            </Value>
            <Suffix>{units}</Suffix>
          </Total>
          <SVG>
            <g
              transform={`translate(${radius},${radius})`}
              onMouseLeave={onMouseLeave}
            >
              {pieData.map((sector, index) => (
                <Spring
                  key={index}
                  config={config.stiff}
                  to={{
                    startAngle: sector.startAngle,
                    endAngle: sector.endAngle,
                    weight: hoveredIndex === index ? 82 : 59,
                    offset: hoveredIndex === index ? 11 : 24,
                  }}>
                  {item => <>
                    <path
                      d={renderSector(item.startAngle, item.endAngle, 5, 1)}
                      stroke={data[sector.index].color}
                      strokeWidth='1px'
                      fill={data[sector.index].color}
                    />
                    <path
                      key={index}
                      d={renderSector(item.startAngle, item.endAngle, 1, 10)}
                      fill={data[sector.index].color}
                    />
                    <path
                      d={renderSector(item.startAngle, item.endAngle, item.weight, item.offset)}
                      fill={data[sector.index].color}
                      stroke={data[sector.index].color}
                      strokeWidth={hoveredIndex === index ? 0 : 0.5}
                      onMouseLeave={hoveredIndex = undefined}
                      onMouseEnter={(event: React.MouseEvent) => onMouseEnter(event, index)}
                    />
                  </>}
                </Spring>
              ))}
            </g>
          </SVG>
          {renderTooltip()}
        </Chart>
      );
    }));
});
