import flatten from 'lodash-es/flatten';
import groupBy from 'lodash-es/groupBy';
import max from 'lodash-es/max';
import values from 'lodash-es/values';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { StatisticDescription } from '../store/common.types';
import { ReportCentricToken } from '../store/report/report.types';
import * as b from '../styles/buttons';
import * as t from '../styles/tooltip';
import { componentFromObservable } from '../utils/componentFromObservable';
import { createEventHandler } from '../utils/createEventHandler';
import { customStringSort } from '../utils/customStringSort';
import { getDecimal } from '../utils/getDecimal';
import { separateDigits } from '../utils/separateDigits';
import { or, surely } from '../utils/undefined';
import { ContentHeadInfo } from '../ContentHead/ContentHeadInfo';
import { Icon } from '../Icon/Icon';

import { EmptyTableCell } from './EmptyTableCell';

interface HeadCell {
  title: string;
  subtitle: string;
  titleSecond?: string;
  subtitleSecond?: string;
  width?: string;
  info?: string;
  infoNote?: string;
  description?: StatisticDescription[];
  type: string;
}

interface Cell {
  value?: string | number;
  detailsName?: string;
  secondValue?: string | number;
  footnote?: string;
  secondFootnote?: string;
  objTypeId?: number;
  insign?: boolean;
  isNone?: boolean;
}

enum Order {
  Ascending,
  Descending,
}

interface Props {
  selectedCentricToken: ReportCentricToken;
  head: HeadCell[];
  type?: number;
  rows?: Cell[][];
  onFootnoteClick?: (name: string | undefined) => void;
  theme?: TableTheme;
  devicesIsEmpty?: boolean;
}

export enum TableTheme {
  Light = 'Light',
  Default = 'Default',
}

const compareValues = (x: string | number, y: string | number) => {
  if (typeof x === 'number' && typeof y === 'number') {
    return y - x;
  } else {
    return customStringSort(x, y);
  }
};

const tableValueStyle = css`
  height: 16px;
  span {
    display: inline-block;
    color: #A3ACC5;
  }
  white-space: nowrap;
`;

const TableFirstValue = styled.div<{ isText?: boolean, width: number }>`
  ${tableValueStyle};

  ${props => Boolean(props.isText) ? css`
    margin-right: 20px;
    width: ${props.width}px;
  ` : ''}
`;

const TableSecondValue = styled.div<{ isText?: boolean, width?: number }>`
  ${tableValueStyle};
  ${props => Boolean(props.isText)
    ? css`
      padding-right: 0;
      width: ${props.width}px;
    `
    : css`
      padding-right: 6px;
      width: 78px;
    `};
`;

export const NoData = styled.div`
  color: #5A6B8C;
  display: flex;
  justify-content: center;
  font-size: 16px;
  padding-top: 12px;
  padding-bottom: 45px;
  width: 100%;
`;

export const TableValue = styled(({ isSecond, ...rest }) => isSecond
  ? <TableSecondValue {...rest} />
  : <TableFirstValue {...rest} />)``;

const TableWrapper = styled.div`
  padding-top: 12px;
  width: 100%;
`;

export const TableHeadInfo = styled.div`
  position: absolute;
  top: -8px;
  right: -5px;
  padding-right: 5px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 400;
  color: #5A6B8C;
  background-color: #fff;
`;

const tableTheme = styledTheme('mode', {
  Default: css`
    border-top: 1px solid #A3ACC5;
    ${TableHeadInfo}{
      background-color: #fff;
    }
  `,
  Light: css`
    border-top: 1px solid transparent;
    ${TableHeadInfo}{
      background-color: transparent;
    }
  `,
});

const TableHead = styled.div`
  margin-bottom: 11px;
  display: flex;
  height: 54px;
  border-top: 1px solid #A3ACC5;
  border-bottom: 1px solid #A3ACC5;
  ${tableTheme}
`;

const Info = styled.div`
  ${t.info};
`;

const Tooltip = styled(t.Tooltip)`
  width: 207px;
`;

const TableHeadInfoText = styled.div<{ isActive: boolean }>`
  margin-left: 4px;
`;

const InfoNoteButton = styled.button`
  position: relative;
  top: -10px;
  right: -10px;
  margin-left: -11px;
  padding: 1px 3px 0 3px;
  width: 11px;
  height: 11px;
  border: 0;
  color: #5A6B8C;
  line-height: 11px;
  font-size: 8px;
  border-radius: 50%;
  background: none;

  &:hover {
    background-color: #1FB4A2;
    color: #fff;
    cursor: pointer;
    height: 11px;
    width: 11px;
  }
`;

const TitleArrow = styled.span`
  position: absolute;
  top: 6px;
  left: 4px;
  visibility: hidden;
  opacity: 0;
  transform-origin: 50% 50%;
  transform: rotate(180deg);
  transition: opacity 0.3s ease-out;
`;

const TableHeadTitle = styled.button<{ isActive: boolean, isDesc: boolean }>`
  position: relative;
  margin-right: -5px;
  padding-left: 16px;
  padding-right: 5px;
  height: 26px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  color: #5A6B8C;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease-out;

  &:hover {
    background-color: #F7F7FA;

    ${TitleArrow} {
      top: 8px;
      visibility: visible;
      opacity: 1;
    }
  }

  ${props => props.isActive ? css`
    color: #00AB97;

    ${TitleArrow} {
      top: 8px;
      visibility: visible;
      opacity: 1;
    }

    @media print {
      color: #5A6B8C;
    }
  ` : ''}

  ${props => props.isDesc ? css`
    ${TitleArrow} {
      transform: translate(0);
      top: 3px !important;
    }
  ` : ''};

  @media print {
    display: inline-block;
  }
`;

const TableHeadTitleSecond = styled.span`
  margin-left: 26px;
  display: inline-block;
`;

const TableHeadSubTitle = styled.div`
  padding-top: 1px;
  font-size: 11px;
  font-weight: 400;
  color: #A3ACC5;
`;

const TableHeadSubTitleSecond = styled.span`
  margin-left: 10px;
  display: inline-block;
`;

const CellType = styledTheme('mode', {
  Title: css`
    justify-content: flex-start;
    text-align: left;
  `,
});

const TableCell = styled.div<{ isEmptyCell?: boolean }>`
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 13px;
  text-align: right;
  color: #5A6B8C;

  ${props => Boolean(props.isEmptyCell) ? css`
    display: flex;
    justify-content: flex-end;
  ` : ''}

  ${CellType};
`;

const TableRow = styled.div<{ isFirst: boolean, isNotLast: boolean, isEmpty: boolean }>`
  position: relative;
  z-index: 1;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  height: 38px;
  cursor: pointer;

  &:hover {
    z-index: 2;
  }

  &:hover::after {
    position: absolute;
    z-index: -1;
    top: 0;
    left: -10px;
    right: -10px;
    content: '';
    height: 100%;
    background-color: #F7F7FA;
    border-radius: 4px;
  }

  &::before {
    position: absolute;
    bottom: -7px;
    left: 0;
    right: 0;
    height: 1px;
    content: '';
    pointer-events: none;
    background-color: #EBF0FF;
  }

  ${props => props.isEmpty ? css`
    cursor: default;

    &:hover::after {
      background-color: #FFF;
    }
  ` : ''}

  ${props => props.isNotLast ? css`
    &::before {
      display: none;
    }
  ` : ''}

  ${props => props.isFirst ? css`
    ${TableCell}:first-child ${TableFirstValue} {
      opacity: 0;
    }
  ` : ''};

  @media print {
    page-break-inside: avoid;
  }
`;

const HeadCellType = styledTheme('mode', {
  Title: css`
    align-items: flex-start;

    ${TableHeadTitle} {
      margin-left: -5px;
      padding-left: 5px;
      padding-right: 16px;
    }

    ${TitleArrow} {
      right: 2px;
      left: auto;
    }
  `,
});

const TableHeadCell = styled.div<{ width: string }>`
  position: relative;
  padding-top: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;

  ${HeadCellType};
  width: ${props => props.width}
`;

const Stars = styled.button`
  ${b.stars};
`;

const TableValueFraction = styled.span``;

const tableSymbolSize = 7;
const deviceLimit = 120;
const projectLimit = 195;

const objectTypes = new Map([[1, 'проекту'], [2, 'холдингу'], [3, 'рекламной сети']]);

export const Table = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const { handler: changeSortingColumnIndex, observable: sortingColumnIndex$ } = createEventHandler<number>();
  const { handler: changeOrder, observable: order$ } = createEventHandler<Order>();

  return combineLatest(
    props$,
    sortingColumnIndex$.pipe(startWith(1)),
    order$.pipe(startWith(Order.Ascending)),
  ).pipe(
    map(([{
      selectedCentricToken,
      head,
      rows,
      devicesIsEmpty,
      onFootnoteClick = () => {},
      type,
      theme = TableTheme.Default,
    }, sortingColumnIndex, order]) => {
      const getSortedRows = () => {
        if (sortingColumnIndex === 0) {
          const groups = groupBy(rows, row => `${row[0].value}${row[0].footnote}`);
          const groupsArray = values(groups)
            .map(item => item.sort((x, y) => compareValues(or(x[0].secondValue, ''), or(y[0].secondValue, ''))))
            .sort((x, y) => compareValues(or(x[0][0].value, ''), or(y[0][0].value, '')));
          return flatten(order === Order.Ascending ? groupsArray : groupsArray.reverse());
        } else {
          const groups = groupBy(rows, row => `${row[0].value}${row[0].footnote}`);
          const groupsArray = values(groups)
            .map(item => {
              const sortedArray = item.sort((x, y) => compareValues(or(x[sortingColumnIndex].value, ''), or(y[sortingColumnIndex].value, '')));
              return order === Order.Ascending ? sortedArray : sortedArray.reverse();
            })
            .sort((x, y) => compareValues(
              max(x.map(item => or(item[sortingColumnIndex].value, 0))) as number,
              max(y.map(item => or(item[sortingColumnIndex].value, 0))) as number),
            );
          return flatten(order === Order.Ascending ? groupsArray : groupsArray.reverse());
        }
      };

      const sortedRows = sortingColumnIndex === undefined ? rows : getSortedRows();

      const getObjectType = (cell: Cell): string => {
        const objType = objectTypes.get(or(cell.objTypeId, 1));
        return type === 1 && cell.secondValue !== undefined && typeof cell.secondValue === 'string' ? cell.secondValue : or(objType, 'проекту');
      };

      const handleSort = (index: number) => {
        if (index === sortingColumnIndex) {
          changeOrder(order === Order.Ascending ? Order.Descending : Order.Ascending);
        } else {
          changeSortingColumnIndex(index);
        }
      };

      const renderValue = (value: string | number, isSecond = false, detailsName?: string | undefined) => {
        if (typeof value === 'number') {
          return (
            <TableValue isSecond={isSecond}>
              {separateDigits(value, 0)}
              <TableValueFraction>
                {getDecimal(value)}
              </TableValueFraction>
            </TableValue>
          );
        }

        const width = selectedCentricToken === 'projects'
          ? isSecond ? deviceLimit : projectLimit
          : isSecond ? projectLimit : deviceLimit;
        const numberOfSymbols = Math.round(width / tableSymbolSize);
        const formattedValue = value.slice(0, numberOfSymbols + 2);

        return (
          <TableValue isSecond={isSecond} title={value} width={width} isText>
            {formattedValue.length < value.length ? `${formattedValue}...` : value}
            {detailsName !== undefined ? (
              <InfoNoteButton onClick={() => onFootnoteClick(detailsName)}>
                {detailsName}
              </InfoNoteButton>
            ) : undefined
            }
          </TableValue>
        );
      };

      const renderNotices = (name: string, isSecond = false) => (
        <TableValue isSecond={isSecond}>
          <Stars onClick={() => onFootnoteClick(name)}>
            {name}
          </Stars>
        </TableValue>
      );

      const renderCell = (cell: Cell, index: number) => {
        const headCell = head[index];
        return (
          <ThemeProvider key={`cell-${index}`} theme={{ mode: headCell.type }}>
            <TableCell style={{ width: or(headCell.width, 'auto') }}>
              {!Boolean(cell.insign) && cell.value !== undefined ? renderValue(cell.value as string, false, cell.footnote) : ''}
              {Boolean(cell.insign) && Boolean(cell.footnote) ? renderNotices(cell.footnote as string) : ''}
              {!Boolean(cell.insign) && cell.secondValue !== undefined ?
                <TableSecondValue isText={typeof cell.secondValue === 'string'}>
                  {renderValue(cell.secondValue as string, true, cell.secondFootnote)}
                </TableSecondValue>
                : ''}
              {index < 3 && Boolean(cell.insign) && Boolean(cell.footnote) !== undefined
                ? renderNotices(cell.footnote as string, true) : ''}
            </TableCell>
          </ThemeProvider>
        );
      };

      const renderEmptyCell = (index: number, value: string) => {
        const headCell = head[index + 1];
        const isSingleColumn = index === 2;
        return (
          <ThemeProvider key={`emptyCell-${index}`} theme={{ mode: headCell.type }}>
            <TableCell style={{ width: or(headCell.width, 'auto') }} isEmptyCell>
              <EmptyTableCell value={value} isSecond={false} onFootnoteClick={onFootnoteClick} />
              {!isSingleColumn ? <EmptyTableCell value={value} isSecond={true} onFootnoteClick={onFootnoteClick} /> : ''}
            </TableCell>
          </ThemeProvider>
        );
      };

      const renderEmptyRow = (row: Cell[]) => {
        const value = getObjectType(row[0]);

        return (
          <>
            {row.slice(0, 1).map(renderCell)}
            {row.slice(1).map((_cell, i) => renderEmptyCell(i, value))}
          </>
        );
      };

      const renderRow = (row: Cell[], index: number) => {
        const isFirstInGroup = index > 0
          && sortedRows !== undefined
          && sortedRows[index][0].value === sortedRows[index - 1][0].value
          && sortedRows[index][0].footnote === sortedRows[index - 1][0].footnote;
        const isNotLastInGroup = sortedRows !== undefined
          && sortedRows[index + 1] !== undefined && sortedRows[index][0].value === sortedRows[index + 1][0].value
          && sortedRows[index + 1] !== undefined && sortedRows[index][0].footnote === sortedRows[index + 1][0].footnote;
        const isEmptyRow = row.slice(1).every(cell => Boolean(cell.isNone));

        return (
          <TableRow
            isFirst={isFirstInGroup}
            isNotLast={isNotLastInGroup}
            isEmpty={isEmptyRow}
            key={index}
          >
            {!isEmptyRow ? row.map((cell, i) => Boolean(cell.isNone) ? renderEmptyCell(i - 1, getObjectType(row[0])) : renderCell(cell, i)) : renderEmptyRow(row)}
          </TableRow>
        );
      };

      const renderHeadCell = (cell: HeadCell, index: number) => (
        <ThemeProvider theme={{ mode: cell.type }} key={index}>
          <TableHeadCell width={or(cell.width, 'auto')}>
            <TableHeadTitle
              isActive={sortingColumnIndex === index}
              isDesc={sortingColumnIndex === index && order === Order.Descending}
              onClick={() => handleSort(index)}
            >
              <span>
                {cell.title}
              </span>
              {
                Boolean(cell.titleSecond) ?
                  <TableHeadTitleSecond>
                    {cell.titleSecond}
                  </TableHeadTitleSecond>
                  : ''
              }
              <TitleArrow>
                <Icon icon='arrowTop' width='10px' height='5px' />
              </TitleArrow>
            </TableHeadTitle>
            <TableHeadSubTitle>
              {cell.subtitle}
              {
                Boolean(cell.subtitleSecond) ?
                  <TableHeadSubTitleSecond>
                    {cell.subtitleSecond}
                  </TableHeadSubTitleSecond>
                  : ''
              }
            </TableHeadSubTitle>
            {
              Boolean(cell.info) ?
                <TableHeadInfo>
                  <Info>
                    <Icon icon='info' width='11px' height='11px' />
                    {surely(cell.description, c => c.length > 0, false) ?
                      <Tooltip>
                        <ContentHeadInfo description={or(cell.description, [])} />
                      </Tooltip>
                      : ''
                    }
                  </Info>
                  <TableHeadInfoText
                    isActive={sortingColumnIndex === index}
                  >
                    {cell.info}
                  </TableHeadInfoText>
                  {
                    Boolean(cell.infoNote) ?
                      <InfoNoteButton onClick={() => onFootnoteClick(cell.infoNote)}>
                        {cell.infoNote}
                      </InfoNoteButton> : ''
                  }
                </TableHeadInfo>
                : ''
            }
          </TableHeadCell>
        </ThemeProvider>
      );

      return sortedRows !== undefined && Boolean(sortedRows.length) ? (
        <ThemeProvider theme={{ mode: theme }}>
          <TableWrapper>
            <TableHead>
              {head.map(renderHeadCell)}
            </TableHead>
            {sortedRows.map(renderRow)}
          </TableWrapper>
        </ThemeProvider>
      ) :
        <NoData>{Boolean(devicesIsEmpty) ? 'Ничего не выбрано' : 'Нет данных'}</NoData>;
    }));
});
