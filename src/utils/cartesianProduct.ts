import concat from 'lodash-es/concat';
import flatten from 'lodash-es/flatten';

interface CartesianProduct {
  <T1, T2>(arrayA: T1[], arrayB: T2[]): [T1, T2][];
  <T1, T2, T3>(arrayA: T1[], arrayB: T2[], arrayC: T3[]): [T1, T2, T3][];
  <T1, T2, T3, T4>(arrayA: T1[], arrayB: T2[], arrayC: T3[], arrayD: T4[]): [T1, T2, T3, T4][];
  <T1, T2, T3, T4, T5>(arrayA: T1[], arrayB: T2[], arrayC: T3[], arrayD: T4[], arrayE: T5[]): [T1, T2, T3, T4, T5][];
  <T1, T2, T3, T4, T5, T6>(arrayA: T1[], arrayB: T2[], arrayC: T3[], arrayD: T4[], arrayE: T5[], arrayF: T6[]): [T1, T2, T3, T4, T5, T6][];
}

export const cartesianProduct: CartesianProduct = (...arrays: any[][]) => arrays.reduce(
  (arrayA, arrayB) => flatten(arrayA.map(
    elementOrArrayFromA => arrayB.map(
      elementFromB => concat(elementOrArrayFromA, elementFromB),
    ),
  )),
);
