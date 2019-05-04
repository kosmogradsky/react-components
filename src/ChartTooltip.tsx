import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';

import { componentFromObservable } from './utils/componentFromObservable';
import { Tooltip, TooltipProps, TooltipTheme } from './Tooltip';

export enum ChartTooltipTheme {
  Linear = 'themeLinear',
  Donut = 'themeDonut',
}

export interface ChartTooltipItem {
  title: string;
  value: string | undefined;
  color: string;
}

type Props = Pick<TooltipProps, 'isShown' | 'rightBound'> & {
  title: string | undefined;
  dimension?: string;
  items: ChartTooltipItem[];
  theme: ChartTooltipTheme;
};

type ThemeStyles = Record<ChartTooltipTheme, Record<string, FlattenSimpleInterpolation>>;

const Themes: ThemeStyles = {
  [ChartTooltipTheme.Linear]: {
    tooltip: css`
      min-width: 221px;
    `,
    top: css`
      padding-bottom: 10px;
    `,
    title: css`
      font-size: 13px;
    `,
    value: css`
      font-size: 11px;
    `,
    itemTitle: css`
      font-size: 11px;
    `,
  },
  [ChartTooltipTheme.Donut]: {
    tooltip: css`
      min-width: 170px;
    `,
    top: css`
      margin-left: 17px;
      padding-bottom: 5px;
    `,
    title: css`
      font-size: 11px;
    `,
    value: css`
      font-size: 13px;
      font-weight: 700;
    `,
    itemTitle: css`
      font-size: 13px;
      font-weight: 700;
    `,
  },
};

const Value = styled.div<{theme?: string}>`
  color: #FDFDFF;

  ${props => props.theme !== undefined ? Themes[props.theme as keyof ThemeStyles].value : ''}
`;

const TooltipWrapper = styled(Tooltip)<{wrapperTheme?: string}>`
  ${props => props.wrapperTheme !== undefined ? Themes[props.wrapperTheme as keyof ThemeStyles].tooltip : ''};

  @media print {
    display: none;
  }
`;

const NullValue = styled.div`
  height: 1px;
  width: 15px;
  background: #ffffff;
`;

const Circle = styled.div`
  margin-right: 7px;
  width: 10px;
  height: 10px;
`;

const Item = styled.div`
  padding-bottom: 7px;
  display: flex;
  align-items: center;
`;

const ItemTitle = styled.div<{theme?: string}>`
  margin-right: auto;
  padding-right: 33px;
  display: flex;
  align-items: center;
  color: #FDFDFF;

  ${props => props.theme !== undefined ? Themes[props.theme as keyof ThemeStyles].itemTitle : ''}
`;

const Top = styled.div<{theme?: string}>`
  display: flex;
  align-items: center;

  ${props => props.theme !== undefined ? Themes[props.theme as keyof ThemeStyles].top : ''}
`;

const Title = styled.div<{theme?: string}>`
  margin-right: auto;
  color: rgba(255, 255, 255, 0.7);

  ${props => props.theme !== undefined ? Themes[props.theme as keyof ThemeStyles].title : ''}
`;

const Dimension = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
`;

export const ChartTooltip = componentFromObservable<Props>('ChartTooltip', props$ => props$.pipe(
  map(({
    isShown,
    items,
    title,
    dimension,
    theme,
    rightBound,
  }) => (
    <TooltipWrapper
      wrapperTheme={theme}
      theme={TooltipTheme.Dark}
      isShown={isShown}
      rightBound={rightBound}
    >
      <Top theme={theme}>
        <Title theme={theme}>{title}</Title>
        <Dimension>{dimension}</Dimension>
      </Top>
      {items.map((item: ChartTooltipItem, index: number) => (
        <Item key={index}>
          <ItemTitle theme={theme}>
            <Circle style={{ backgroundColor: item.color }}/>
            {item.title}
          </ItemTitle>
          {
            item.value !== '' && item.value !== undefined
              ? <Value theme={theme}>{item.value}</Value>
              : <NullValue/>
          }
        </Item>
      ))}
    </TooltipWrapper>
  )),
));
