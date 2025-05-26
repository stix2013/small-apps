import type { InitItemWithIndex } from '@yellow-mobile/types'

export const createInitListState = <T>(
  count: number,
  bundles: T[],
  initFunction: InitItemWithIndex<T>
): T[] => {
  const list = [] as T[]

  if (count > bundles.length) {
    return bundles
  }

  for (let index = 0; index < count; index++) {
    if (bundles.length > 0 && bundles[index]) {
      list.push(bundles[index])
    } else {
      list.push(initFunction(index) as T)
    }
  }

  return list
}
