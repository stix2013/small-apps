export const getFullPath = (baseUrl: string, basePort?: string | number) => {
  // const sp = baseUrl.split(':')
  const url = new URL(baseUrl)

  if (basePort) {
    url.port = basePort.toString()
  }

  return url.href
}
