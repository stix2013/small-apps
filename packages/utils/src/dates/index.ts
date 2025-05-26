// format date
// format CCYYMMDDHHMMSS
export const getDateFromFormatted = (
  formatted: string,
  timeOffset?: number
): Date => {
  if (!formatted || formatted.length !== 14) {
    throw new Error('Wrong formatted date')
  }

  let timezone = '+00:00'
  if (timeOffset) {
    const hh = Math.floor(timeOffset / 100)
    const mm = timeOffset % 100
    if (timeOffset >= 0) {
      timezone = hh < 10 ? `+0${hh}:${mm}` : `+${hh}:${mm}`
    } else if (hh > -10) {
      timezone = `-0${hh}:${mm}`
    } else {
      timezone = `-${hh}:${mm}`
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
