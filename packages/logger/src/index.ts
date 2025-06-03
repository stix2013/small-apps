import DailyRotateFile from 'winston-daily-rotate-file';
import type { Logger } from 'winston';
import type { TransformableInfo } from 'logform';
import type winston from 'winston';
import { addColors, format, loggers, transports } from 'winston'; // Import winston for transport type
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

// loadConfig() will be called inside subLogger to ensure it gets fresh env vars for tests

const customFormat = formatPrint((info: TransformableInfo) => {
  // Ensure this format string does not rely on module-level config that might be stale.
  // Using info.label, which is populated by format.label()
  // Using info.splat (lowercase) which is populated by format.splat()
  return `${info.timestamp} [${info.level}] [${info.label}] ${info.message}`;
});

// Helper function to construct the transports array
const buildTransports = (
  isTest: boolean, // Flag to indicate if running in test mode for console
  testConsoleTransport: winston.transport | undefined, // The transport to inject for tests
  TIMESTAMP_FORMAT: string,
  customFormat: winston.Logform.Format,
  FILE_ERROR: string,
  FILE_INFO: string,
  FILE_COMBINE: string,
  transportDaily: winston.transport // Assuming DailyRotateFile is a winston.transport
): winston.transport[] => {
  const transportList: winston.transport[] = [];

  if (isTest && testConsoleTransport) {
    transportList.push(testConsoleTransport);
  } else {
    transportList.push(
      new transports.Console({
        format: combine(
          colorize(),
          format.timestamp({ format: TIMESTAMP_FORMAT }),
          format.splat(),
          customFormat
        ),
      })
    );
  }

  transportList.push(
    new transports.File({ filename: FILE_ERROR, level: 'error', maxFiles: 3 }),
    new transports.File({ filename: FILE_INFO, level: 'info', maxFiles: 5 }),
    new transports.File({ filename: FILE_COMBINE }),
    transportDaily
  );

  return transportList;
};

export const subLogger = (
  lblString?: string,
  fmtTimestamp?: string,
  testConsoleTransport?: winston.transport // Optional transport for testing
): Logger => {
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
  } = loadConfig(); // Moved loadConfig() call here

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
      format.splat(), // Added splat processing
      customFormat
    ),
    defaultMeta: {
      service: 'ym-logger-service',
    },
    exitOnError: false,
    transports: buildTransports(
      !!testConsoleTransport, // isTest flag
      testConsoleTransport,
      TIMESTAMP_FORMAT,
      customFormat,
      FILE_ERROR,
      FILE_INFO,
      FILE_COMBINE,
      transportDaily
    ),
    exceptionHandlers: [
      new transports.File({
        filename: FILE_EXCEPTION,
        maxFiles: 2,
      }),
    ],
  });
};
