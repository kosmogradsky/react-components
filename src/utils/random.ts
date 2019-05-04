export const getRandomNumber = (from: number, to: number) => Math.floor(Math.random() * to) + from;
export const getRandomBoolean = (chance = 0.5) => Math.random() >= chance;
export const getNullableRandomNumber = (from: number, to: number, chance = 0.1) => Math.random() >= 1 - chance
  ? undefined
  : Math.floor(Math.random() * to) + from;

type RandomItemsType = <T1>(array: T1[]) => T1[];

export const getRandomItems: RandomItemsType = array => {
  const itemsCount = Math.floor(Math.random() * array.length) + 1;
  const shuffledArray = array.sort(() => 0.5 - Math.random());

  return shuffledArray.slice(0, itemsCount);
};
