export function convertToBytes (value: number | string, unit: string, k = 1024) {
  const sizes = [
    'Bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB',
    'BB'
  ]

  let index = sizes.indexOf(unit)

  if (index === -1) {
    index = 0
  }

  if (typeof value === 'string') {
    const strValue = parseInt(value)
    if (isNaN(strValue)) {
      return 0
    }
    return Math.pow(k, index) * strValue
  }

  if (value < 0) {
    return 0
  }

  return Math.pow(k, index) * value
}
