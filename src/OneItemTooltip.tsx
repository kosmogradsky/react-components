import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from './utils/componentFromObservable';
import { Tooltip, TooltipProps, TooltipTheme } from './Tooltip';

type Props = Pick<TooltipProps, 'isShown' | 'rightBound'> & {
  title: string | undefined;
  value: number | string | undefined;
  percentValue: number | string | undefined;
  color: string | undefined;
  units?: string;
  insignificant?: boolean;
};

const ValueDescription = styled.div`
  line-height: 20px;
  font-size: 11px;
  color: #A3ACC5;
  margin-left: 5px;
`;

const Value = styled.div`
  line-height: 20px;
  font-size: 11px;
  color: #FDFDFF;
`;

const TooltipWrapper = styled(Tooltip)`
  min-width: 190px;
  padding-top: 10px;
  padding-right: 20px;
  padding-left: 20px;
  padding-bottom: 16px;

  @media print {
    display: none;
  }
`;

const NullValue = styled.div`
  height: 1px;
  width: 15px;
  background: #ffffff;
`;

const Square = styled.div`
  margin-right: 7px;
  width: 10px;
  height: 10px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255,255,255, 0.7);
  margin-bottom: 12px;
  padding-bottom: 6px;
`;

const Title = styled.div`
  line-height: 20px;
  font-size: 11px;
  color: #FFFFFF;
`;

export const OneItemTooltip = componentFromObservable<Props>('OneItemTooltip', props$ => props$.pipe(
  map(({
    isShown,
    value,
    insignificant,
    percentValue,
    color,
    title,
    rightBound,
    units = 'млн.чел.',
  }) => (
    <TooltipWrapper theme={TooltipTheme.Dark} isShown={isShown} rightBound={rightBound}>
      <Top>
        <Square style={{ backgroundColor: color }}/>
        <Title>{title}</Title>
      </Top>
      <Item>
        {
          value !== undefined
            ? <Value>{Boolean(insignificant) ? '***' :  value} {units}</Value>
            : <NullValue/>
        }
        <ValueDescription>Monthly Reach</ValueDescription>
      </Item>

      <Item>
        {
          value !== undefined
            ? <Value>{Boolean(insignificant) ? '***' :  percentValue + '%'}</Value>
            : <NullValue/>
        }
        <ValueDescription>от Monthly Reach</ValueDescription>
      </Item>
    </TooltipWrapper>
  )),
));
