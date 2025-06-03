import type { CurrencySymbol } from '@yellow-mobile/types'
import symbols from './assets/currency-symbols.json'

const curSymbols: CurrencySymbol[] = symbols

export function getCurrencySymbol (code: string): string | undefined | null {
  const item = curSymbols.find((item: CurrencySymbol) => item.code === code)

  if (item) {
    return item.symbol
  }

  return ''
}

export const getSymbol = (code: string) => getCurrencySymbol(code)
