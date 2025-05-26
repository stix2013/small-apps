import type { CurrencySymbol } from '@yellow-mobile/types'
import symbols from './currency-symbols.json'

// const curSymbols: CurrencySymbol[] = [
//   {
//     currency: 'Euro Member Countries',
//     code: 'EUR',
//     symbol: '€'
//   },
//   {
//     currency: 'United States Dollar',
//     code: 'USD',
//     symbol: '$'
//   },
//   {
//     currency: 'Iceland Krona',
//     code: 'ISK',
//     symbol: 'kr'
//   }
// ]

const curSymbols: CurrencySymbol[] = symbols

export function getCurrencySymbol (code: string): string | undefined | null {
  const item = curSymbols.find((item: CurrencySymbol) => item.code === code)

  if (item) {
    return item.symbol
  }

  return ''
}

export const getSymbol = (code: string) => getCurrencySymbol(code)
