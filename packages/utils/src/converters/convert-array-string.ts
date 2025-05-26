export function convertArrayString (
  data: undefined | string | string[]
): string {
  if (data === undefined) {
    return ''
  }

  if (typeof data === 'string') {
    return data
  }

  let result = ''

  for (const datum of data) {
    result += datum
  }

  return result
}
