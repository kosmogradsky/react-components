import { ComparisonElement } from '../store/comparison/comparison.types';

export const parseJsonFromLocalStorage = (key: string) => {
  try {
    const serializedState = localStorage.getItem(key);
    return serializedState !== null ? JSON.parse(serializedState) : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const saveAsJsonToLocalStorage = (state: ComparisonElement[], key: string) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.error(error);
  }
};
