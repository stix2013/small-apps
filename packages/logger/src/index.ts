import DailyRotateFile from 'winston-daily-rotate-file';
import type { Logger } from 'winston';
import type { TransformableInfo } from 'logform';
import { addColors, format, loggers, transports } from 'winston'; // Added Logger here
import { loadConfig } from './load-config';
//
const {
  colorize,
  combine,
  label: formatLabel,
  printf: formatPrint,
  timestamp,
} = format;

export type { Logger as WinstonLogger, Container } from 'winston'; // Renamed re-exported Logger to avoid conflict if any, though direct import is preferred for internal use.

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
  DAILY_FILENAME,
} = loadConfig();

const customFormat = formatPrint((info: TransformableInfo) => {
  return `${info.timestamp} [${info.level.toUpperCase()}] [${info.LEVEL}] [${info.SPLAT}] ${info.message}`;
});

export const subLogger = (lblString?: string, fmtTimestamp?: string): Logger => {
  addColors({
    info: 'cyan', // fontStyle color
    warn: 'yellow',
    error: 'red',
    debug: 'green',
  });

  // rotate file daily
  const transportDaily: DailyRotateFile = new DailyRotateFile({
    filename: DAILY_FILENAME, // `${APP_NAME.toLowerCase()}-%DATE%.log`,
    datePattern: DAILY_FORMAT,
    zippedArchive: DAILY_ZIP,
    maxSize: MAX_SIZE,
    maxFiles: MAX_FILES,
    frequency: DAILY_FREQUENCY,
  });

  const label = lblString || APP_NAME;

  return loggers.add(label, {
    level: 'info',
    format: combine(
      formatLabel({ label }),
      timestamp({
        format: fmtTimestamp || TIMESTAMP_FORMAT,
      }),
      customFormat
    ),
    defaultMeta: {
      service: 'ym-logger-service',
    },
    exitOnError: false,
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          format.timestamp({ format: TIMESTAMP_FORMAT }),
          customFormat
        ),
      }),
      new transports.File({
        filename: FILE_ERROR,
        level: 'error',
        maxFiles: 3,
      }),
      new transports.File({
        filename: FILE_INFO,
        level: 'info',
        maxFiles: 5,
      }),
      new transports.File({
        filename: FILE_COMBINE,
      }),
      transportDaily,
    ],
    exceptionHandlers: [
      new transports.File({
        filename: FILE_EXCEPTION,
        maxFiles: 2,
      }),
    ],
  });
};
