import { max } from 'd3-array';
import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { chartColors } from '../utils/chartСolors';
import { componentFromObservable } from '../utils/componentFromObservable';
import { or, surely } from '../utils/undefined';

import { HistogramRowProps } from './Row/Row';

enum GroupBy {
  DevId = 'devId',
  FirstSection = 'firstSection',
  SecondSection = 'secondSection',
}

type HistogramRowElement = React.ReactElement<HistogramRowProps>;

export enum HistogramTheme {
  Light = 'Light',
  Dark = 'Dark',
}

interface Props {
  groupBy?: GroupBy;
  theme?: HistogramTheme;
  enumerate?: boolean;
  children?: HistogramRowElement[];
}

const Chart = styled.div`
  padding-top: 12px;

  @media print {
    page-break-inside: avoid;
  }
`;

export const Histogram = componentFromObservable<Props>('Histogram', props$ => props$.pipe(
  map(({
    groupBy,
    enumerate,
    theme = HistogramTheme.Light,
    children,
  }) => {
    const maxValue = max(children as HistogramRowElement[], item => item.props.value);
    let colorIndex = -1;

    const renderItem = (item: HistogramRowElement, index: number) => {
      const prevItem = or((children as HistogramRowElement[])[index - 1], {} as HistogramRowElement);
      const nextItem = or((children as HistogramRowElement[])[index + 1], {} as HistogramRowElement);
      const isNewGroup = groupBy !== undefined && (prevItem.props === undefined || item.props.firstColumn !== prevItem.props.firstColumn);
      const isLastInGroup = groupBy !== undefined && (nextItem.props  === undefined || item.props.firstColumn !== nextItem.props.firstColumn);

      if (isNewGroup) {
        colorIndex++;
      }
      if (colorIndex > chartColors.length - 1) {
        colorIndex = 0;
      }
      return React.cloneElement(
        item,
        {
          theme,
          isLastInGroup,
          isNewGroup: Boolean(item.props.isNewGroup) ? item.props.isNewGroup : isNewGroup,
          maxValue: Boolean(item.props.maxValue) ? item.props.maxValue : maxValue,
          key: index,
          color: item.props.color !== undefined ? item.props.color : chartColors[colorIndex],
          number: Boolean(enumerate) ? index + 1 : undefined,
        },
      );
    };
    return (
      <Chart>
        {surely(children, childrenItem => React.Children.map(childrenItem, renderItem), '')}
      </Chart>
    );
  }),
));
