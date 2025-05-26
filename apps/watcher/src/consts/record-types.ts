import type { CDRRecord } from '@src/types'

export const RECORD_TYPES: CDRRecord = {
  RSMO: 'SMS originating record',
  RMT: 'SMS terminating record',
  GP: 'Native GPRS record (GGSN records)',
  SMS: 'Native SMS originating record'
}
