import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export const select = <T, R>(selector: (value: T, index: number) => R) => (source: Observable<T>) => source.pipe(
  map(selector),
  distinctUntilChanged(),
);
