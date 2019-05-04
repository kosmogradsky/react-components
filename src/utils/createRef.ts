import { Subject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { shareLatest } from './shareLatest';

export const createRef = <T>() => {
  const emitter = new Subject<T>();

  return {
    update: (payload: T) => emitter.next(payload),
    observable: emitter.pipe(
      filter(ref => ref !== undefined),
      distinctUntilChanged(),
      shareLatest(),
    ),
  };
};
