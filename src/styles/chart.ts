import { css } from 'styled-components';

import { printColorAdjust } from './print';

export const wrapper = css`
  display: flex;
  align-items: flex-start;

  ${printColorAdjust}
`;

export const content = css`
  width: 631px;
`;

export const chart = css`
  position: relative;
  z-index: 1;
  padding-top: 35px;
`;

export const chartBody = css`
  margin-bottom: 45px;
  padding-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const legend = css`
  min-height: 340px;
  position: sticky;
  top: 330px;
  z-index: 2;
  margin-top: 42px;
  margin-left: 10px;
  width: 124px;
`;

export const legendItem = css`
  margin-bottom: 7px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  color: #5A6B8C;
  transition: opacity 0.3s ease-out;
`;

export const legendPoint = css`
  margin-top: 1px;
  margin-right: 10px;
  flex-shrink: 0;
  width: 7px;
  height: 7px;

  ${printColorAdjust}
`;
