import lodashPick from 'lodash-es/pick';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { shallowEqualObjects } from './shallowEqualObjects';

export const pick = <T extends object, U extends keyof T>(...properties: U[]) => (source: Observable<T>) => source.pipe(
  map(value => lodashPick(value, properties)),
  distinctUntilChanged(shallowEqualObjects()),
);
