import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css } from 'styled-components';

import { componentFromObservable } from '../utils/componentFromObservable';
import { Icon } from '../Icon/Icon';
import { Tooltip, TooltipType } from '../Tooltip';

export interface SelectOptionProps {
  type?: TooltipType;
  className?: string;
  renderInfo?: () => React.ReactNode;
  ref?: (el: HTMLElement) => void;
  isShowRenderInfo?: boolean;
  optionId: string | number;
  disabled?: boolean;
  children: React.ReactNode;
  isInfoShown?: boolean;
}

export type SelectOptionElement = React.ReactElement<SelectOptionProps>;

const OptionContent = styled.span<{ disabled?: boolean }>`
  align-items: center;
  display: flex;

  ${props => Boolean(props.disabled) ? css`
    pointer-events: none;
  ` : ''}
`;

const InfoIcon = styled(Icon)`
  position: relative;
  top: 1px;
  color: #A3ACC5;
  margin-left: 8px;

  button:hover & {
    color: #1FB4A2
  }
`;

const OptionTooltip = styled(Tooltip)`
  left: -48px;
`;

export const SelectOption = componentFromObservable<SelectOptionProps>('SelectOption', props$ =>
  props$.pipe(map(({ className, renderInfo, children, disabled, isInfoShown, isShowRenderInfo, type }) => (
    <OptionContent className={className} disabled={disabled}>
      {children}
      {Boolean(renderInfo) && !Boolean(disabled) && Boolean(isShowRenderInfo) ?
        <InfoIcon
          icon='info'
          width='11px'
          height='11px'
        /> : ''
      }
      {Boolean(renderInfo) && Boolean(isShowRenderInfo) ?
        <OptionTooltip isShown={isInfoShown} type={type}>
          {renderInfo !== undefined ? renderInfo() : ''}
        </OptionTooltip> : ''
      }
    </OptionContent>
  ))),
);
