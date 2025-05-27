import type { InitItemWithIndex } from '@yellow-mobile/types';

export const createInitListState = <T>(
  count: number,
  bundles: T[],
  initFunction: InitItemWithIndex<T>
): T[] => {
  const list = [] as T[];

  if (count === 0) {
    return [];
  }

  for (let index = 0; index < count; index++) {
    if (index < bundles.length && bundles[index] !== undefined) {
      list.push(bundles[index]);
    } else {
      list.push(initFunction(index) as T);
    }
  }
  return list;
};
