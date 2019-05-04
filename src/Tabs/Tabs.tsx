import * as React from 'react';
import { map } from 'rxjs/operators';
import styled, { css, ThemeProvider } from 'styled-components';
import styledTheme from 'styled-theming';

import { componentFromObservable } from '../utils/componentFromObservable';

import { TabProps } from './Tab';
import { TabWithTooltipProps } from './TabWithTooltip';

export enum TabsTheme {
  Bordery = 'themeBordery',
  Shadowy = 'themeShadowy',
  Small = 'themeSmall',
}

interface Props {
  className?: string;
  theme?: TabsTheme;
  children: React.ReactElement<TabProps | TabWithTooltipProps>[];
  activeId: string | number;
  onActiveIdChange: (index: string | number ) => void;
}

const TabsWrapperTheme = styledTheme('mode', {
  themeSmall: css`
    border-radius: 4px;
    border: 1px solid #88CCC4;
    height: 40px;
  `,
  themeBordery: css`
    border-radius: 4px;
    border: 1px solid #88CCC4;
    height: 40px;
`,
  themeShadowy: css`
    height: 34px
`,
});

const TabsWrapper = styled.div`
  display: inline-flex;

  ${TabsWrapperTheme};

  &:first-of-type {
    margin-right: 20px;
  }

  @media not all and (min-resolution:.001dpcm) {
    @media {
      &:first-of-type {
        margin-right: 15px;
      }
    }
  }

  @media print {
    display: inline-block;
    border: none;
    margin-bottom: 0;
    height: 20px;
  }
`;

export const Tabs = componentFromObservable<Props>('Tabs', props$ => props$.pipe(
  map(({ theme = TabsTheme.Bordery, children, activeId, onActiveIdChange, className }) => (
    <ThemeProvider theme={{ mode: theme }}>
      <TabsWrapper className={className}>
        {React.Children.map(children, tab => {
          const isTabActive = tab.props.tabId === activeId;

          return React.cloneElement(tab, {
            withShadows: theme === TabsTheme.Shadowy,
            disabled: tab.props.disabled,
            isActive: isTabActive,
            onClick: () => onActiveIdChange(tab.props.tabId),
          });
        })}
      </TabsWrapper>
    </ThemeProvider>
  )),
));
