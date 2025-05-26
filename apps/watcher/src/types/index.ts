import type { RecordItem } from './cdr-line'

export * from './cdr-line'

export type CDRRecord = Record<RecordItem, string>

export interface CDRFileInfo {
  group: string
  name: string
  number: string | number
  birthtime?: Date
  lines: {
    total: number
    invalid: number
  }
}
