import { stringify } from 'query-string';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { AppRoutes } from './types';
import { componentFromObservable } from './utils/componentFromObservable';

export const SearchItemContainer = styled.div``;

interface Props {
  className?: string;
  title: string;
  id?: number;
  number?: number;
  onOpenReport: (event: React.MouseEvent) => void;
}

const LinkButton = styled(Link)`
  padding: 4px 0 0 61px;
  display: flex;
  align-items: center;
  flex-grow: 1;
  width: 100%;
  height: 100%;
  cursor: pointer;
  color: #fff;
  text-decoration: none;
  background: none;
  border: none;
  transition: opacity 0.3s ease-out;
  cursor: pointer;
`;

const ItemNumber = styled.div`
  position: absolute;
  left: 28px;
  top: 16px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
`;

const Item = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 41px;
  font-size: 13px;
  color: #fff;

  ${SearchItemContainer}:hover & {
    opacity: 0.6;
  }

  &:hover {
    opacity: 1 !important;

    ${ItemNumber} {
      color: #fff;
    }
  }
`;

export const SearchItem = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const vdom$ = props$.pipe(
    map(({
      className,
      id,
      title,
      number,
      onOpenReport,
    }) => (
      <Item className={className}>
        <LinkButton
          to={{ pathname: AppRoutes.Report, search: stringify({ id }) }}
          onClick={onOpenReport}
        >
          {number !== 0 ? <ItemNumber>{number}</ItemNumber> : ''}
          {title}
        </LinkButton>
      </Item>
    )),
  );
  return { vdom$ };
});
