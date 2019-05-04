import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from './utils/componentFromObservable';
import { Tooltip, TooltipProps, TooltipTheme } from './Tooltip';

interface ChartTableTooltipHeader {
  title: React.ReactChild;
  width?: number;
}

type Props = Pick<TooltipProps, 'isShown' | 'rightBound'> & {
  title: string;
  headers: ChartTableTooltipHeader[];
  rows: React.ReactChild[][];
};

const TableTooltip = styled(Tooltip)`
  padding: 9px 15px;
  width: 300px;
`;

const Title = styled.div`
  margin-bottom: 11px;
  line-height: 24px;
  font-size: 13px;
  color: #fff;
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableRow = styled.div`
  display: flex;
  justify-content: space-between;

  & > :first-child {
    margin-right: auto;
    text-align: left;
  }

  & > :not(:first-child) {
    margin-left: 17px;
    text-align: right;
  }
`;

const TableCell = styled.div<{cellWidth?: number}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 20px;
  font-size: 11px;
  color: #fdfdff;

  ${props => props.cellWidth !== undefined ?  ({ width: props.cellWidth }) : ''}
`;

const TableHeader = styled(TableRow)`
  margin-bottom: 6px;
`;

const TableHeaderCell = styled.div<{cellWidth?: number}>`
  font-size: 11px;
  line-height: 15px;
  color: rgba(255, 255, 255, 0.7);

  ${props => props.cellWidth !== undefined ?  ({ width: props.cellWidth }) : ''}
`;

const NullValue = styled.div`
  align-self: flex-end;
  height: 1px;
  width: 15px;
  background: #fff;
`;

export const ChartTableTooltip = componentFromObservable<Props>('ChartTooltip', props$ => props$.pipe(
  map(({
    isShown,
    title,
    headers = [],
    rows = [],
    rightBound,
  }) => (
    <TableTooltip
      theme={TooltipTheme.Dark}
      isShown={isShown}
      rightBound={rightBound}
    >
      <Title>{title}</Title>
      <TableHeader>
        {headers.map((column, key) => (
          <TableHeaderCell
            key={key}
            cellWidth={column.width}
          >
            {column.title}
          </TableHeaderCell>
        ))}
      </TableHeader>
      <TableBody>
        {rows.map((row, key) => (
          <TableRow key={key}>
            {row.map((cell, index) => (
              <TableCell
                key={index}
                cellWidth={headers[index].width}
              >
                {cell !== undefined ? cell : <NullValue />}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableTooltip>
  )),
));
