import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';
import { IconWithTooltip } from '../IconWithTooltip';
import { Tooltip } from '../Tooltip';

interface CircularChartLegendItem {
  title: string;
  color: string;
  info: React.ReactNode;
}

interface Props {
  items: CircularChartLegendItem[];
  hoveredIndex: number | undefined;
  onMouseEnter?: (index: number) => void;
  onMouseLeave?: (index: number) => void;
}

const InfoIcon = styled.div`
  margin-left: 5px;
  color: #A3ACC5;
  cursor: pointer;

  &:hover {
    color: #1FB4A2;
  }
`;

const Item = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  cursor: default;
  font-size: 13px;
  color: #5A6B8C;
  opacity: ${props => props.isActive ? 1 : 0.2};
`;

const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 29px;
`;

const Legend = styled.div`
  padding-top: 190px;
  padding-bottom: 20px;
`;

const Square = styled.div`
  margin-right: 13px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 4px;
`;

export const CircularChartLegend = componentFromObservable<Props>('ComponentFromObservable', props$ => props$.pipe(
  map(({
    items,
    hoveredIndex,
    onMouseEnter = () => {},
    onMouseLeave = () => {},
  }) => (
    <Legend>
      {items.map((item: CircularChartLegendItem, index: number) => (
        <ItemWrapper key={index}>
          <Item
            onMouseEnter={() => onMouseEnter(index)}
            onMouseLeave={() => onMouseLeave(index)}
            isActive={hoveredIndex === undefined || hoveredIndex === index}
          >
            <Square style={{ backgroundColor: item.color }}/>
            {item.title}
          </Item>
          <InfoIcon>
            <IconWithTooltip
              icon='info'
              width='11px'
              height='11px'
              tooltip={<Tooltip rightBound={false}>{item.info}</Tooltip>}
            />
          </InfoIcon>
        </ItemWrapper>
      ))}
    </Legend>
  )),
));
