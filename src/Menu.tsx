import { translateY } from 'csx';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from './utils/componentFromObservable';
import { createRef } from './utils/createRef';
import { Modal, ModalProps } from './Modal';

const isIE = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style;

export enum MenuTheme {
  Default = 'themeDefault',
  Aside = 'themeAside',
  Transparent = 'themeTransparent',
  Toolbar = 'themeToolbar',
}

export type RenderMenuHead = (theme: MenuTheme) => JSX.Element;

export type MenuProps = Pick<ModalProps, 'isOpen' | 'onRequestClose'> & {
  maxHeight?: number;
  height?: number;
  className?: string;
  theme?: MenuTheme;
  rightBound?: boolean;
  style?: React.CSSProperties;
  renderHead: RenderMenuHead;
  children: React.ReactNode;
  id?: string;
  fixedWidth?: boolean;
  upside?: boolean;
};

const MenuWrapper = styled(Modal)`
  position: absolute;
  border-radius: 4px;
  box-shadow: 0 6px 10px rgba(47, 64, 98, 0.2);
  background-color: #fff;
  overflow: auto;
`;

export const Menu = componentFromObservable<MenuProps>('Menu', props$ => {
  const { update: updateButtonRef, observable: buttonRef$ } = createRef<HTMLButtonElement>();

  const state$ = combineLatest(
    props$,
    buttonRef$.pipe(startWith(undefined)),
  ).pipe(
    map(([props, buttonRef]) => {
      if (props.isOpen) {
        const buttonBox = Boolean(buttonRef) ? buttonRef.getBoundingClientRect() : undefined;
        const isRightBound = props.rightBound;
        const isLeftBound = !Boolean(isRightBound);
        const isUpside = Boolean(props.upside);
        const height = props.height !== undefined ? props.height : 0;
        const verticalPadding = 4;

        const stylesForMenuContainer = {
          top: buttonBox !== undefined ? buttonBox.bottom + verticalPadding : undefined,
          minWidth: buttonBox !== undefined ? buttonBox.width : undefined,
          width: isIE && Boolean(props.fixedWidth) && buttonBox !== undefined ? buttonBox.width : undefined,
          left: isLeftBound && buttonBox !== undefined ? buttonBox.left : undefined,
          right: Boolean(isRightBound) && buttonBox !== undefined ? (window.innerWidth - buttonBox.right) : undefined,
          transform: isUpside ? translateY(`-${height - verticalPadding}px`) : undefined,
        };

        return {
          ...props,
          style: {
            ...stylesForMenuContainer,
            ...props.style,
          },
        };
      }

      return { ...props, style: {} };
    }),
  );

  return state$.pipe(
    map(({
      className,
      children,
      theme = MenuTheme.Default,
      renderHead,
      maxHeight,
      isOpen,
      onRequestClose,
      style,
      id,
    }) => (
        <>
          {React.cloneElement(renderHead(theme), {
            ref: updateButtonRef,
          })}
          <MenuWrapper
            id={id}
            className={className}
            style={{ ...style, maxHeight }}
            isOpen={isOpen}
            onRequestClose={onRequestClose}
          >
            {children}
          </MenuWrapper>
        </>
      )),
  );
});
