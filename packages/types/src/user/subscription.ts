import type { ValueUnit } from './generic'
import type { InternetUnit, TimeUnit } from '../units'

export interface Subscription {
  productId: string
  productName: string
  total: ValueUnit<InternetUnit>
  remain: ValueUnit<InternetUnit>
  period: ValueUnit<TimeUnit>
  region: string
  orderedAt: string // yyyy-mm-dd hh:MM:ss
  expiredAt: string
}
