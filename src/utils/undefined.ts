export const or = <T>(value: T | undefined, fallback: T): T => value === undefined ? fallback : value;

interface SurelyFn {
  <T, R, F>(maybeValue: T | undefined, mapper: (value: T) => R, fallback: F): R | F;
  <T, R>(maybeValue: T | undefined, mapper: (value: T) => R): R | undefined;
}

export const surely: SurelyFn = <T, R, F>(
  maybeValue: T | undefined,
  mapper: (value: T) => R,
  fallback?: F,
) => maybeValue === undefined ? fallback : mapper(maybeValue);
