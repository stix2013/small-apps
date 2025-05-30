import type { ContinentCode } from '../app/continent'
import type { CountryCodeName } from '../app/country'
import type { Tab } from '../app/tab'
import type { Price } from '../balance/currency'
import type { WithFilter } from '../generic'
import type { MapScale } from '../map/scale'

export type CoverageSwitchView = 'list' | 'map'

export interface Coverage {
  title: string
  iso: string
  countryZone?: string
  networkBand?: string
  networkCoverage?: string
}

export interface TableKeyLabelField {
  key: string
  label: string
}

export interface DataBundleCountryPrice extends CountryCodeName {
  id: number
  mb: Price
  receiveSms: Price
}

export interface CoverageNetwork extends CountryCodeName {
  id: number
  zone: string
  band: string
  coverage: string
  continentCode: string
}

export interface ChartCoverageReadyEvent {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  draw: Function
  continent: string
}

export interface ContinentMap extends Tab<ContinentCode> {
  region: string
  scale?: MapScale
}

export interface CoverageNetworkHeader {
  id: number
  title: string;
  width: 'auto' | 'large' | 'mid' | 'small';
  align: 'left' | 'right' | 'center';
}

export interface CoverageNetworkHeaders {
  [key: string]: CoverageNetworkHeader;
}

export type TabContinent<T> = Record<ContinentCode, Tab<T>>

export type DataBundlePricesResponse = WithFilter<Omit<DataBundleCountryPrice, 'countryName'>[], string>
export type DataPricesWithFilter = WithFilter<DataBundleCountryPrice[], string>

export type CoverageNetworkResponse<T> = WithFilter<CoverageNetwork[], T>

export type TableField = TableKeyLabelField | string
