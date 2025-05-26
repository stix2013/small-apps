import type { MapScale } from './scale'

export interface MapRegion {
  key: string
  region: string
  scale?: MapScale
}
