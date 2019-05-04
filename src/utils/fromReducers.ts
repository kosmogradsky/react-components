import { merge, Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

type Reducer<S> = (previousState: S) => S;

export const fromReducers = <State>(
  initialState: State | undefined,
  ...reducers: Observable<Reducer<State>>[]
) => merge(...reducers)
  .pipe(scan<Reducer<State>, State>(
    (previousState, reducer) => reducer(previousState),
    initialState,
  ));
