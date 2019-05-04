import { PureComponent, ReactNode } from 'react';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { map, scan } from 'rxjs/operators';

import { rootElement } from '../main';

import { or } from './undefined';

export type Loop<S> = [S, (() => void)?];
export type Reducer<S> = (previousState: S) => Loop<S>;
export type ConditionReducer<C extends S, S> = (previousState: C) => Loop<S>;

interface State {
  vdom: React.ReactNode;
}

interface Sinks<S> {
  vdom$: Observable<React.ReactNode>;
  reducer$?: Observable<Reducer<S>>;
  scroll$?: Observable<{
    element?: HTMLElement,
    top: number,
    left?: number,
    behavior?: ScrollBehavior,
  }>;
  focus$?: Observable<HTMLElement>;
}

type SourcesToSinks<P, S> = (state: Observable<S>, props: Observable<P>) => Sinks<S>;

export const componentFromObservableAndState = <S, P = {}>(
  sourcesToSinks: SourcesToSinks<P, S>,
) => class ComponentFromObservable extends PureComponent<P, State> {
  propsSource = new Subject<P>();
  stateSource = new Subject<S>();
  state = { vdom: <React.ReactNode>null };

  sinks = sourcesToSinks(this.stateSource.asObservable(), this.propsSource.asObservable());
  stateSubscription: Subscription | undefined;
  vdomSubscription: Subscription | undefined;
  scrollSubscription: Subscription | undefined;
  focusSubscription: Subscription | undefined;

  componentDidMount() {
    this.vdomSubscription = or(this.sinks.vdom$, EMPTY as Observable<ReactNode>).subscribe(vdom => {
      this.setState({ vdom });
    });

    this.scrollSubscription = or(this.sinks.scroll$, EMPTY).subscribe(({
      element,
      top,
      left,
      behavior,
    }) => {
      const domElement = or(element, rootElement);
      if (!Boolean(domElement.scroll)) {
        domElement.scrollTop = top;
        if (left !== undefined) { domElement.scrollLeft = left; }
        return;
      }
      domElement.scroll({
        top,
        left,
        behavior,
      });
    });

    this.focusSubscription = or(this.sinks.focus$, EMPTY).subscribe(element => {
      element.focus();
    });

    this.stateSubscription = or(this.sinks.reducer$, EMPTY).pipe(
      scan<Reducer<S>, S>((previousState, reducer) => {
        const [state, effect] = reducer(previousState);

        if (effect !== undefined) { effect(); }

        return state;
      }, undefined),
    ).subscribe(state => {
      this.stateSource.next(state);
    });

    this.propsSource.next(this.props);
  }

  componentDidUpdate(prevProps: P) {
    if (prevProps !== this.props) {
      this.propsSource.next(this.props);
    }
  }

  componentWillUnmount() {
    this.propsSource.complete();
    this.stateSource.complete();
    if (this.stateSubscription !== undefined) { this.stateSubscription.unsubscribe(); }
    if (this.vdomSubscription !== undefined) { this.vdomSubscription.unsubscribe(); }
    if (this.scrollSubscription !== undefined) { this.scrollSubscription.unsubscribe(); }
    if (this.focusSubscription !== undefined) { this.focusSubscription.unsubscribe(); }
  }

  render() {
    return this.state.vdom;
  }
};

export const childReducer = <R, K extends string, P extends { [key in K]: R }>(
  childKey: K,
  childReducer$: Observable<Reducer<R>>,
) => childReducer$.pipe(map((reducer): Reducer<P> => (prevState: P): Loop<P> => {
  const [state, effect] = reducer(prevState[childKey]);

  return [
    { ...prevState, [childKey]: state },
    effect,
  ];
}));

export const conditionReducer = <
  C extends S,
  S extends { condition: string },
>(
  condition: C['condition'],
  conditionReducer$: Observable<ConditionReducer<C, S>>,
) => conditionReducer$.pipe(
  map((conditionReducerFn): Reducer<S> => prevState => prevState.condition === condition
    ? conditionReducerFn(prevState as C)
    : [prevState],
  ),
);
