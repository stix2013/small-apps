export type RecordItem = 'RSMO' | 'RMT' | 'GP' | 'SMS'

export interface CDRLine {
  id: string
  valid: boolean
  recordType: RecordItem
  number: string
  numberB?: string
  numberDialed?: string
  msisdn: string
  imsi: string
  eventTimestamp: Date
  eventTimestampNumber: number
  eventDuration: number
  volumeDownload: number
  volumeUpload: number
  codeOperator: string
  amountPrerated: number
  apn: string
  nulli: number // HHMM
  broadWorks?: string
  codeTeleService?: string
  codeBearerService?: string
  codeOverseas?: string
  videoIndicator?: string
  source?: string
  serviceId?: string
  description?: string
  callIdentification: string
  errors: null | string
}

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

export interface CDRFile {
  id: string
  filename: string
  fileCreatedAt: string // Date
  status: 'OK' | 'ERROR' | 'EMPTY_CONTENT' | 'PROCESSING'
  lineCount: number
  lineInvalidCount: number
  error?: null | string
  processedAt?: null | string
  lineIndexBegin: number
  lines: CDRLine[]
}

