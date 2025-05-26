import { subLogger } from '@yellow-mobile/logger'

// export const logCdr = subLogger('CDR')
// export const logPost = subLogger('POST')
// export const logSimInnApi = subLogger('API')
// export const logSimInnSMS = subLogger('SMS')

export const logCdrFilename = (filename: string) => subLogger(`CDR ${filename}`)

export const createLoggers = () => {
  const logCdr = subLogger('CDR')
  const logPost = subLogger('POST')
  const logSimInnApi = subLogger('API')
  const logSimInnSMS = subLogger('SMS')

  return {
    logCdr,
    logPost,
    logSimInnApi,
    logSimInnSMS
  }
}

// export const loggers = [
//   logCdr,
//   logPost,
//   logSimInnApi,
//   logSimInnSMS
// ]
