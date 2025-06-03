import type { Logform, Logger , transport } from 'winston';
import { addColors, format, loggers, transports } from 'winston'; // Import winston for transport type
import { loadConfig } from './load-config';
import { inspect } from 'node:util';
import DailyRotateFile from 'winston-daily-rotate-file';

//
const {
  colorize,
  combine,
  ms,
  label: formatLabel,
  printf: formatPrint,
  timestamp,
  splat: formatSplat
} = format;

export type { Logger as WinstonLogger, Container } from 'winston'; // Renamed re-exported Logger to avoid conflict if any, though direct import is preferred for internal use.

// loadConfig() will be called inside subLogger to ensure it gets fresh env vars for tests

const customFormat = formatPrint((info: Logform.TransformableInfo) => {
    const {
    timestamp,
    level,
    ms,
    label, // Using label from format.label()
    message,
    splat,
  } = info;

  return `${timestamp} ${ms} [${level}] [${label}] ${message} ${splat ? inspect(splat, { depth: null }) : ''}`;
});

// Helper function to construct the transports array
const buildTransports = (
  isTest: boolean, // Flag to indicate if running in test mode for console
  testConsoleTransport: transport | undefined, // The transport to inject for tests
  TIMESTAMP_FORMAT: string,
  custom: Logform.Format,
  splat: Logform.Format,
  ms: Logform.Format,
  FILE_ERROR: string,
  FILE_INFO: string,
  FILE_COMBINE: string,
  transportDaily: transport // Assuming DailyRotateFile is a winston.transport
): transport[] => {
  const transportList: transport[] = [];

  if (isTest && testConsoleTransport) {
    transportList.push(testConsoleTransport);
  } else {
    transportList.push(
      new transports.Console({
        format: combine(
          colorize(),
          format.timestamp({ format: TIMESTAMP_FORMAT }),
          splat,
          custom
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
  testConsoleTransport?: transport // Optional transport for testing
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
      ms(), // Add milliseconds to the log
      colorize(), // Colorize the level
      timestamp({
        format: fmtTimestamp || TIMESTAMP_FORMAT,
      }),
      formatSplat(), // Added splat processing
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
      formatSplat(),
      ms(),
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
