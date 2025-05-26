import type { ContinentCode } from './continent'
import type { MapScale } from './map/map-scale'

export interface Tab<T> {
  id?: string
  text: string
  value: T
}

export interface TabMap {
  [key: string]: Tab<string>
}
