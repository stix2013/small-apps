import type { Amount } from '../balance/amount'

export interface TopUpAmount {
  id: number;
  title: string;
  amount: Amount;
}

export interface TopUpItem extends TopUpAmount {
  subtitle?: string
  description?: string
  shortDesc?: string
  discount: number
  ordering: number
}

export interface QuickTopUpPayload {
  amount: Amount
  msisdn: string | null
}
