import winston, { format as winstonFormat } from 'winston';
import { type Logform, type transport } from 'winston';

// Helper function to construct the transports array
export const buildTransports = (
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
      // @ts-expect-error - Console is a generic transport type
      new (winston.transports.Console)({
        format: winstonFormat.combine(
          winstonFormat.colorize(),
          winstonFormat.timestamp({ format: TIMESTAMP_FORMAT }),
          splat,
          ms,
          custom
        ),
      })
    );

    // Use transportDaily for all file transports
    transportList.push(
      // @ts-expect-error - File is a generic transport type
      (winston.transports.File)({
        filename: FILE_ERROR,
        level: 'error',
        maxFiles: 3,
      }),
      // @ts-expect-error - File is a generic transport type
      (winston.transports.File)({
        filename: FILE_INFO,
        level: 'info',
        maxFiles: 5,
      }),
      // @ts-expect-error - File is a generic transport type
      (winston.transports.File)({
        filename: FILE_COMBINE,
        maxFiles: 5,
      }),
      transportDaily
    );
  }

  return transportList;
};
