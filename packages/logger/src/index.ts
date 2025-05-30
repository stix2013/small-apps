import DailyRotateFile from 'winston-daily-rotate-file'
import { type Logger, addColors, format, loggers, transports } from 'winston'
import { loadConfig } from './load-config'
//
const { colorize, combine, label: formatLabel, printf: formatPrint, timestamp } = format


export interface YellowLogger {
  logger: Logger
}

const {
  APP_NAME,
  DAILY_FREQUENCY,
  DAILY_ZIP,
  TIMESTAMP_FORMAT,
  DAILY_FORMAT,
  FILE_INFO,
  FILE_COMBINE,
  FILE_ERROR,
  FILE_EXCEPTION,
  MAX_SIZE,
  MAX_FILES,
  DAILY_FILENAME
} = loadConfig();

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

