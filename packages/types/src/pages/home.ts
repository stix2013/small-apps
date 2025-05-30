import type { Image } from '../app/image'
import type { Product } from '../product'

export interface CarouselItem {
  image: Image;
  caption?: string;
  url?: string;
}

export interface Banner {
  id: number,
  page: string,
  title?: string;
  subtitle?: string;
  image: Image;
  titlePosition: 'left' | 'right';
  button?: Button;
}

export type BannerList = Banner[]

export type { FeatureItem } from '../app/feature'

export interface ProductHome extends Product {
  background?: Image
}
