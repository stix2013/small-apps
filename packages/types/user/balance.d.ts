import type { Amount } from '../balance/amount'

export interface BalanceNumber {
  msisdn: string | null
  balance: Amount
  lastFetching: number
  error: string | object | null
}

export type BalanceNumbers = Record<string, BalanceNumber>