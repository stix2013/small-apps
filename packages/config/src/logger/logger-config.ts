import { config } from 'dotenv';
import path from 'pathe';
import type { LoggerConfig } from '../types/logger-config';

export function loadConfig(): LoggerConfig {
  const result = config();

  if (result.error) {
    throw result.error;
  }

  const appName = process.env.APP_NAME || 'logger';
  const logDir = process.env.logDir || path.resolve(__dirname, 'logs');

  const dailyFrequency = process.env.LOG_DAILY_FREQUENCY;
  const dailyZip = !!(
    process.env.LOG_DAILY_ZIP || process.env.LOG_DAILY_ZIP === 'yes'
  );

  const dailyPath = process.env.LOG_DAILY_PATH || logDir;
  const dailyFilename = `${path.resolve(dailyPath, appName.toLowerCase())}-%DATE%.log`;
  const formatDaily = process.env.LOG_DAILY_FORMAT || 'YYYYMMDD-HH';

  const formatTimestamp = process.env.LOG_TIME_FORMAT || 'YYYY-MM-DD HH:mm:ss';
  const fileInfo = process.env.LOG_FILENAME_INFO || path.resolve(logDir, 'info.log');
  const fileCombine = process.env.LOG_FILENAME_COMBINE || path.resolve(logDir, 'combine.log');
  const fileError = process.env.LOG_FILENAME_ERROR || path.resolve(logDir, 'error.log');
  const fileException = process.env.LOG_FILENAME_EXCEPTION; // || path.resolve(logDir, 'exception.log');
  const maxSize = process.env.LOG_MAX_SIZE || '20m';
  const maxFiles = process.env.LOG_MAX_FILES || '14d';

  return {
    appName,
    logDir,
    dailyFrequency,
    dailyZip,
    formatTimestamp,
    formatDaily,
    fileInfo,
    fileCombine,
    fileError,
    fileException,
    maxSize,
    maxFiles,
    dailyPath,
    dailyFilename,
  };
}
