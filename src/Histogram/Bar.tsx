import { color as getColor } from 'csx';
import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css } from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';

export enum Direction { Left, Right }

interface Props {
  value: string;
  percent: number;
  insignificant?: boolean;
  color: string | undefined;
  direction: Direction;
}

const Bar = styled.div<{ isReversed: boolean }>`
  position: relative;
  flex-grow: 1;
  width: 100%;
  height: 6px;
`;

const Value = styled.div<{ isReversed: boolean, direction?: Direction, insignificant?: boolean }>`
  position: absolute;
  left: 100%;
  top: 0;
  padding-left: 10px;
  width: 41px;
  height: 100%;
  font-size: 13px;
  line-height: 7px;
  white-space: nowrap;
  color: #5A6B8C;

  ${props => props.isReversed ? css`
    left: -20px;
    padding-left: 0;
    padding-right: 10px;
  ` : ''}

  ${props => props.direction === Direction.Left ? css`
    width: 20px;
    padding-right: 5px;
  ` : ''}

  ${props => props.direction === Direction.Right ? css`
    width: 20px;
    padding-left: 5px;
  ` : ''}

  ${props => Boolean(props.insignificant) ? css`
    line-height: 13px;
  ` : ''}
`;

const PrintOnlyBar = styled.div<{ isReversed: boolean }>`
  position: relative;
  width: 100%;
  height: 6px;
`;

export const HistogramBar = componentFromObservable<Props>('ComponentFromObservable', props$ => props$.pipe(
  map(({
    color = 'red',
    value,
    percent,
    insignificant,
    direction,
  }) => (
    <Bar
      isReversed={direction === Direction.Left}
      style={{
        backgroundImage: `linear-gradient(${direction === Direction.Left ? '90deg' : '270deg'},
              ${getColor(color).fade(1).toRGBA().toString()} 40.09%, ${getColor(color).fade(0).toRGBA().toString()} 110.47%)`,
        width: `${Boolean(insignificant) || parseInt(value, 10) === 0 ? 0 : percent}%`,
        minWidth: `${(Boolean(insignificant) || Boolean(percent)) && direction !== Direction.Left ? '6px' : undefined}`,
        right: direction === Direction.Left ? `${percent}%` : '',
      }}
    >
      <PrintOnlyBar isReversed={direction === Direction.Left} style={{ backgroundColor: color }}></PrintOnlyBar>
      <Value direction={direction} isReversed={direction === Direction.Left} insignificant={insignificant}>
        {Boolean(insignificant) ? '***' : value}
      </Value>
    </Bar>
  )),
));
