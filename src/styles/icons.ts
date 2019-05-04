import { css } from 'styled-components';

export const barChartIcon = css`
  padding-top: 1px;
  padding-bottom: 3px;
  padding-left: 3px;
  padding-right: 3px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  width: 16px;
  height: 16px;

  &::before, &::after, span:first-child, span:last-child {
    content: '';
    width: 1px;
    background-color: currentColor;
  }

  &::before {
    height: 8px;
  }

  &::after {
    height: 5px;
  }

  span:first-child {
    height: 12px;
  }

  span:last-child {
    height: 10px;
  }
`;

export const hamburgerIcon = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 14px;
  height: 11px;

  &::before, &::after, span {
    display: block;
    height: 1px;
    background-color: currentColor;
  }

  &::before, &::after {
    content: '';
  }
`;
