import type { Amount } from '../../balance/amount'

export interface BundleOverFee {
  fee: Amount
  value: number
  unit: string
}
