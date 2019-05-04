import { css } from 'styled-components';

export const option = css`
  padding: 0 11px;
  display: flex;
  align-items: center;
  width: 100%;
  height: 31px;
  font-size: 13px;
  color: #5A6B8C;
  text-align: left;
  cursor: pointer;
  background: none;
  outline: none;

  &:hover {
    color: #1FB4A2
  }
`;

export const optionIcon = css`
  display: inline-block;
  flex-shrink: 0;
  width: 23px;

  svg {
    width: auto
  }
`;
