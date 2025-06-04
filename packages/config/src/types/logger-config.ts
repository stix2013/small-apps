export interface LoggerConfig {
  appName: string;
  logDir: string;
  dailyFrequency?: string;
  dailyZip: boolean;
  formatTimestamp: string;
  formatDaily: string;
  fileInfo: string;
  fileCombine: string;
  fileError: string;
  fileException?: string;
  maxSize: string;
  maxFiles: string;
  dailyPath: string;
  dailyFilename: string;
}
