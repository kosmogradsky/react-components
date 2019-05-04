import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { componentFromObservable } from '../../utils/componentFromObservable';
import { separateDigits } from '../../utils/separateDigits';
import { surely } from '../../utils/undefined';
import { Direction, HistogramBar } from '../Bar';
import { HistogramTheme } from '../Histogram';

export interface HistogramRowProps {
  theme?: HistogramTheme;
  maxValue?: number;
  value?: number;
  color?: string;
  insignificant?: boolean;
  number?: number;
  isNewGroup?: boolean;
  isLastInGroup?: boolean;
  firstColumn: string | undefined;
  secondColumn?: string;
  footnote?: string;
  onFootnoteClick?: (token: string | undefined) => void;
}

const Bar = styled.div<{ wide: boolean }>`
  margin-top: -1px;
  width: 449px;
  padding-right: 50px;

  ${props => props.wide ? css`
    width: 624px;
  ` : ''}
`;

const SecondColumn = styled.div`
  width: 175px;
  font-size: 13px;
  color: #5A6B8C;
`;

export const FirstColumn = styled.div`
  width: 180px;
  padding-right: 8px;
  font-size: 13px;
  color: #5A6B8C;
`;

const Number = styled.div`
  font-size: 13px;
  color: #5A6B8C;
  width: 16px;
  margin-right: 19px;
`;

const ItemThemes = styledTheme('mode', {
  Dark: css`
    ${FirstColumn} {
      width: 259px;
      font-size: 13px;
    }

    ${Bar} {
      width: 348px;
    }
  `,
});

const Item = styled.div<{ isLastInGroup?: boolean }>`
  position: relative;
  z-index: 1;
  margin-bottom: ${props => Boolean(props.isLastInGroup) ? 14 : 3}px;
  display: flex;
  align-items: center;
  height: 32px;
  cursor: pointer;
  text-decoration: none;

  ${ItemThemes};

  @media print {
    margin-bottom: 5px;
    height: 26px;
  }
`;

const LastItem = styled(() => <Item isLastInGroup />);

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

const ItemWrapper = styled.div<{ theme: HistogramTheme }>`
  &:hover {
    ${Item} {
      &::after {
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

      ${props => props.theme === HistogramTheme.Dark ? css`
        &::after {
          display: none;
          background-color: inherit;
        }

        ${FirstColumn} {
          color: inherit;
        }

        ${Number} {
          color: inherit;
        }
      ` : ''}
    }
  }

  &:last-of-type ${LastItem} {
    margin-bottom: 0;
  }
`;

const letterSize = 7;
const rowLimit = 168;
const longRowLimit = 220;

export const HistogramRow = componentFromObservable<HistogramRowProps>('Histogram', props$ => props$.pipe(
  map(({
    theme = HistogramTheme.Light,
    maxValue = 0,
    color,
    number,
    insignificant,
    value,
    isNewGroup,
    firstColumn,
    secondColumn,
    footnote,
    onFootnoteClick = () => {},
    isLastInGroup,
  }) => {
    const numberOfSymbols = Math.round((theme === HistogramTheme.Dark ? longRowLimit : rowLimit / letterSize));
    const formattedFirstColumn = firstColumn !== undefined
      ? numberOfSymbols + 2 >= firstColumn.length ? firstColumn : `${firstColumn.slice(0, numberOfSymbols)}...`
      : undefined;

    return (
      <ThemeProvider theme={{ mode: theme }}>
        {
          value !== undefined ? (
            <ItemWrapper theme={theme}>
              <Item isLastInGroup={isLastInGroup}>
                {number !== undefined ? <Number>{number}</Number> : ''}
                <FirstColumn title={(Boolean(isNewGroup) || !Boolean(secondColumn)) ? firstColumn : ''}>
                  {(Boolean(isNewGroup) || !Boolean(secondColumn)) ? formattedFirstColumn : ''}
                  {Boolean(footnote) && Boolean(isNewGroup) ? (
                    <InfoNoteButton onClick={() => onFootnoteClick(footnote)} >
                      {footnote}
                    </InfoNoteButton>
                  ) : undefined
                  }
                </FirstColumn>
                {surely(secondColumn, column => (
                  <SecondColumn>{column}</SecondColumn>
                ), '')}
                <Bar wide={secondColumn === undefined}>
                  <HistogramBar
                    percent={Boolean(maxValue) ? value / maxValue * 100 : 100}
                    insignificant={insignificant}
                    color={color}
                    value={separateDigits(value, 1)}
                    direction={Direction.Right}
                  />
                </Bar>
              </Item>
            </ItemWrapper>
          ) : undefined
        }
      </ThemeProvider>
    );
      }),
));
