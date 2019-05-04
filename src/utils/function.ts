export const forearm = <A extends unknown[], R>(
  func: (...args: A) => R,
  args: A,
) => () => func(...args);

export const batch = (...effects: (() => void)[]) => () => effects.forEach(effect => effect());
