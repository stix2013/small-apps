import type { WinstonLogger as Logger } from '@yellow-mobile/logger'
import { subLogger } from '@yellow-mobile/logger'

const logCdr = subLogger('CDR')
const logPost = subLogger('POST')
const logSimInnApi = subLogger('API')
const logSimInnSMS = subLogger('SMS')

const defaultNames = {
  logCdr: 'CDR',
  logPost: 'POST',
  logSimInnApi: 'API',
  logSimInnSMS: 'SMS'
}

export const loggers = new Map<string, Logger>()

export const logCdrFilename = (filename: string) => subLogger(`CDR ${filename}`)

export const createLoggers = (names?: Record<string, string>): Map<string, Logger> => {

  if (names) {
    for (const [key, value] of Object.entries(names)) {
      if (!loggers.has(key)) {
        loggers.set(key, subLogger(value))
      }
    }

    return loggers
  }

  if (!loggers.has(defaultNames.logCdr)) {
    loggers.set(defaultNames.logCdr, logCdr)
  }

  if (!loggers.has(defaultNames.logPost)) {
    loggers.set(defaultNames.logPost, logPost)
  }

  if (!loggers.has(defaultNames.logSimInnApi)) {
    loggers.set(defaultNames.logSimInnApi, logSimInnApi)
  }

  if (!loggers.has(defaultNames.logSimInnSMS)) {
    loggers.set(defaultNames.logSimInnSMS, logSimInnSMS)
  }

  // Return the singleton instances
  return loggers
}
