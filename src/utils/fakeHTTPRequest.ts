import { asyncScheduler, of } from 'rxjs';
import { delay, observeOn } from 'rxjs/operators';

export const fakeHTTPRequest = <T>(response: T, delayInMs = 1000) => of(response).pipe(
  observeOn(asyncScheduler),
  delay(delayInMs),
);
