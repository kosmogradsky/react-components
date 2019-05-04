import * as React from 'react';
import { combineLatest, fromEvent, EMPTY } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { componentFromObservable } from './utils/componentFromObservable';
import { Modal } from './Modal';

export enum TooltipTheme {
  Dark = 'themeDark',
  Light = 'themeLight',
}

export enum TooltipType {
  Click = 'mousedown',
  Hover = 'mousemove',
}

export interface TooltipProps {
  type?: TooltipType;
  className?: string;
  theme?: TooltipTheme;
  rightBound?: boolean;
  isShown?: boolean;
  withCorner?: boolean;
  children: React.ReactNode;
}

export type TooltipElement = React.ReactElement<TooltipProps>;

const ModalWrapperTheme = styledTheme('mode', {
  themeLight: css`
    background-color: #FFFFFF;
    box-shadow: 0px 6px 10px rgba(47, 64, 98, 0.2);
    font-size: 11px;
    color: #5A6B8C;
    line-height: 20px;
  `,
  themeDark: css`
    background-color: #5A6B8C;
  `,
});

const ModalWrapper = styled(Modal)<{ withCorner: boolean, usePointerEvents: boolean }>`
  padding: 10px;
  border-radius: 4px;
  pointer-events: ${props => props.usePointerEvents ? 'auto' : 'none'};

  ${props => props.withCorner ? css`
    margin-left: 55px;
    margin-top: 8px;

    &::after {
      position: absolute;
      top: -14px;
      right: 47px;
      content: '';
      display: block;
      border: 7px solid transparent;
      border-bottom: 7px solid #fff;
    }
  ` : ''};

  ${ModalWrapperTheme}
`;

export const Tooltip = componentFromObservable<TooltipProps>('Tooltip', props$ => {
  const mouseEvent$ =  props$.pipe(
    switchMap(props => Boolean(props.isShown)
      ? props.type === TooltipType.Click
        ? fromEvent<MouseEvent>(window, TooltipType.Click).pipe(take(1))
        : fromEvent<MouseEvent>(window, TooltipType.Hover)
      : EMPTY,
    ),
  );

  return combineLatest(
    props$,
    mouseEvent$,
  ).pipe(
    map((
      [
        {
          className,
          theme = TooltipTheme.Light,
          isShown = false,
          rightBound,
          withCorner = false,
          children,
          type,
        },
        mouseEvent,
      ]) => {
      const translateX = Boolean(rightBound) ? `calc(${mouseEvent.clientX}px - 100%)` : `${mouseEvent.clientX}px`;
      const translateY = `${mouseEvent.clientY + 10}px`;

      return (
        <ThemeProvider theme={{ mode: theme }}>
          <ModalWrapper
            isOpen={isShown}
            usePointerEvents={type === TooltipType.Click}
            className={className}
            withCorner={withCorner}
            style={{ transform: `translate(${translateX}, ${translateY})` }}
            hasOverlay={false}
          >
            {children}
          </ModalWrapper>
        </ThemeProvider>
      );
    }),
  );
});
