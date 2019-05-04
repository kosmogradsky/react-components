import pick from 'lodash-es/pick';
import * as React from 'react';
import { combineLatest } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import * as sel from '../styles/select';
import { componentFromObservable } from '../utils/componentFromObservable';
import { createEventHandler } from '../utils/createEventHandler';
import { createRef } from '../utils/createRef';
import { or, surely } from '../utils/undefined';
import { Icon } from '../Icon/Icon';
import { Menu, MenuProps, MenuTheme, RenderMenuHead } from '../Menu';
import { TooltipType } from '../Tooltip';

import { SelectOptionElement } from './SelectOption';

type RenderSelectHead = (selectedOption: SelectOptionElement | undefined, isOpen: boolean, theme: MenuTheme) => JSX.Element;
type MenuPropsToPassThrough = Pick<MenuProps, 'maxHeight' | 'className' | 'theme' | 'rightBound' | 'style'>;

type SelectProps = MenuPropsToPassThrough & {
  renderHead?: RenderSelectHead;
  selectedId: string | number;
  selectContainerId?: string;
  onSelectedIdChange: (id: string | number) => void;
  children: SelectOptionElement[];
  fixedWidth?: boolean;
};

const tooltipLifetime = 3000;

const SelectContainer = styled(Menu)`
  padding: 10px 12px 10px 12px;
`;

const TitleButtonTheme = styledTheme('mode', {
  themeDefault: css``,
  themeAside: css`
    display: block;
    width: 100%;
    height: 38px;
    padding-left: 42px;
    padding-right: 10px;
  `,
  themeToolbar: css`
    padding-right: 30px;
  `,
  themeTransparent: css`
    &:hover {
      background-color: transparent;
    }
  `,
});

const ChevronIconTheme = styledTheme('mode', {
  themeDefault: css``,
  themeAside: css`
    left: 12px;
    right: auto;
  `,
  themeToolbar: css``,
  themeTransparent: css``,
});

export const TitleButton = styled.button<{ isActive: boolean }>`
  position: relative;
  display: inline-block;
  padding-right: 24px;
  padding-left: 12px;
  height: 26px;
  cursor: pointer;
  font-size: 13px;
  color: #5A6B8C;
  background: none;
  border-radius: 4px;
  outline: none;
  transition: color 0.3s ease-out, background-color 0.3s ease-out;
  text-align: left;

  &:hover {
    background-color: #F7F7FA;
    color: #1FB4A2;
  }

  ${TitleButtonTheme};
`;

const OptionButton = styled.span<{ isDisabled: boolean }>`
  ${sel.option};

  height: 24px;
  padding: 0px;
  margin: 0px;
  margin-bottom: 7px;

  &:last-child {
    margin-bottom: 0;
  }

  ${props => props.isDisabled ? css`
    opacity: 0.5;
    &:hover {
      color: #5A6B8C;
    }
  ` : ''};
`;

export const ChevronIcon = styled(({ isActive, ...rest }) => <Icon {...rest} />)`
  position: absolute;
  right: 10px;
  top: 50%;
  margin-top: -3px;
  display: inline-block;
  transform-origin: 50% 50%;
  transform: rotate(180deg);
  transition: transform 0.3s ease-out;

  ${props => props.isActive ? css`
    transform: rotate(0);
  ` : ''};

  ${ChevronIconTheme};
`;

export const Select = componentFromObservable<SelectProps>('Select', props$ => {
  const { observable: isOpen$, handler: switchSelect } = createEventHandler<boolean>();
  const { handler: changeHoveredOptionIndex, observable: hoveredOptionIndex$ } = createEventHandler<number | undefined>();
  const { update: updateSelectedOption, observable: selectedOptionRef$ } = createRef<HTMLElement>();

  const scroll$ = combineLatest(props$, isOpen$).pipe(
    filter(([_, isOpen]) => isOpen),
    switchMap(([{ selectContainerId, selectedId, children }]) => selectedOptionRef$.pipe(
      map(() => {
        const selectedOptionIndex = children.findIndex(option => option.props.optionId === selectedId);
        const optionHeight = 31;
        const containerEl = document.querySelector(`#${selectContainerId}`);

        return {
          top: (selectedOptionIndex - 2) * optionHeight,
          element: containerEl !== null ? containerEl : undefined,
          behaviour: 'smooth',
        };
      }),
      filter(scrollObj => scrollObj.element !== undefined)),
    ),
  );

  const hideSelect = () => switchSelect(false);
  let clickTimeout: NodeJS.Timeout;

  const renderChevroneHead = (title: React.ReactNode, isOpen: boolean): RenderMenuHead => theme => (
    <div>
      <ThemeProvider theme={{ mode: theme }}>
        <TitleButton isActive={isOpen}>
          {title}
          <ChevronIcon
            isActive={isOpen}
            icon='chevrone' width='8px' height='5px'
          />
        </TitleButton>
      </ThemeProvider>
    </div>
  );

  const renderDefaultHead: RenderSelectHead = (selectedOption, isOpen, theme) => renderChevroneHead(selectedOption, isOpen)(theme);

  const vdom$ = combineLatest(
    props$,
    isOpen$.pipe(startWith(false)),
    hoveredOptionIndex$.pipe(startWith(undefined)),
  ).pipe(
    map(([props, isOpen, hoveredOptionIndex]) => {
      const renderHead = or(props.renderHead, renderDefaultHead);
      const createHoverListeners = (index: number) => ({
        onMouseEnter: () => changeHoveredOptionIndex(index),
        onMouseLeave: () => changeHoveredOptionIndex(undefined),
      });

      const createClickListeners = (index: number) => ({
        onMouseDown: () => {
          changeHoveredOptionIndex(hoveredOptionIndex === index ? undefined : index);
          clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => changeHoveredOptionIndex(undefined), tooltipLifetime);
        },
      });

      const renderItem = (option: SelectOptionElement, index: number) => (
        <OptionButton
          isDisabled={or(option.props.disabled, false)}
          key={option.props.optionId}
          onClick={Boolean(option.props.disabled) ? undefined : (() => {
            props.onSelectedIdChange(option.props.optionId);
            hideSelect();
          })}
          {...(option.props.renderInfo !== undefined && option.props.type === TooltipType.Hover ? createHoverListeners(index) : createClickListeners(index))}
        >
          {option.props.optionId === props.selectedId ?
            React.cloneElement(
              option,
              {
                ...option.props,
                isInfoShown: hoveredOptionIndex === index,
                ref: updateSelectedOption,
              },
            ) :
            React.cloneElement(
              option,
              {
                ...option.props,
                isInfoShown: hoveredOptionIndex === index,
              },
            )
          }
        </OptionButton>
      );

      const selectedChild = props.children.find(option => option.props.optionId === props.selectedId);
      const menuPropsToPassThrough = pick(props, ['maxHeight', 'className', 'theme', 'rightBound', 'style', 'fixedWidth']);

      return (
        <SelectContainer
          isOpen={isOpen}
          id={props.selectContainerId}
          onRequestClose={hideSelect}
          renderHead={theme => React.cloneElement(
            renderHead(
              surely(selectedChild, child => React.cloneElement(child, { renderInfo: undefined }), undefined),
              isOpen,
              theme,
            ), {
              onClick: () => switchSelect(true),
            },
          )}
          {...menuPropsToPassThrough}
        >
          {React.Children.map(props.children, renderItem)}
        </SelectContainer>
      );
    }),
  );

  return { vdom$, scroll$ };
});
