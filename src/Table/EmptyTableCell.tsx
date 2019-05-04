import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';
import { createEventHandler } from '../utils/createEventHandler';
import { Tooltip } from '../Tooltip';

import { TableValue } from './Table';

interface Props {
  value: string;
  isSecond: boolean;
  onFootnoteClick: (token: string) => void;
}

const EmptyCell = styled.div<{ isHovered: boolean }>`
  border: solid 0.5px ${props => props.isHovered ? '#28AA95' : '#5A6B8C'};
  cursor: pointer;
  height: 1px;
  width: 20px;
`;

const EmptyCellWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 20px;
  position: relative;
  cursor: pointer;
  z-index: 2;
`;

const TooltipText = styled.div`
  color: #5A6B8C;
  line-height: 20px;
  font-size: 11px;
  text-align: center;
`;

const TooltipContainer = styled.div`
  position: absolute;
  left: -40px;
  top: 30px;
`;

const TooltipElement = styled(Tooltip)`
  padding: 10px;
  max-width: 250px;
  min-width: 175px;
`;

export const EmptyTableCell = componentFromObservable<Props>('EmptyTableCell', props$ => {
  const { handler: changeHoveredCell, observable: hoveredCell$ } = createEventHandler<string | undefined>();

  return combineLatest(
    props$,
    hoveredCell$.pipe(startWith(undefined)),
  ).pipe(
    map(([{ value, isSecond, onFootnoteClick }, hoveredCell]) => {
      const handleCellHover = changeHoveredCell;
      const handleMouseLeave = () => changeHoveredCell(undefined);

      const renderTooltip = () => {
        if (!Boolean(hoveredCell)) {
          return undefined;
        }

        return (
          <TooltipContainer>
            <TooltipElement
              rightBound
              isShown={Boolean(hoveredCell)}
            >
              <TooltipText>Данные по {hoveredCell} отсутствуют</TooltipText>
            </TooltipElement>
          </TooltipContainer>
        );
      };

      return (
        <TableValue isSecond={isSecond}>
          <EmptyCellWrapper
            onMouseEnter={() => handleCellHover(value)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onFootnoteClick('—')}
          >
            <EmptyCell isHovered={Boolean(hoveredCell)} />
            {renderTooltip()}
          </EmptyCellWrapper>
        </TableValue>
      );
    },
    ));
});
