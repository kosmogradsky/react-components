import { HeightProperty, WidthProperty } from 'csstype';
import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';
import { Omit } from 'utility-types';

import { componentFromObservable } from '../utils/componentFromObservable';

export type IconProps = Omit<JSX.IntrinsicElements['span'], 'ref'> & {
  icon: string;
  width?: WidthProperty<React.ReactText>;
  height?: HeightProperty<React.ReactText>;
};

const IconWrapper = styled.span`
  display: inline-block;
  font-size: 0;

  svg {
    overflow: visible;
    width: 100%;
    height: 100%;
  }
`;

export const Icon = componentFromObservable<IconProps>('ComponentFromObservable', props$ => props$.pipe(
  map(({ className, icon, width, height, style, ...rest }) => (
    <IconWrapper
      {...rest}
      className={className}
      style={{ width, height, ...style }}
      dangerouslySetInnerHTML={{ __html: require(`./icons/${icon}.svg`) }}
    />
  )),
));
