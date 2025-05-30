import type { Amount } from '../../balance/amount'
import type { BundlePeriod } from './bundle-period'
import type { BundleResource } from './bundle-resource'
import type { BundleOverFee } from './bundle-over-fee'

export interface BundleItem {
  id: string | number
  ordering: number
  title: string
  subtitle?: string
  description: string
  shortDesc?: string
  type: string
  region: string
  price: Amount
  period: BundlePeriod
  discount: number
  inBytes: number
  resource: BundleResource
  overFee: BundleOverFee
}

export type BundleItemPrice = Required<Pick<BundleItem, 'id' | 'price' | 'resource'>>
