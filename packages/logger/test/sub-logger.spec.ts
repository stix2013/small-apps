import { subLogger } from '../src/sub-logger';
import { loadConfig } from '../src/load-config';
import { customFormat } from '../src/custom-format';
import { buildTransports } from '../src/build-transports';
import DailyRotateFile from 'winston-daily-rotate-file';
import type { Logger as WinstonLogger, transport } from 'winston';
import { addColors, loggers, transports as winstonTransports, format as winstonFormat } from 'winston';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock winston parts
vi.mock('winston', async (importOriginal) => {
  const actualWinston = await importOriginal() as any;

  const consoleMockFn = vi.fn();
  const fileMockFn = vi.fn();
  // Ensure loggers.add is a mock
  const mockLoggersAdd = vi.fn();
  const mockLoggersGet = vi.fn(() => ({}) as WinstonLogger); // Basic mock for get
  const mockLoggersClose = vi.fn();


  const createMockFormat = () => ({ transform: vi.fn(), opts: vi.fn() });

  const mockFormatCombine = vi.fn((...formats) => {
    const combinedFormat: any = createMockFormat();
    combinedFormat.formats = formats; // Store formats for inspection
    return combinedFormat;
  });
  const mockFormatColorize = vi.fn(createMockFormat);
  const mockFormatTimestamp = vi.fn(createMockFormat);
  const mockFormatSplat = vi.fn(createMockFormat);
  const mockFormatMs = vi.fn(createMockFormat);
  const mockFormatLabel = vi.fn(createMockFormat);
  const mockFormatPrintf = vi.fn(createMockFormat); // For customFormat if it uses printf

  const mockFormatObject = {
    combine: mockFormatCombine,
    colorize: mockFormatColorize,
    timestamp: mockFormatTimestamp,
    splat: mockFormatSplat,
    ms: mockFormatMs,
    label: mockFormatLabel,
    printf: mockFormatPrintf,
    // Include other formats if needed by customFormat or other parts
    ...(actualWinston.format || {}),
  };

  return {
    ...actualWinston,
    addColors: vi.fn(),
    loggers: {
      ...actualWinston.loggers,
      add: mockLoggersAdd,
      get: mockLoggersGet,
      close: mockLoggersClose,
    },
    transports: {
      ...actualWinston.transports,
      Console: consoleMockFn,
      File: fileMockFn,
    },
    format: mockFormatObject,
    // Mock top-level default if used, or specific parts like createLogger if that's what subLogger uses internally
    // createLogger: mockCreateLogger, // If subLogger uses createLogger directly
  };
});

// Mock winston-daily-rotate-file
vi.mock('winston-daily-rotate-file', () => {
  // This is the constructor mock
  return {
    default: vi.fn().mockImplementation(() => ({
      on: vi.fn(), // Mock common methods if needed
      emit: vi.fn(),
    })),
  };
});


// Mock our local modules
vi.mock('../src/load-config', () => ({
  loadConfig: vi.fn(),
}));

vi.mock('../src/custom-format', () => ({
  customFormat: vi.fn(() => ({ transform: vi.fn() })), // Simple mock for the format object
}));

vi.mock('../src/build-transports', () => ({
  buildTransports: vi.fn(() => []), // Return an empty array of transports
}));

describe('subLogger', () => {
  const mockDefaultConfig = {
    APP_NAME: 'default-test-app',
    DAILY_FREQUENCY: '24h',
    DAILY_ZIP: true,
    TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    DAILY_FORMAT: 'YYYYMMDD',
    FILE_INFO: '/tmp/logs/info.log',
    FILE_COMBINE: '/tmp/logs/combine.log',
    FILE_ERROR: '/tmp/logs/error.log',
    FILE_EXCEPTION: '/tmp/logs/exception.log',
    MAX_SIZE: '20m',
    MAX_FILES: '14d',
    DAILY_FILENAME: 'app-%DATE%.log',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup mock return values
    (loadConfig as ReturnType<typeof vi.fn>).mockReturnValue(mockDefaultConfig);
    (customFormat as any).mockClear(); // Clear any calls from previous tests
    (buildTransports as ReturnType<typeof vi.fn>).mockReturnValue([new winstonTransports.Console()]); // Default mock
  });

  afterEach(() => {
    // Reset any shared state if necessary, e.g., if loggers were added to a global container
    // For winston's global loggers, you might need a way to clear them or use unique names.
    // loggers.close(mockDefaultConfig.APP_NAME); // Example, ensure this works with your mock setup
  });

  it('should call loggers.add with the correct label (APP_NAME by default)', () => {
    subLogger();
    expect(loggers.add).toHaveBeenCalledWith(mockDefaultConfig.APP_NAME, expect.any(Object));
  });

  it('should call loggers.add with the provided label string', () => {
    const testLabel = 'custom-label';
    subLogger(testLabel);
    expect(loggers.add).toHaveBeenCalledWith(testLabel, expect.any(Object));
  });

  it('should configure the logger with the default timestamp format from config', () => {
    subLogger();
    expect(loggers.add).toHaveBeenCalled();
    // Check that winstonFormat.timestamp was called with the default format
    expect(winstonFormat.timestamp).toHaveBeenCalledWith({ format: mockDefaultConfig.TIMESTAMP_FORMAT });
  });

  it('should configure the logger with the provided timestamp format', () => {
    const testTimestampFormat = 'HH:mm:ss';
    subLogger(undefined, testTimestampFormat);
    expect(loggers.add).toHaveBeenCalled();
    // Check that winstonFormat.timestamp was called with the specified format
    expect(winstonFormat.timestamp).toHaveBeenCalledWith({ format: testTimestampFormat });
  });

  it('should call buildTransports with correct parameters', () => {
    const testConsoleTransport = new winstonTransports.Console();
    subLogger(undefined, undefined, testConsoleTransport);

    expect(buildTransports).toHaveBeenCalledWith(
      true, // isTest flag because testConsoleTransport is provided
      testConsoleTransport,
      mockDefaultConfig.TIMESTAMP_FORMAT,
      customFormat, // The actual customFormat object (or its mock)
      expect.objectContaining({ transform: expect.any(Function) }), // winstonFormat.splat() mock
      expect.objectContaining({ transform: expect.any(Function) }), // winstonFormat.ms() mock
      mockDefaultConfig.FILE_ERROR,
      mockDefaultConfig.FILE_INFO,
      mockDefaultConfig.FILE_COMBINE,
      expect.objectContaining({ on: expect.any(Function), emit: expect.any(Function) }) // DailyRotateFile mock
    );
  });

  it('should use DailyRotateFile with parameters from config', () => {
    subLogger();
    expect(DailyRotateFile).toHaveBeenCalledWith({
      filename: mockDefaultConfig.DAILY_FILENAME,
      datePattern: mockDefaultConfig.DAILY_FORMAT,
      zippedArchive: mockDefaultConfig.DAILY_ZIP,
      maxSize: mockDefaultConfig.MAX_SIZE,
      maxFiles: mockDefaultConfig.MAX_FILES,
      frequency: mockDefaultConfig.DAILY_FREQUENCY,
    });
  });

  it('should configure exceptionHandlers with File transport', () => {
    subLogger();
    expect(loggers.add).toHaveBeenCalled();
    const loggerConfig = (loggers.add as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(loggerConfig.exceptionHandlers).toEqual(
      expect.arrayContaining([
        expect.any(winstonTransports.File),
      ])
    );
    // Check the parameters of the File transport for exceptionHandlers
    expect(winstonTransports.File).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: mockDefaultConfig.FILE_EXCEPTION,
        maxFiles: 2,
      })
    );
  });

   it('should include colorize, ms, splat, and customFormat in the logger format', () => {
    subLogger();
    expect(loggers.add).toHaveBeenCalled();
    const loggerConfig = (loggers.add as ReturnType<typeof vi.fn>).mock.calls[0][1];

    // Check that the mocked format functions were called
    expect(winstonFormat.colorize).toHaveBeenCalled();
    expect(winstonFormat.ms).toHaveBeenCalled();
    expect(winstonFormat.splat).toHaveBeenCalled();
    expect(winstonFormat.label).toHaveBeenCalledWith({ label: mockDefaultConfig.APP_NAME });
    expect(winstonFormat.timestamp).toHaveBeenCalledWith({ format: mockDefaultConfig.TIMESTAMP_FORMAT });

    // Check that customFormat was passed as an argument to winstonFormat.combine
    expect(winstonFormat.combine).toHaveBeenCalledWith(
      expect.anything(), // label
      expect.anything(), // ms
      expect.anything(), // colorize
      expect.anything(), // timestamp
      expect.anything(), // splat
      customFormat       // our customFormat mock
    );
  });

  it('should call addColors for custom log levels', () => {
    subLogger();
    expect(addColors).toHaveBeenCalledWith({
      info: 'cyan',
      warn: 'yellow',
      error: 'red',
      debug: 'green',
    });
  });

  it('should return the logger instance from loggers.add', () => {
    const mockLoggerInstance = { info: vi.fn(), error: vi.fn() } as unknown as WinstonLogger;
    (loggers.add as ReturnType<typeof vi.fn>).mockReturnValue(mockLoggerInstance);
    const logger = subLogger();
    expect(logger).toBe(mockLoggerInstance);
  });

  // Test for console transport output if `testConsoleTransport` is provided
  it('should use the provided testConsoleTransport when isTest is true', () => {
    const testConsole = new winstonTransports.Console({ level: 'debug' });
    (buildTransports as ReturnType<typeof vi.fn>).mockImplementationOnce(
      (isTest, testTransport, ...args) => {
        if (isTest && testTransport) {
          return [testTransport]; // Return only the test transport
        }
        return [new winstonTransports.Console()]; // Default behavior otherwise
      }
    );

    subLogger('my-label', undefined, testConsole);

    expect(buildTransports).toHaveBeenCalledWith(
      true, // isTest
      testConsole, // the transport instance
      mockDefaultConfig.TIMESTAMP_FORMAT, // or expect.any(String) if not testing specific val here
      customFormat, // The mock itself
      expect.objectContaining({ transform: expect.any(Function) }), // splat
      expect.objectContaining({ transform: expect.any(Function) }), // ms
      mockDefaultConfig.FILE_ERROR, // or expect.any(String)
      mockDefaultConfig.FILE_INFO, // or expect.any(String)
      mockDefaultConfig.FILE_COMBINE, // or expect.any(String)
      expect.objectContaining({ on: expect.any(Function), emit: expect.any(Function) }) // DailyRotateFile mock
    );
    // Check that the transports array returned by buildTransports (and thus used by the logger)
    // contains the testConsole when it's provided.
    const loggerConfig = (loggers.add as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(loggerConfig.transports).toEqual([testConsole]);
  });

});
