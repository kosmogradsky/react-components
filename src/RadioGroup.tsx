import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { noPrint } from './styles/print';
import { componentFromObservable } from './utils/componentFromObservable';

interface Item {
  id: React.Key;
  label: React.ReactNode;
  name: string;
  value: string;
}

interface Props {
  mode?: string;
  items: Item[];
  onChange?: (index: string) => void;
  disabledItems?: number[];
  selectedValue: string | number;
}

const Label = styled.label`
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 23px;
  padding-right: 10px;
  font-size: 13px;
  line-height: 24px;
  color: #5A6B8C;
  cursor: pointer;
  border-radius: 4px;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;
  transition-property: background-color, color;

  &:hover {
    color: #1FB4A2;
  }

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0px;
    width: 12px;
    height: 12px;
    transform: translateY(-50%);
  }

  &::before {
    border: 1px solid #A3ACC5;
    border-radius: 6px;
    transition: border-color 0.2s ease-out;
  }

  &::after {
    opacity: 0;
    background-color: #5A6B8C;
    transition: opacity 0.2s ease-out;
    width: 8px;
    height: 8px;
    border-radius: 6px;
    left: 2px;
  }
`;

const Input = styled.input`
  display: none;

  &:checked + ${Label} {
    &::before {
      border-color: #5A6B8C;
    }

    &::after {
      opacity: 1;
    }
  }

  &:disabled + ${Label} {
    color: #A3ACC5;
    pointer-events: none;
  }
`;

const RadioItem = styled.div``;

const RadioMode = styledTheme('mode', {
  Audience: css`
    padding-top: 23px;
    padding-left: 29px;

    ${RadioItem}:not(:last-child) {
      margin-bottom: 12px;
    }
  `,
  Report: css`
    ${RadioItem} {
      margin-top: 13px;
    }

    ${RadioItem}:first-of-type {
      margin-top: 14px;
    }
  `,
  Modal: css`
    padding-top: 23px;
    padding-left: 29px;
    padding-right: 29px;

    ${RadioItem} label {
      color: #A3ACC5;
    }

    ${RadioItem}:not(:last-child) {
      margin-bottom: 12px;
    }
  `,
});

const Text = styled.span`
  margin-left: 9px;
`;

const Radio = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  border-radius: 4px;

  ${RadioMode};

  ${noPrint};
`;

export const RadioGroup = componentFromObservable<Props>('ComponentFromObservable', props$ => props$.pipe(
  map(({ items, mode, onChange, selectedValue, disabledItems }) => {

    const onChangeHandler = (newValue: string) => () => {
      if (onChange !== undefined) {
        onChange(newValue);
      }
    };

    const renderItem = ({ id, value, label, name }: Item) => (
      <RadioItem key={id}>
        <Input
          type='radio'
          checked={value === selectedValue}
          name={name}
          id={value}
          value={value}
          onChange={onChangeHandler(value)}
          disabled={disabledItems !== undefined && disabledItems.length > 0 ? disabledItems.includes(typeof id === 'string' ? parseInt(id, 10) : id) : false}
        />
        <Label htmlFor={value}>
          <Text>{label}</Text>
        </Label>
      </RadioItem>
    );

    return (
      <ThemeProvider theme={{ mode: mode }}>
        <Radio>
          {items.map(renderItem)}
        </Radio>
      </ThemeProvider>
    );
  }),
));
