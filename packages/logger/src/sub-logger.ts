import DailyRotateFile from "winston-daily-rotate-file";
import type { Logger, transport } from "winston";
import { addColors, loggers, transports, format as winstonFormat } from "winston";
import { loadConfig } from "./load-config";
import { customFormat } from "./custom-format";
import { buildTransports } from "./build-transports";

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

  const lblLogger = lblString || APP_NAME;

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


  return loggers.add(lblLogger, {
    level: 'info',
    format: winstonFormat.combine(
      winstonFormat.label({ label: lblLogger }),
      winstonFormat.ms(), // Add milliseconds to the log
      winstonFormat.colorize(), // Colorize the level
      winstonFormat.timestamp({
        format: fmtTimestamp || TIMESTAMP_FORMAT,
      }),
      winstonFormat.splat(), // Added splat processing
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
      winstonFormat.splat(),
      winstonFormat.ms(),
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
