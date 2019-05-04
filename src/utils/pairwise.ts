export const pairwise = <T>(array: T[]) => {
  const arrayOfPairs: [T, T][] = [];

  if (array.length < 2) {
    return [];
  }

  for (let i = 1; i < array.length; i++) {
    arrayOfPairs.push([array[i - 1], array[i]]);
  }

  return arrayOfPairs;
};
