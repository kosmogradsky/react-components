import { css } from 'styled-components';

import { noPrint } from './print';

export const button = css`
  display: inline-flex;
  align-items: center;
  padding-left: 22px;
  padding-right: 22px;
  height: 40px;
  font-size: 13px;
  font-weight: 400;
  line-height: 24px;
  text-decoration: none;
  color: white;
  background-image: linear-gradient(247.3deg, #0088A6 -156.48%, #00A696 103.94%);
  border-radius: 4px;
  border: none;
  cursor: pointer;

  &:hover {
    background-image: linear-gradient(259.58deg, #1DBFE2 -156.48%, #1FB4A2 103.94%);
  }

  ${noPrint}
`;

export const buttonCalendar = css`
  display: flex;
  justify-content: center;
  width: 158px;
`;

export const buttonCalendarBig = css`
  display: flex;
  justify-content: center;
  width: 260px;
`;

export const rightIcon = css`
  display: flex;
  flex-shrink: 0;
  margin-left: 6px;
`;

export const leftIcon = css`
  display: flex;
  flex-shrink: 0;
  margin-right: 10px;
`;

export const stars = css`
  padding: 3px 0;
  display: inline-block;
  min-width: 20px;
  font-size: 13px;
  color: #5A6B8C;
  background: none;
  cursor: pointer;
  border: none;
  outline: none;
  transition: color .3s ease-out;

  &:hover {
    color: #1FB4A2
  }
`;

export const iconButtonLarge = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 89px;
  background: #5A6B8C none;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease-out;
  padding: 0 0 3px;

  &:hover {
    background-color: #00AA95
  }
`;
