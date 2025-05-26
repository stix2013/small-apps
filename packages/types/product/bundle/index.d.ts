import type { Image } from '../../app/image'
import type { Amount } from '../../balance/amount'
import type { Button } from '../../app/button'

export * from './bundle-item'
export * from './bundle-over-fee'
export * from './bundle-period'
export * from './bundle-resource'

export interface Bundle {
  id: number;
  title: string;
  subtitle?: string;
  sizeData?: string;
  textData?: string;
  image?: Image;
  description?: string;
  shortDescription?: string;
  discount?: number;
  price?: Amount;
  url?: string;
  button?: Button
}

export type BundleList = Bundle[]

export type BundlePrice = Required<Pick<Bundle, 'id' | 'price'>>
