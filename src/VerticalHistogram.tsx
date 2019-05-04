import flatten from 'lodash-es/flatten';
import max from 'lodash-es/max';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled from 'styled-components';

import { printColorAdjust } from './styles/print';
import { componentFromObservable } from './utils/componentFromObservable';
import { createEventHandler } from './utils/createEventHandler';
import { OneItemTooltip } from './OneItemTooltip';

export interface VerticalHistogramValue {
  color: string;
  value: number;
  percent: number;
  title: string;
  insignificant: boolean;
}

export interface VerticalHistogramGroup {
  title: string;
  values: VerticalHistogramValue[];
}

interface Props {
  height: number;
  groups: VerticalHistogramGroup[];
}

interface HoverPosition {
  group: number;
  index: number;
}

const GroupList = styled.div`
  display: flex;
`;

const Group = styled.div`
  margin-right: 25px;
  margin-top: 27px;
`;

const Title = styled.div`
  font-size: 11px;
  letter-spacing: 0.6px;
  line-height: 23px;
  color: #A3ACC5;
`;

const BarGroup = styled.div<{ height: number }>`
  margin-top: 4px;
  display: flex;
  align-items: flex-end;
  height: ${props => props.height}px;
`;

const Bar = styled.div<{ color: string, height: number }>`
  width: 14px;
  height:  ${props => props.height}%;
  margin-right: 1px;
  background-color: ${props => props.color};

  ${printColorAdjust};
  @media print {
    margin-right: 3px;
  }
`;

export const VerticalHistogram = componentFromObservable<Props>('VerticalHistogram', props$ => {
  const { handler: changeHoverPosition, observable: hoverPosition$ } = createEventHandler<HoverPosition | undefined>();

  const vdom$ = combineLatest(
    props$,
    hoverPosition$.pipe(startWith(undefined)),
  ).pipe(
    map(([{ groups, height }, hoverPosition]) => {
      const valuesArr = flatten(groups.map(item => item.values))
        .map(item => item.value);
      const maxValue = max(valuesArr);

      const hoverGroup = hoverPosition !== undefined ? hoverPosition.group : 0;
      const hoverIndex = hoverPosition !== undefined ? hoverPosition.index : 0;
      const hoverValue = hoverPosition !== undefined ? groups[hoverGroup].values[hoverIndex] : undefined;

      const renderValue = (groupIndex: number) => (item: VerticalHistogramValue, index: number) => (
        <Bar
          key={index}
          color={item.color}
          height={maxValue !== undefined ? item.value / maxValue * 100 : 100}
          onMouseEnter={() => changeHoverPosition({ group: groupIndex, index })}
          onMouseLeave={() => changeHoverPosition(undefined)}
        />
      );

      const renderGroup = (group: VerticalHistogramGroup, index: number) => (
        <Group key={index}>
          <Title>{group.title}</Title>
          <BarGroup height={height}>
            {group.values.map(renderValue(index))}
          </BarGroup>
        </Group>
      );

      return (
        <GroupList>
          {
            groups.map(renderGroup)
          }
          {
            hoverValue !== undefined
              ? <OneItemTooltip
                units='тыс. чел.'
                isShown
                title={`${hoverValue.title} ${groups[hoverGroup].title}`}
                insignificant={hoverValue.insignificant}
                value={hoverValue.value.toFixed(1)}
                percentValue={hoverValue.percent.toFixed(1)}
                color={hoverValue.color}
              />
              : ''
          }
        </GroupList>
      );
    }),
  );
  return { vdom$ };
});
