import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { componentFromObservable } from './utils/componentFromObservable';
import { createEventHandler } from './utils/createEventHandler';
import { getDecimal } from './utils/getDecimal';
import { separateDigits } from './utils/separateDigits';
import { or } from './utils/undefined';
import { IconWithTooltip } from './IconWithTooltip';
import { Tooltip } from './Tooltip';

export enum FlotationHowChanged {
  Raised = 'raised',
  Lowered = 'lowered',
}

interface FlotationProps {
  title: string;
  valueTooltip?: React.ReactNode;
  tooltip: React.ReactNode;
  value: number | undefined;
  units?: string;
  howChanged?: FlotationHowChanged;
  cover?: string;
}

const flotationValueThemeStyle = css`
  &::after {
    content: '';
    position: absolute;
    top: 9px;
    right: -18px;
    width: 0;
    height: 0;
    border-style: solid;
  }
`;

const FlotationValueTheme = styledTheme('mode', {
  [FlotationHowChanged.Lowered]: css`
    ${flotationValueThemeStyle};
    &::after {
      border-width: 9px 6px 0 6px;
      border-color: #DA4242 transparent transparent transparent;
    }
  `,
  [FlotationHowChanged.Raised]: css`
    ${flotationValueThemeStyle};
    &::after {
      border-width: 0 6px 9px 6px;
      border-color: transparent transparent #28AA95 transparent;
    }
  `,
});

const FlotationItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: calc(33.3333333%);
  &:nth-child(2) {
    padding-left: 5px;
  }
  &:nth-child(3) {
    padding-left: 12px;
  }
`;

const FlotationLabel = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  margin-bottom: 5px;
  font-size: 13px;
  color: #A3ACC5;;
  line-height: 24px;
`;

const FlotationLabelIcon = styled(IconWithTooltip)`
  margin-top: -4px;
  margin-left: 6px;
  cursor: pointer;
`;

const FlotationLabelTooltip = styled(Tooltip)`
  width: 200px;
`;

const TooltipText = styled.div`
  color: #5A6B8C;
  line-height: 20px;
  font-size: 11px;
  text-align: center;
`;

const FlotationValueTooltip = styled(Tooltip)`
  padding: 10px;
`;

const FlotationValue = styled.div`
  position: relative;
  font-size: 36px;
  color: #5A6B8C;
  line-height: 44px;

  ${FlotationValueTheme};
`;

const CoveredValue = styled.div<{hasTooltip: boolean}>`
  position: relative;
  font-size: 36px;
  color: #5A6B8C;
  line-height: 44px;
  left: 5px;
  cursor: ${props => props.hasTooltip ? 'pointer' : 'default'}
`;

const FlotationValueFraction = styled.span`
  color: rgba(90, 107, 140, 0.5);
`;

const FlotationUnits = styled.div`
  padding-left: 2px;
  font-size: 11px;
  color: #A3ACC5;
  margin-bottom: 4px;
`;

export const Flotation = componentFromObservable<FlotationProps>('ComponentFromObservable', props$ => {
  const { handler: changeHoveredFlotation, observable: hoveredFlotation$ } = createEventHandler<boolean>();

  const vdom$ = combineLatest(
    props$,
    hoveredFlotation$.pipe(startWith(false)),
  ).pipe(
    map(([{ title, tooltip, value, howChanged, units = 'тыс. чел.', cover, valueTooltip }, hoveredFlotation]) =>
      (
        <FlotationItem>
          <FlotationLabel>
            <span>{title}</span>
            <FlotationLabelIcon
              icon='info'
              width='11px'
              height='11px'
              tooltip={<FlotationLabelTooltip>{tooltip}</FlotationLabelTooltip>}
            />
          </FlotationLabel>
          <ThemeProvider theme={{ mode: howChanged }}>
            {Boolean(cover)
              ? <CoveredValue
                hasTooltip={Boolean(valueTooltip)}
                onMouseEnter={() => changeHoveredFlotation(true)}
                onMouseLeave={() => changeHoveredFlotation(false)}>{cover}
              </CoveredValue>
              : (
                <FlotationValue>
                  {separateDigits(value, 0)}
                  <FlotationValueFraction>
                    {getDecimal(or(value, 0))}
                  </FlotationValueFraction>
                </FlotationValue>
              )
            }
          </ThemeProvider>
          <FlotationUnits>{units}</FlotationUnits>
          {
            hoveredFlotation && Boolean(valueTooltip)
              ? (
                <FlotationValueTooltip isShown>
                  <TooltipText>{valueTooltip}</TooltipText>
                </FlotationValueTooltip>)
              : ''
          }
        </FlotationItem>
      ),
    ),
  );

  return { vdom$ };
});
