import styled, { css } from 'styled-components';

export const printOnly = css`
  display: none;
  @media print {
    display: block;
  }
`;

export const noPrint = css`
  @media print {
    display: none !important;
  }
`;

export const printColorAdjust = css`
  @media print {
    -webkit-print-color-adjust: exact;
    color-adjust: exact;
  }
`;

export const PrintTitle = styled.div`
  ${printOnly};

  @media print {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    text-align: center;
  }
`;

export const PrintFilters = styled.div`
  ${printOnly};

  @media print {
    margin-bottom: 0.5cm;
    page-break-after: avoid;
  }
`;

export const noBreakInside = css`
  @media print {
    page-break-inside: avoid !important;
  }
`;

export const printFiltersText = css`
  @media print {
    color: #A3ACC5;
    font-size: 16px;
    line-height: 20px;
    padding: 0;
    margin: 0 5px 0 0;
    display: inline-block;
  }
`;
