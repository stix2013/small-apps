import { v4 as uuidV4 } from 'uuid'
import { getDateFromFormatted } from '@yellow-mobile/utils'
//
import type { CDRLine } from '@src/types'
import { validateCdrType } from '@src/validation/cdr-type'

export function convertToCDRFields (line: string[]): CDRLine {
  const result:CDRLine | Partial<CDRLine> = {}
  let errors: string | null

  result.id = uuidV4()

  errors = null

  const timeOffset = +line[13] || undefined

  try {
    result.recordType = validateCdrType(line[0])
  } catch (err) {
    errors = (err as Error).message
  }

  result.valid = errors === null

  result.number = line[1]
  result.numberB = line[2]
  result.numberDialed = line[3]
  result.msisdn = line[4]
  result.imsi = line[5]
  result.eventTimestamp = getDateFromFormatted(line[6], timeOffset) // new Date(), // parseInt(line[6])
  result.eventTimestampNumber = parseInt(line[6]) || 0
  result.eventDuration = parseInt(line[7]) || 0
  result.volumeDownload = parseInt(line[8])
  result.volumeUpload = parseInt(line[9])
  result.codeOperator = line[10]
  result.amountPrerated = parseFloat(line[11]) || 0.0
  result.apn = line[12]
  result.nulli = +line[13] || 0
  result.broadWorks = line[14]
  result.codeTeleService = line[15]
  result.codeBearerService = line[16]
  result.codeOverseas = line[17]
  result.videoIndicator = line[18]
  result.source = line[19]
  result.serviceId = line[20]
  // quantity: line[21],
  // custNumber: line[22],
  result.description = line[23]
  result.callIdentification = line[24]

  return result as CDRLine
}
