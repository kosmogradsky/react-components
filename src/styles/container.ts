import { css } from 'styled-components';

import { noPrint } from './print';

export const container = css`
  margin-right: auto;
  margin-left: auto;
  padding-left: 102px;
  padding-right: 128px;
  display: flex;
  justify-content: flex-end;
  width: 1260px;

  @media print {
    display: block;
  }
`;

export const containerMin = css`
  margin-right: auto;
  margin-left: auto;
  padding: 0 20px;
  width: 980px;

  @media print {
    padding: 0;
  }
`;

export const content = css`
  max-width: 796px;
  flex-grow: 1;
`;

export const aside = css`
  padding-bottom: 50px;
  margin-right: 73px;
  width: 160px;
  align-self: flex-start;
  position: sticky;
  top: 0;
`;

export const controls = css`
  padding-top: 20px;
  padding-bottom: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const controlsLeft = css`
  justify-content: flex-start;

  & > :not(:last-child) {
    margin-right: 20px;
  }

  ${noPrint}
`;
