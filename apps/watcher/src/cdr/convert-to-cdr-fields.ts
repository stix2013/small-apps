import { v4 as uuidV4 } from 'uuid'
//
import type { CDRLine } from '@src/types'
import { validateCdrType } from '@src/validation/cdr-type'

// format date
// format CCYYMMDDHHMMSS
const getDateFromFormatted = (
  formatted: string,
  timeOffset?: number
): Date => {
  if (!formatted || formatted.length !== 14) {
    throw new Error('Wrong formatted date')
  }

  let timezone = '+00:00'
  if (timeOffset) {
    const absHh = Math.abs(Math.trunc(timeOffset / 100)); // Ensure hh is integer part
    const absMm = Math.abs(timeOffset % 100);

    if (timeOffset >= 0) {
      timezone = `+${absHh < 10 ? '0' : ''}${absHh}:${absMm < 10 ? '0' : ''}${absMm}`;
    } else { // timeOffset is negative
      timezone = `-${absHh < 10 ? '0' : ''}${absHh}:${absMm < 10 ? '0' : ''}${absMm}`;
    }
  }

  const yearWithCentury = formatted.slice(0, 4)
  const month = formatted.slice(4, 6) // corelation month start with 0
  const date = formatted.slice(6, 8)
  const hour = formatted.slice(8, 10)
  const minute = formatted.slice(10, 12)
  const second = formatted.slice(12, 14)

  const timeDate = `${yearWithCentury}-${month}-${date}T${hour}:${minute}:${second}.000${timezone}`
  return new Date(timeDate)
}

export function convertToCDRFields (line: string[]): CDRLine {
  const result:CDRLine | Partial<CDRLine> = {}
  let errors: string | null

  result.id = uuidV4()

  errors = null

  const timeOffset = +line[13] || 0

  try {
    result.recordType = validateCdrType(line[0])
  } catch (err) {
    errors = (err as Error).message
    // Add this line:
    // result.recordType = line[0] as RecordItem
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
