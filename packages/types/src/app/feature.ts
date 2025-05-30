import type { Image } from './image'

export interface FeatureItem {
  id: number,
  title: string;
  titleAlt?: string;
  image: Image;
  imageAlt?: Image;

  shortDescription?: string;
  sort: number;
  url?: string;
}
