import * as React from 'react';
import { map } from 'rxjs/operators';
import styled from 'styled-components';

import { componentFromObservable } from './utils/componentFromObservable';
import { select } from './utils/select';

const Host = styled.div`
  display: block;
  transition: opacity 1s;
  width: 100%;
  left: 0;
  top: 0;
  position: sticky;
  z-index: 100;
`;

const LoaderElement = styled.div`
  height: 4px;
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #F5F6F8;

  &:before {
    display: block;
    position: absolute;
    content: "";
    left: -200px;
    width: 200px;
    height: 4px;
    background-color: #1FB7A4;
    animation: loading 2s linear infinite;
  }

  @keyframes loading {
    from {left: -200px; width: 30%;}
    50% {width: 30%;}
    70% {width: 70%;}
    80% { left: 50%;}
    95% {left: 120%;}
    to {left: 100%;}
  }
`;

const Progress = styled.div`
  background-color: #1FB7A4;
  height: 5px;
  width: 0;
  opacity: 1;
  transition: opacity 0s;
`;

export const Loader = componentFromObservable('ComponentFromObservable', (_props$, state$) => {
  const loaderState$ = state$.pipe(select(state => state.loader));

  return loaderState$.pipe(
    map(({ isLoading, progress }) => (
      <Host style={{ opacity: isLoading ? 1 : 0 }}>
        {!Boolean(progress) ? <LoaderElement/> : ''}
        {Boolean(progress) ? <Progress style={{ width: `${progress}%` }}/> : ''}
      </Host>
    )),
  );
});
