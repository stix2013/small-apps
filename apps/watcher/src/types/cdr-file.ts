import type { CDRLine } from './cdr-line'

export interface CDRFile {
  id: string
  filename: string
  fileCreatedAt: string // Date
  status: 'OK' | 'ERROR'
  lineCount: number
  lineInvalidCount: number
  error?: null | string
  processedAt?: null | string
  lineIndexBegin: number
  lines: CDRLine[]
}
