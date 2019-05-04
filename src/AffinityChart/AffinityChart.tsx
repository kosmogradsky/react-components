import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css } from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';

import { AffinityChartRowProps } from './AffinityChartRow';

enum GroupBy {
  DevId = 'devId',
  FirstSection = 'firstSection',
  SecondSection = 'secondSection',
}

type AffinityChartRowElement = React.ReactElement<AffinityChartRowProps>;

export enum HistogramTheme {
  Light = 'light',
  Dark = 'dark',
}

interface AffinityChartProps {
  groupBy?: GroupBy;
  text?: string;
  children?: AffinityChartRowElement[];
  headerComponent?: React.ReactNode;
}

const subHeader = css`
  line-height: 24px;
  font-size: 13px;
  font-weight: bold;
  color: #5A6B8C;
`;

const subHeaderWrapper = css`
  display: flex;
  align-items: center;
`;

const column = css`
  width: 228px;
  display: flex;
  justify-content: flex-end;
`;

const Chart = styled.div`
  padding-top: 4px;

  &:last-of-type .itemLast:last-of-type {
    margin-bottom: 0;
  }
`;

const Head = styled.div`
  padding-top: 15px;
  display: flex;
  align-items: center;
`;

const ColumnFirst = styled.div`
  ${subHeader};
  width: 295px;
`;

const ColumnSecond = styled.div`
  ${subHeaderWrapper}
  ${column}
`;

const ColumnThird = styled.div`
  ${subHeaderWrapper};
  ${column};
  margin-left: 40px;
`;

const SubHeaderSecond = styled.div`
  ${subHeader};
  margin-right: 70px;
  width: 46px;
`;

const SubHeaderThird = styled.div`
  ${subHeader};
  margin-right: 12px;
  width: 100px;
`;

export const AffinityChart = componentFromObservable<AffinityChartProps>('AffinityChart', props$ => props$.pipe(
  map(({
    text,
    children,
    headerComponent = null,
  }) => {
    const renderHeader = () => {
      if (Boolean(headerComponent)) {
        return headerComponent;
      }
      return (
        <Head>
          <ColumnFirst>{text}</ColumnFirst>
          <ColumnSecond>
            <SubHeaderSecond>Affinity</SubHeaderSecond>
          </ColumnSecond>
          <ColumnThird>
            <SubHeaderThird>Affinity Internet</SubHeaderThird>
          </ColumnThird>
        </Head>
      );
    };

    return (
      <>
        {renderHeader()}
        <Chart>
          {children}
        </Chart>
      </>
    );
  }),
));
