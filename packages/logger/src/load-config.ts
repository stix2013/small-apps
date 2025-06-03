import { config } from 'dotenv';
import path from 'path';

export interface LoggerConfig {
  APP_NAME: string;
  LOG_DIR: string;
  DAILY_FREQUENCY: string | undefined;
  DAILY_ZIP: boolean;
  TIMESTAMP_FORMAT: string;
  DAILY_FORMAT: string;
  FILE_INFO: string;
  FILE_COMBINE: string;
  FILE_ERROR: string;
  FILE_EXCEPTION: string;
  MAX_SIZE: string;
  MAX_FILES: string;
  DAILY_PATH: string;
  DAILY_FILENAME: string;
}

export function loadConfig(): LoggerConfig {
  const result = config();

  if (result.error) {
    throw result.error;
  }

  const APP_NAME = process.env.APP_NAME || 'logger';
  const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '/logs');

  const DAILY_FREQUENCY = process.env.LOG_DAILY_FREQUENCY;
  const DAILY_ZIP = !!(
    process.env.LOG_DAILY_ZIP || process.env.LOG_DAILY_ZIP === 'yes'
  );

  const DAILY_PATH = process.env.LOG_DAILY_PATH || LOG_DIR;
  const DAILY_FILENAME = `${DAILY_PATH}/${APP_NAME.toLowerCase()}-%DATE%.log`;
  const DAILY_FORMAT = process.env.LOG_DAILY_FORMAT || 'YYYYMMDD-HH';

  const TIMESTAMP_FORMAT = process.env.LOG_TIME_FORMAT || 'YYYY-MM-DD HH:mm:ss';
  const FILE_INFO = process.env.LOG_FILENAME_INFO || path.join(LOG_DIR, '/info.log');
  const FILE_COMBINE = process.env.LOG_FILENAME_COMBINE || path.join(LOG_DIR, '/combine.log');
  const FILE_ERROR = process.env.LOG_FILENAME_ERROR || path.join(LOG_DIR, '/error.log');
  const FILE_EXCEPTION = process.env.LOG_FILENAME_EXCEPTION || path.join(LOG_DIR, '/exception.log');
  const MAX_SIZE = process.env.LOG_MAX_SIZE || '20m';
  const MAX_FILES = process.env.LOG_MAX_FILES || '14d';

  return {
    APP_NAME,
    LOG_DIR,
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
    DAILY_PATH,
    DAILY_FILENAME,
  };
}
