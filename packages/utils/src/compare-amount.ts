import type { Amount } from '@yellow-mobile/types'

export const compareAmount = <K extends Amount>(amountA: K, amountB: K): boolean => {
  return amountA.currency === amountB.currency && amountA.value === amountB.value
}
