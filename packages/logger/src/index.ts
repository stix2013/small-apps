import { config } from 'dotenv'
import DailyRotateFile from 'winston-daily-rotate-file'
import { type Logger, addColors, format, loggers, transports } from 'winston'

//
const { colorize, combine, label: formatLabel, printf: formatPrint, timestamp } = format

// read environment file
config()

const APP_NAME = process.env.APP_NAME || 'logger'
const DAILY_FREQUENCY = process.env.LOG_DAILY_FREQUENCY
const DAILY_ZIP = !!(process.env.LOG_DAILY_ZIP || process.env.LOG_DAILY_ZIP === 'yes')
const TIMESTAMP_FORMAT = process.env.LOG_TIME_FORMAT || 'YYYY-MM-DD HH:mm:ss'
const DAILY_FORMAT = process.env.LOG_DAILY_FORMAT || 'YYYYMMDD-HH'
const FILE_INFO = process.env.LOG_FILENAME_INFO || 'info.log'
const FILE_COMBINE = process.env.LOG_FILENAME_COMBINE || 'combine.log'
const FILE_ERROR = process.env.LOG_FILENAME_ERROR || 'error.log'
const FILE_EXCEPTION = process.env.LOG_FILENAME_EXCEPTION || 'exception.log'
const MAX_SIZE = process.env.LOG_MAX_SIZE || '20m'
const MAX_FILES = process.env.LOG_MAX_FILES || '14d'
const DAILY_PATH = process.env.LOG_DAILY_PATH || '.'
const DAILY_FILENAME = `${DAILY_PATH}/${APP_NAME.toLowerCase()}-%DATE%.log`

export interface YellowLogger {
  logger: Logger
}

const customFormat = formatPrint(({ timestamp, label, message, level }) => {
  return `${timestamp} [${level}] [${label}] ${message}`
})

export const subLogger = (lblString?: string, fmtTimestamp?: string) => {
  addColors({
    info: 'cyan', // fontStyle color
    warn: 'yellow',
    error: 'red',
    debug: 'green'
  })

  // rotate file daily
  const transportDaily: DailyRotateFile = new DailyRotateFile({
    filename: DAILY_FILENAME, // `${APP_NAME.toLowerCase()}-%DATE%.log`,
    datePattern: DAILY_FORMAT,
    zippedArchive: DAILY_ZIP,
    maxSize: MAX_SIZE,
    maxFiles: MAX_FILES,
    frequency: DAILY_FREQUENCY
  })

  const label = lblString || APP_NAME
  return loggers.add(label, {
    level: 'info',
    format: combine(
      formatLabel({ label }),
      timestamp({
        format: fmtTimestamp || TIMESTAMP_FORMAT
      }),
      customFormat
    ),
    defaultMeta: {
      service: 'ym-logger-service'
    },
    exitOnError: false,
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          format.timestamp({ format: TIMESTAMP_FORMAT }),
          customFormat
        )
      }),
      new transports.File({
        filename: FILE_ERROR,
        level: 'error',
        maxFiles: 3
      }),
      new transports.File({
        filename: FILE_INFO,
        level: 'info',
        maxFiles: 5
      }),
      new transports.File({
        filename: FILE_COMBINE
      }),
      transportDaily
    ],
    exceptionHandlers: [
      new transports.File({
        filename: FILE_EXCEPTION,
        maxFiles: 2
      })
    ]
  })
}

