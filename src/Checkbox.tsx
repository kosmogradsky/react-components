import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css } from 'styled-components';
import { Omit } from 'utility-types';

import { componentFromObservable } from './utils/componentFromObservable';
import { Icon } from './Icon/Icon';

type Props = Omit<JSX.IntrinsicElements['input'], 'onChange' | 'type' | 'id'> & {
  onChange?: (checked: boolean) => void;
  children: React.ReactNode;
};

let idCounter = 0;

const CheckBox = styled(({ isChecked, ...rest }) => <Icon {...rest}/>)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  margin-right: 20px;
  height: 12px;
  width: 12px;
  border: 1px solid currentColor;
  border-radius: 2px;

  svg {
    height: 8px;
    width: 8px;
    opacity: 0;
    transition: .2s ease-out
  }

  ${props => props.isChecked ? css`
    svg {
      opacity: 1
    }
  ` : ''}
`;

const Label = styled.label<{ isDisabled: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  height: 38px;
  font-size: 13px;
  line-height: 18px;
  color: #5A6B8C;
  cursor: pointer;
  border-radius: 4px;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;
  transition-property: background-color, color;

  &:hover {
    background-color: #F7F7FA;
    color: #1FB4A2;
  }

  ${props => props.isDisabled ? css`
    color: #A3ACC5;
    background-color: #fff !important;
    &:hover {
      color: #A3ACC5;
    }
  ` : ''}
`;

const Root = styled.div`
 position: relative;
`;

const Input = styled(({ ...rest }) => <input {...rest}/>)`
  position: absolute;
  opacity: 0;
  left: -1000px;
`;

export const Checkbox = componentFromObservable<Props>('ComponentFromObservable', props$ => {
  const id = `checkbox-${idCounter++}`;

  return props$.pipe(
    map(({ children, disabled = false, onMouseEnter, onMouseLeave, onChange = () => {}, checked, className, ...rest }) => (
      <Root
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Input
          {...rest}
          disabled={disabled}
          type='checkbox'
          checked={checked}
          onChange={() => !disabled ? onChange(!Boolean(checked)) : null}
          id={id}
        />
        <Label isDisabled={disabled} htmlFor={id}>
          <CheckBox isChecked={checked} icon='check' className={className}/>
          {children}
        </Label>
      </Root>
    )),
  );
});
