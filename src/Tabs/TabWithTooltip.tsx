import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled, { css } from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';
import { createEventHandler } from '../utils/createEventHandler';

import { TooltipElement } from '../Tooltip';

import { TabProps } from './Tab';

export interface TabWithTooltipProps extends TabProps {
  tooltip: TooltipElement;
  children: React.ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  withShadows?: boolean;
}

const tabStyles = css`
  margin-left: 0;
  margin-right: 0;
  font-size: 13px;
  background: none;
  color: #5A6B8C;
  outline: none;
  cursor: pointer;

  @media print {
    display: block;
    color: black;
    font-weight: bold;
    padding: 0;
    height: 16px;
  }
`;

const TabButton = styled.button<TabProps>`
  ${tabStyles}
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #A3ACC5;
  border: 1px solid #F8F8FB;
  background-color: #FBFBFF;

  &:hover {
    color: #A3ACC5;
  }

  ${props => Boolean(props.isActive) && Boolean(props.withShadows) ? `
    margin-top: -1px;
    margin-bottom: -1px;
    box-shadow: 0 2px 10px rgba(47, 64, 98, 0.1);
    border-radius: 4px;
    border-color: transparent;
    z-index: 2;
  ` : ''};

  ${props => Boolean(props.disabled) ? `
    color: #A3ACC5;
    &:hover {
      color: #A3ACC5;
    }
  ` : ''};
`;

export type TabWithTooltipElement = React.ReactElement<TabWithTooltipProps>;

export const TabWithTooltip = componentFromObservable<TabWithTooltipProps>('TabWithTooltip', props$ => {
  const { handler: toggleInfo, observable: isInfoShown$ } = createEventHandler<boolean>();

  return combineLatest(
    props$,
    isInfoShown$.pipe(startWith(false)),
  ).pipe(map(([
    { children, tooltip, ...rest },
    isInfoShown,
  ]) => (
      <>
        <TabButton
          type='button'
          onMouseEnter={() => toggleInfo(true)}
          onMouseLeave={() => toggleInfo(false)}
          {...rest}
        >
          {children}
        </TabButton>
        {React.cloneElement(tooltip, {
          isShown: isInfoShown,
        })}
      </>
    ),
  ));
});
