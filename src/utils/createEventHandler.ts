import { Subject } from 'rxjs';

export type Handler<T> = (payload: T) => void;

export const createEventHandler = <T>() => {
  const emitter = new Subject<T>();

  return {
    handler: (payload: T) => emitter.next(payload),
    observable: emitter.asObservable(),
  };
};
