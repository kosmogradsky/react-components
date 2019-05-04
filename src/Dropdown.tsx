import head from 'lodash-es/head';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from './utils/componentFromObservable';
import { createEventHandler } from './utils/createEventHandler';
import { or } from './utils/undefined';
import { Icon } from './Icon/Icon';

interface Props {
  data: SelectedItem[];
  type?: string;
}

interface SelectedItem {
  title: string;
  id: number;
}

const DropDownItemTitle = styled.div`
  padding-left: 32px;
  color: #5A6B8C;
  font-size: 13px;
`;

const DropDownIcon = styled.div`
  position: absolute;
`;

const DropDownList = styled.ul`
  z-index: 10;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #ffffff;
  padding: 0;
  margin-top: 10px;
`;

const DropDownListItem = styled.li`
  width: 100%;
  line-height: 37px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    background-color: #F5F6F8;
  }
`;

const DropDownHeaderTitle = styled.div`
  padding-left: 32px;
  color: #5A6B8C;
  font-size: 13px;
`;

const DropDownHeader = styled.div`
  display: flex;
  align-items: center;
  line-height: 58px;
  border-bottom: 1px solid #EBF0FF;
  cursor: pointer;
  position: relative;
  background-color: #ffffff;
`;

const DropDownWrap = styled.div`
  user-select: none;
  position: relative;
  width: 160px;
  margin: 30px 0;
`;

export const Dropdown = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const { handler: toggleOpenList, observable: isListOpen$ } = createEventHandler<boolean>();
  const { handler: selectItem, observable: selectedItem$ } = createEventHandler<SelectedItem>();

  return combineLatest(
    props$,
    isListOpen$.pipe(startWith(false)),
    selectedItem$.pipe(startWith(undefined)),
  ).pipe(
    map(([{ type, data }, isListOpen, selectedItem]) => {
      const handleSelectItem = (item: SelectedItem) => () => {
        selectItem(item);
        toggleOpenList(false);
      };

      const ensuredSelectedItem = or(selectedItem, head(data)) as SelectedItem;

      return (
        <DropDownWrap>
          <DropDownHeader onClick={() => toggleOpenList(!isListOpen)}>
            <DropDownIcon>
              <Icon icon='vectorBottom' width='8px' height='5px'/>
            </DropDownIcon>
            <DropDownHeaderTitle>
              {ensuredSelectedItem.title}
            </DropDownHeaderTitle>
          </DropDownHeader>
          {isListOpen ?
          <DropDownList>
            {data.map(item => (
              <DropDownListItem
                key={item.id}
                onClick={handleSelectItem(item)}
              >
                {type === 'checkbox' ?
                <DropDownIcon>
                  <Icon icon='checkbox' width='12px' height='12px'/>
                </DropDownIcon> : ''
                }
                <DropDownItemTitle>{item.title}</DropDownItemTitle>
              </DropDownListItem>
            ))}
          </DropDownList> : ''}
        </DropDownWrap>
      );
    }));
});
