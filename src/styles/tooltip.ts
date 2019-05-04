import styled, { css } from 'styled-components';

import { noPrint } from './print';

export const Tooltip = styled.div`
  position: absolute;
  left: -146px;
  top: 22px;
  z-index: 5;
  padding: 10px 10px 7px 10px;
  width: 207px;
  visibility: hidden;
  opacity: 0;
  cursor: default;
  color: #5A6B8C;
  font-size: 11px;
  line-height: 20px;
  background: #FFFFFF;
  box-shadow: 0 6px 10px rgba(47, 64, 98, 0.2);
  border-radius: 3px;
  transition: opacity 0.3s ease-out;

  &::after {
    position: absolute;
    z-index: 2;
    top: -16px;
    left: 143px;
    content: '';
    border: 8px solid transparent;
    border-bottom: 8px solid #fff;
    cursor: pointer;
  }

  &::before {
    position: absolute;
    z-index: 1;
    top: -16px;
    left: 0;
    width: 100%;
    height: 16px;
    content: '';
  }

  ${noPrint}
`;

export const info = css`
  position: relative;
  width: 11px;
  height: 11px;
  cursor: pointer;

  &:hover {
    color: #1FB4A2;

    ${Tooltip} {
      visibility: visible;
      opacity: 1;
    }
  }

  ${noPrint}
`;
