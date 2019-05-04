const defaultIsEqual = <T>(a: T, b: T) => a === b;

export const shallowEqualObjects = (isEqual = defaultIsEqual) => <T extends { [key: string]: unknown }>(objA: T, objB: T) => {
  if (isEqual(objA, objB)) {
    return true;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (!isEqual(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
};
