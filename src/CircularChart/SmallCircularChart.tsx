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

import { getPercentFromAngle, SectorData } from './CircularChart';

interface HoverPosition {
  x: number;
  index: number;
}

interface Props {
  radius: number;
  units: string;
  data: SectorData[];
  total?: number;
  hoveredIndex: number | undefined;
  onChangeHoveredIndex?: (index: number | undefined) => void;
}

interface State {
  radius: number;
  units: string;
  data: SectorData[];
  hoveredIndex: number | undefined;
  isTooltipRightBound: boolean;
  integerTotal: number;
  decimalTotal: string;
  pieData: PieArcDatum<SectorData>[];
}

const Chart = styled.div`
  position: relative;
  z-index: 1;
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

const Value = styled.div`
  padding-top: 11px;
  font-size: 16px;
  color: #5A6B8C;
`;

const Suffix = styled.div`
  font-size: 11px;
  color: #5A6B8C;
`;

const SVG = styled.svg`
  width: 100%;
  height: 100%;
`;

export const SmallCircularChart = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const { handler: changeHoverPosition, observable: hoverPosition$ } = createEventHandler<HoverPosition | undefined>();
  const chartRect = { top: 0, left: 0 };

  const getComputations = memoize((data: SectorData[], propsTotal: number | undefined) => {
    const total = propsTotal === undefined ? sum(data, d => d.value) : propsTotal;
    const splitTotal = total.toString().split('.');
    const integerTotal = parseInt(splitTotal[0], 10);
    const decimalTotal = splitTotal[1];

    const pieData = pie<unknown, SectorData>().sort(null)
      .value((sector: SectorData) => or(sector.value, 0))(data);

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
        const percentValue = hoveredIndex !== undefined ? getPercentFromAngle(pieData[hoveredIndex]).toFixed(1) : undefined;

        return (
          currentElement !== undefined
            ? <OneItemTooltip
              units={units}
              isShown
              rightBound={isTooltipRightBound}
              insignificant={currentElement.insignificant}
              title={currentElement.title}
              value={or(currentElement.value, 0).toFixed(1)}
              percentValue={percentValue}
              color={currentElement.color}
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
          style={{ width: radius * 2, height: radius * 2 }}
          ref={handleRefChart}
        >
          <Total>
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
                    weight: hoveredIndex === index ? 16 : 12,
                    offset: hoveredIndex === index ? 1 : 3,
                  }}>
                  {item => <>
                    <path
                      d={renderSector(item.startAngle, item.endAngle, item.weight, item.offset)}
                      fill={data[sector.index].color}
                      stroke={data[sector.index].color}
                      strokeWidth={hoveredIndex === index ? 0 : 0.5}
                      onMouseLeave={() => onChangeHoveredIndex(undefined)}
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
