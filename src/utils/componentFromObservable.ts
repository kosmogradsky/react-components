import { func, shape } from 'prop-types';
import { PureComponent } from 'react';
import { Store } from 'redux';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';

import { rootElement } from '../main';
import { AppAction, AppState } from '../store/store.types';

import { or } from './undefined';

const convertState$ = (store: Store<AppState, AppAction>) => new Observable<AppState>(observer => {
  const unsubscribe = store.subscribe(() => observer.next(store.getState()));
  observer.next(store.getState());

  return unsubscribe;
});

interface State {
  vdom: React.ReactNode;
}

interface Context {
  store: Store<AppState, AppAction>;
}

interface Sinks {
  vdom$: Observable<React.ReactNode>;
  action$?: Observable<AppAction>;
  scroll$?: Observable<{
    element?: Element,
    top: number,
    left?: number,
    behavior?: ScrollBehavior,
  }>;
  focus$?: Observable<HTMLElement>;
}

type SourcesToSinks<P> = (props: Observable<P>, state: Observable<AppState>) => Sinks | Observable<React.ReactNode>;

export const componentFromObservable = <P = {}>(
  displayName: string,
  sourcesToSinks: SourcesToSinks<P>,
) => class ComponentFromObservable extends PureComponent<P, State> {
  static displayName = displayName;

  static contextTypes = {
    store: shape({
      getState: func.isRequired,
      subscribe: func.isRequired,
    }).isRequired,
  };

  propsSource = new Subject<P>();
  state = { vdom: <React.ReactNode>undefined };

  sinks: Sinks | Observable<React.ReactNode>;
  vdomSubscription: Subscription | undefined;
  scrollSubscription: Subscription | undefined;
  actionSubscription: Subscription;
  focusSubscription: Subscription | undefined;

  constructor(props: P, context: Context) {
    super(props);

    this.sinks = sourcesToSinks(this.propsSource.asObservable(), convertState$(context.store));

    this.actionSubscription = (or((<Sinks>this.sinks).action$, EMPTY)).subscribe(action => {
      context.store.dispatch(action);
    });
  }

  componentDidMount() {
    const vdom$ = or((<Sinks>this.sinks).vdom$, <Observable<React.ReactNode>>this.sinks);
    this.vdomSubscription = vdom$.subscribe(vdom => {
      this.setState({ vdom });
    });

    this.scrollSubscription = (or((<Sinks>this.sinks).scroll$, EMPTY)).subscribe(({
      element,
      top,
      left,
      behavior,
    }) => {
      const domElement = or(element, rootElement);
      if (!(Boolean(domElement.scroll))) {
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

    this.focusSubscription = (or((<Sinks>this.sinks).focus$, EMPTY)).subscribe(element => {
      element.focus();
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
    this.actionSubscription.unsubscribe();
    if (this.vdomSubscription !== undefined) { this.vdomSubscription.unsubscribe(); }
    if (this.scrollSubscription !== undefined) { this.scrollSubscription.unsubscribe(); }
    if (this.focusSubscription !== undefined) { this.focusSubscription.unsubscribe(); }
  }

  render() {
    return this.state.vdom !== undefined ? this.state.vdom : null;
  }
};
