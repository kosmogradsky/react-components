import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css } from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';
import { or } from '../utils/undefined';
import { Direction, HistogramBar } from '../Histogram/Bar';

const defineColor = (value: number): string => {
  if (value > 100) {
    return '#00AA95';
  } else {
    return '#777776';
  }
};

export interface AffinityChartRowProps {
  maxValue?: number;
  affinity?: number;
  affinityInternet?: number;
  isNewGroup?: boolean;
  isLastInGroup?: boolean;
  firstColumn: string;
  secondColumn?: string;
  barWidth?: number;
  firstVerticalLinePosition?: number;
  secondVerticalLinePosition?: number;
  secondColumnPosition?: number;
  thirdColumnPosition?: number;
  insignificant?: boolean;
  footnote?: string;
  insignificantValueClick?: () => void;
  onFootnoteClick?: (token: string | undefined) => void;
}

const section = css`
  font-size: 13px;
  color: #5A6B8C;
  line-height: 17px;
`;

const column = css`
  width: 228px;
  display: flex;
  justify-content: flex-end;
`;

const VerticalLine = styled.div<{ width: number }>`
  border-left: 1px solid #A3ACC5;
  height: 36px;
  position: absolute;
  left: ${props => props.width }px;

  margin-left: -3px;
  top: 0;
  z-index: 3;

  &:last-of-type {
    height: 32px;
  }
`;

const Item = styled.div<{ isLast: boolean, isFirst: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 32px;
  cursor: pointer;

  &:hover::after {
    position: absolute;
    z-index: -1;
    top: 0;
    bottom: 0;
    left: -10px;
    right: -10px;
    content: '';
    background-color: #F7F7FA;
    border-radius: 4px;
  }

  ${props => props.isLast ? css`
    margin-bottom: 28px;

    ${VerticalLine} {
      height: 25px;
    }
  ` : ''};

  ${props => props.isFirst ? css`
    ${VerticalLine} {
      height: 28px;
      margin-top: 7px;
    }
  ` : ''};

  @media print {
    page-break-inside: avoid;

    ${props => props.isLast ? css`
      ${VerticalLine} {
        height: 20px;
        margin: 0;
      }` : ''}
  }
`;

const ColumnFirst = styled.div`
  width: 295px;
  display: flex;
`;

const ColumnSecond = styled.div<{ position: number }>`
  ${column};
  margin-right: ${props => props.position }px;

  &:last-of-type {
    margin-right: ${props => props.position }px;
  }
`;

const ColumnThird = styled.div<{ position: number }>`
  margin-left: 40px;
  ${column};
    margin-right: ${props => props.position }px;

  &:last-of-type {
    margin-right: ${props => props.position }px;
  }
`;

const FirstSection = styled.div`
  ${section};
  padding-right: 8px;
  min-width: 120px;
`;

const InfoNoteButton = styled.button`
  position: relative;
  top: -10px;
  right: -10px;
  margin-left: -11px;
  padding: 1px 3px 0 3px;
  width: 11px;
  height: 11px;
  border: 0;
  color: #5A6B8C;
  line-height: 11px;
  font-size: 8px;
  border-radius: 50%;
  background: none;

  &:hover {
    background-color: #1FB4A2;
    color: #fff;
    cursor: pointer;
    height: 11px;
    width: 11px;
  }
`;

const SecondSection = styled.div`
  ${section};
  min-width: 175px;
`;

const Bar = styled.div<{ width: number }>`
  margin-top: -1px;
  width: ${props => props.width }px;
`;

const CenterBar = styled.div`
  background-color: #FCE800;
  height: 6px;
  width: 7px;
  position: relative;
  right: 82px;
  z-index: 6;
`;

const CenterBarValue = styled.span`
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
`;

const InsignificantValue = styled.span`
  position: relative;
  right: 47px;
  top: 4px;
  padding-left: 10px;
  width: 41px;
  height: 100%;
  font-size: 13px;
  line-height: 7px;
`;

const letterSize = 7;
const rowLimit = 90;

export const AffinityChartRow = componentFromObservable<AffinityChartRowProps>('AffinityChartRow', props$ => props$.pipe(
  map(({
    maxValue,
    affinity,
    affinityInternet,
    isNewGroup,
    firstColumn,
    secondColumn,
    isLastInGroup = false,
    barWidth = 85,
    firstVerticalLinePosition = 410,
    secondVerticalLinePosition = 681,
    secondColumnPosition = 34,
    thirdColumnPosition = 32,
    insignificant,
    insignificantValueClick,
    footnote,
    onFootnoteClick = () => {},
  }) => {
    const renderBar = (value: number) => (
      value === 100 ?
        <CenterBar>
          <CenterBarValue>{value}</CenterBarValue>
        </CenterBar>
        :
        <Bar width={barWidth}>
          <HistogramBar
            percent={Math.abs(value - 100) / (maxValue as number) * 100}
            color={defineColor(value)}
            value={value.toString().replace('.', ',')}
            direction={value < 100 ? Direction.Left : Direction.Right}
          />
        </Bar>
    );

    const numberOfSymbols = Math.round((rowLimit / letterSize));
    const formattedFirstColumn = firstColumn !== undefined ? numberOfSymbols + 2 >= firstColumn.length ? firstColumn : `${firstColumn.slice(0, numberOfSymbols)}...` : undefined;

    return (
      <Item isLast={isLastInGroup} isFirst={or(isNewGroup, false)}>
        <ColumnFirst>
          <FirstSection title={Boolean(isNewGroup) ? firstColumn : ''}>
            {Boolean(isNewGroup) ? formattedFirstColumn : ''}
            {Boolean(footnote) && Boolean(isNewGroup) ? (
              <InfoNoteButton onClick={() => onFootnoteClick(footnote)} >
                {footnote}
              </InfoNoteButton>
            ) : undefined
            }
          </FirstSection>
          <SecondSection>
            {secondColumn}
          </SecondSection>
        </ColumnFirst>
        <ColumnSecond position={secondColumnPosition}>
          <VerticalLine width={firstVerticalLinePosition}/>
          <VerticalLine width={secondVerticalLinePosition}/>
          {Boolean(insignificant)
            ? <InsignificantValue onClick={insignificantValueClick}>***</InsignificantValue>
            : renderBar(affinity as number)}
        </ColumnSecond>
        <ColumnThird position={thirdColumnPosition}>
          {Boolean(insignificant)
            ? <InsignificantValue onClick={insignificantValueClick}>***</InsignificantValue>
            : renderBar(affinityInternet as number)}
        </ColumnThird>
      </Item>
    );
  })));
