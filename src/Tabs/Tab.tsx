import * as React from 'react';
import styled, { css } from 'styled-components';
import styledTheme from 'styled-theming';

import { noPrint, printFiltersText } from '../styles/print';

const TabTheme = styledTheme('mode', {
  themeSmall: css`
    padding: 0 11px;
    border-radius: 4px;
  `,
  themeBordery: css`
    margin: 2px;
    padding: 0 24px;
    line-height: 24px;
    border-radius: 4px;
  `,
  themeShadowy: css`
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border: 1px solid #F8F8FB;
    background-color: #FBFBFF;
    z-index: 1;
    transition-duration: 0.3s;
    transition-timing-function: ease-out;
    transition-property: background-color, border-color, color, box-shadow;

    &:first-child {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }

    &:last-child {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  `,
});

export const tabStyles = css`
  margin-left: 0;
  margin-right: 0;
  font-size: 13px;
  background: none;
  color: #5A6B8C;
  outline: none;
  cursor: pointer;
`;

const StyledTab = styled.button.attrs({
  type: 'button',
}) <TabProps>`
  ${tabStyles};
  &:hover {
    color: #28AA95;
  }
  ${TabTheme};


  ${props => Boolean(props.isActive) ? `
    color: #28AA95;
    background-color: #fff;
    ${printFiltersText};
  ` : `${noPrint}`};

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

export interface TabProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  tabId: string | number;
  isActive?: boolean;
  withShadows?: boolean;
}

export type TabElement = React.ReactElement<TabProps>;

export const Tab: React.FunctionComponent<TabProps> = ({ children, ...rest }) => <StyledTab {...rest}>{children}</StyledTab>;
