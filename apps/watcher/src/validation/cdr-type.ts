import { RECORD_TYPES } from '@src/consts'
import type { RecordItem } from '@src/types/cdr-line'

export const validateCdrType = (cdrType: string): RecordItem => {
  const types = Object.keys(RECORD_TYPES)

  if (!types.includes(cdrType.toUpperCase())) {
    throw new Error(`${cdrType} is not valid a CDR type`)
  }

  return cdrType as RecordItem
}
