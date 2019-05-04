export const customStringSort = (a: string | number, b: string | number) => {
  const stringA = a.toString();
  const stringB = b.toString();

  if (stringA.startsWith(stringB)) {
    return -1;
  } else if (stringB.startsWith(stringA)) {
    return 1;
  }

  return stringA.localeCompare(stringB);
};
