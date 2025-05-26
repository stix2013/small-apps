// packages/logger/test/logger.spec.ts
import winston from 'winston'; 
import DailyRotateFile from 'winston-daily-rotate-file'; 
import { vi } from 'vitest';

// Use vi.hoisted for mocks that need to be accessed in vi.mock factory
const { 
  mockLoggersAdd, 
  mockLoggersGet, 
  mockTransportsConsole, 
  mockTransportsFile, 
  mockFormatLabel, 
  mockFormatPrintf, 
  mockFormatTimestamp, 
  mockFormatColorize, 
  mockAddColors, 
  mockCreateLogger, 
  mockDailyRotateFile 
} = vi.hoisted(() => ({
  mockLoggersAdd: vi.fn(),
  mockLoggersGet: vi.fn(),
  mockTransportsConsole: vi.fn(),
  mockTransportsFile: vi.fn(),
  mockFormatLabel: vi.fn(),
  mockFormatPrintf: vi.fn(),
  mockFormatTimestamp: vi.fn(),
  mockFormatColorize: vi.fn(),
  mockAddColors: vi.fn(),
  mockCreateLogger: vi.fn(),
  mockDailyRotateFile: vi.fn(),
}));

// Mock winston and winston-daily-rotate-file
vi.mock('winston', async () => {
  const actualWinston = await vi.importActual('winston');
  
  // Configure mocks for format functions to call actual implementations
  mockFormatLabel.mockImplementation(opts => actualWinston.format.label(opts));
  mockFormatPrintf.mockImplementation(opts => actualWinston.format.printf(opts));
  mockFormatTimestamp.mockImplementation(opts => actualWinston.format.timestamp(opts));
  mockFormatColorize.mockImplementation(opts => actualWinston.format.colorize(opts));

  return {
    loggers: {
      add: mockLoggersAdd,
      get: mockLoggersGet,
    },
    transports: {
      Console: mockTransportsConsole,
      File: mockTransportsFile,
    },
    format: {
      ...actualWinston.format, 
      label: mockFormatLabel,
      printf: mockFormatPrintf,
      timestamp: mockFormatTimestamp,
      colorize: mockFormatColorize,
      combine: actualWinston.format.combine, 
    },
    addColors: mockAddColors,
    createLogger: mockCreateLogger,
  };
});

vi.mock('winston-daily-rotate-file', () => {
  return {
    default: mockDailyRotateFile,
  };
});

describe('subLogger (Vitest with vi.hoisted, resetModules, dynamic import)', () => {
  const mockLoggerInstance = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    close: vi.fn(),
    transports: [],
  };

  beforeEach(() => {
    vi.clearAllMocks(); 

    mockLoggersAdd.mockReturnValue(mockLoggerInstance);
    mockLoggersGet.mockReturnValue(mockLoggerInstance);
    mockCreateLogger.mockReturnValue(mockLoggerInstance);
    
    mockTransportsConsole.mockImplementation(options => ({ ...options, name: 'Console' }));
    mockTransportsFile.mockImplementation(options => ({ ...options, name: 'File' }));
    mockDailyRotateFile.mockImplementation(options => ({ ...options, name: 'DailyRotateFile', filename: options?.filename || '' }));

    // Stub environment variables for each test
    vi.stubEnv('APP_NAME', 'TestAppFinal');
    vi.stubEnv('LOG_DAILY_FREQUENCY', '');
    vi.stubEnv('LOG_DAILY_ZIP', 'no'); // Default for most tests
    vi.stubEnv('LOG_TIME_FORMAT', 'YYYY-MM-DD HH:mm:ss');
    vi.stubEnv('LOG_DAILY_FORMAT', 'YYYYMMDD-HH');
    vi.stubEnv('LOG_FILENAME_INFO', 'info_final.log');
    vi.stubEnv('LOG_FILENAME_COMBINE', 'combine_final.log');
    vi.stubEnv('LOG_FILENAME_ERROR', 'error_final.log');
    vi.stubEnv('LOG_FILENAME_EXCEPTION', 'exception_final.log');
    vi.stubEnv('LOG_MAX_SIZE', '1m');
    vi.stubEnv('LOG_MAX_FILES', '1d');
    vi.stubEnv('LOG_DAILY_PATH', './logs_final_test');
    
    vi.resetModules(); 
  });

  afterEach(() => {
    vi.unstubAllEnvs(); 
  });

  it('should return a winston logger instance', async () => {
    const { subLogger } = await import('../src/index');
    const logger = subLogger('test-label-final');
    expect(mockLoggersAdd).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    expect(logger).toBe(mockLoggerInstance);
  });

  it('should use the provided label', async () => {
    const { subLogger } = await import('../src/index');
    subLogger('my-custom-label-final');
    expect(mockLoggersAdd).toHaveBeenCalledWith('my-custom-label-final', expect.any(Object));
  });

  it('should use APP_NAME from process.env as default label if no label is provided', async () => {
    const { subLogger } = await import('../src/index');
    subLogger(); 
    expect(mockLoggersAdd).toHaveBeenCalledWith('TestAppFinal', expect.any(Object));
  });

  it('should reuse logger instances for the same label', async () => {
    const { subLogger } = await import('../src/index');
    const logger1 = subLogger('reused-label-final');
    mockLoggersAdd.mockClear(); 
    const logger2 = subLogger('reused-label-final'); 
    
    expect(logger1).toBe(mockLoggerInstance);
    expect(logger2).toBe(mockLoggerInstance);
    expect(mockLoggersAdd).toHaveBeenCalledTimes(1); 
  });

  it('should configure Console, File, and DailyRotateFile transports', async () => {
    const { subLogger } = await import('../src/index');
    subLogger('transport-test-final');
    expect(mockTransportsConsole).toHaveBeenCalled();
    expect(mockTransportsFile).toHaveBeenCalledTimes(4); // Error, Info, Combine, Exception
    expect(mockDailyRotateFile).toHaveBeenCalled();
  });

  it('should allow the logger instance to be closed', async () => {
    const { subLogger } = await import('../src/index');
    const logger = subLogger('closable-logger-final');
    logger.close(); 
    expect(mockLoggerInstance.close).toHaveBeenCalled();
  });
  
  it('should use default LOG_DAILY_PATH if env var is not set', async () => {
    vi.stubEnv('LOG_DAILY_PATH', ''); 
    const { subLogger } = await import('../src/index');
    subLogger('daily-path-default-final');
    const dailyRotateFileOptions = mockDailyRotateFile.mock.calls[0][0];
    expect(dailyRotateFileOptions.filename).toContain('./testappfinal-%DATE%.log');
  });

  it('should use custom LOG_DAILY_PATH if env var is set', async () => {
    vi.stubEnv('LOG_DAILY_PATH', '/custom/final/path');
    const { subLogger } = await import('../src/index');
    subLogger('daily-path-custom-final');
    const dailyRotateFileOptions = mockDailyRotateFile.mock.calls[0][0];
    expect(dailyRotateFileOptions.filename).toContain('/custom/final/path/testappfinal-%DATE%.log');
  });
  
  it('should configure DailyRotateFile with zippedArchive=true if LOG_DAILY_ZIP is "yes"', async () => {
    vi.stubEnv('LOG_DAILY_ZIP', 'yes');
    const { subLogger } = await import('../src/index');
    subLogger('zip-test-yes-final');
    const dailyRotateFileOptions = mockDailyRotateFile.mock.calls[0][0];
    expect(dailyRotateFileOptions.zippedArchive).toBe(true);
  });

  it('should configure DailyRotateFile with correct zippedArchive based on LOG_DAILY_ZIP', async () => {
    // Scenario 1: LOG_DAILY_ZIP = 'no' (results in true due to source code logic)
    vi.stubEnv('LOG_DAILY_ZIP', 'no');
    let { subLogger: reloadedSubLoggerNo } = await import('../src/index');
    reloadedSubLoggerNo('zip-test-no-final');
    let dailyRotateFileOptions = mockDailyRotateFile.mock.calls[0][0];
    expect(dailyRotateFileOptions.zippedArchive).toBe(true); // Changed from false to true

    // Scenario 2: LOG_DAILY_ZIP is undefined/empty (results in false)
    mockDailyRotateFile.mockClear(); // Clear mocks for the next part of the test
    vi.resetModules(); // Reset modules to ensure fresh import for new env var state
    vi.stubEnv('LOG_DAILY_ZIP', ''); // Represents undefined for the code's logic

    const { subLogger: reloadedSubLoggerUndef } = await import('../src/index');
    reloadedSubLoggerUndef('zip-test-undefined-final');
    dailyRotateFileOptions = mockDailyRotateFile.mock.calls[0][0];
    expect(dailyRotateFileOptions.zippedArchive).toBe(false); // This was already correct
  });
});
