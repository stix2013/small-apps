import type { Amount } from '../balance/amount'
import type { ValueUnit } from '../generic'
import type { InternetUnit, TimeUnit } from '../units'
import type { Image } from '../app/image'

export interface Product {
  title: string;
  image?: Image;
  description: string | string[];
  extra: string | string[];
  button: {
    text: string;
    url: string;
  }
}

export interface YellowProduct {
  id: number
  name: string
  productType?: string
  price: Amount
  total: ValueUnit<InternetUnit>
  remain: ValueUnit<InternetUnit>
  period: ValueUnit<TimeUnit>
  region?: string
  orderedDate: Date
  expiredDate: Date
}

export interface MsisdnYellowProduct {
  msisdn?: string
  isBlocked: boolean
  status: boolean
  simNumber?: string
  simType: string // normal
  verifiedMsisdn: boolean
  msisdnVerifiedAt: string
  products: YellowProduct[]
  lastFetching: number
  lastError: string | object | null
}

export type MsisdnYellowProductNumbers = Record<string, MsisdnYellowProduct>
