import { buildTransports } from '../src/build-transports';
import { LoggerConfig } from '../src/load-config';
// Import winston and its parts AFTER vi.mock has been set up.
// Explicitly import the 'transports' object to get the mocked versions.
import { transports as winstonTransports, format as winstonFormat } from 'winston';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock external dependencies

// Mock winston itself.
vi.mock('winston', async (importOriginal) => {
  const actualWinston = await importOriginal() as any;

  // Mock functions for Console and DailyRotateFile transports
  const consoleMockFn = vi.fn();
  const fileMockFn = vi.fn();
  const dailyRotateFileMockFn = vi.fn();

  // Helper to create a basic mock format object
  const createMockFormat = () => ({ transform: vi.fn(), opts: vi.fn() }); // Added a dummy 'opts' to make it distinct for combine

  // Mock implementations for winston.format functions
  const mockFormatCombine = vi.fn((...formats) => {
    const combinedFormat: any = createMockFormat();
    combinedFormat.formats = formats;
    return combinedFormat;
  });

  const mockFormatColorize = vi.fn(createMockFormat);
  const mockFormatTimestamp = vi.fn(createMockFormat);
  const mockFormatSplat = vi.fn(createMockFormat);
  const mockFormatMs = vi.fn(createMockFormat);
  const mockFormatPrintf = vi.fn(createMockFormat);
  const mockFormatJson = vi.fn(createMockFormat);
  const mockFormatSimple = vi.fn(createMockFormat);
  const mockFormatUncolorize = vi.fn(createMockFormat);
  const mockFormatLogstash = vi.fn(createMockFormat);
  const mockFormatLabel = vi.fn(createMockFormat);
  const mockFormatMetadata = vi.fn(createMockFormat);
  const mockFormatErrors = vi.fn(createMockFormat);
  const mockFormatPadLevels = vi.fn(createMockFormat);

  const mockFormatObject = {
    combine: mockFormatCombine,
    colorize: mockFormatColorize,
    timestamp: mockFormatTimestamp,
    splat: mockFormatSplat,
    ms: mockFormatMs,
    printf: mockFormatPrintf,
    json: mockFormatJson,
    simple: mockFormatSimple,
    uncolorize: mockFormatUncolorize,
    logstash: mockFormatLogstash,
    label: mockFormatLabel,
    metadata: mockFormatMetadata,
    errors: mockFormatErrors,
    padLevels: mockFormatPadLevels,
    ...(actualWinston.format || {}),
  };

  return {
    ...actualWinston,
    transports: {
      ...actualWinston.transports,
      Console: consoleMockFn,
      File: fileMockFn,
      DailyRotateFile: dailyRotateFileMockFn,
    },
    format: mockFormatObject,
    default: {
      ...(actualWinston.default || {}),
      transports: {
        ...(actualWinston.default?.transports || {}),
        Console: consoleMockFn,
        File: fileMockFn,
        DailyRotateFile: dailyRotateFileMockFn,
      },
      format: mockFormatObject,
    },
  };
});


describe('buildTransports', () => {
  const defaultConfig: LoggerConfig = {
    APP_NAME: 'test-app',
    LOG_DIR: '/tmp/logs',
    DAILY_FILENAME: 'test-app-%DATE%.log',
    TIMESTAMP_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    DAILY_FREQUENCY: '24h',
    DAILY_ZIP: true,
    DAILY_FORMAT: 'YYYYMMDD',
    DAILY_PATH: '/tmp/logs',
    FILE_COMBINE: '/tmp/logs/combine.log',
    FILE_ERROR: '/tmp/logs/error.log',
    FILE_EXCEPTION: '/tmp/logs/exception.log',
    FILE_INFO: '/tmp/logs/info.log',
    MAX_SIZE: '20m',
    MAX_FILES: '14d',
  };

  let mockConsole: ReturnType<typeof vi.fn>;
  let mockFile: ReturnType<typeof vi.fn>;
  let mockDailyRotateFile: ReturnType<typeof vi.fn>;
  let mockCustomFormat: ReturnType<typeof vi.fn>;
  let mockSplatFormat: ReturnType<typeof vi.fn>;
  let mockMsFormat: ReturnType<typeof vi.fn>;


  beforeEach(() => {
    vi.clearAllMocks();

    mockConsole = winstonTransports.Console;
    mockFile = winstonTransports.File;
    mockDailyRotateFile = winstonTransports.DailyRotateFile;

    mockCustomFormat = vi.fn(() => ({ transform: vi.fn() }));
    mockSplatFormat = vi.fn(() => ({ transform: vi.fn() }));
    mockMsFormat = vi.fn(() => ({ transform: vi.fn() }));
  });


  it('should create default transports when no specific transports in config', () => {
    const createdTransports = buildTransports(
      false,
      undefined,
      defaultConfig.TIMESTAMP_FORMAT,
      mockCustomFormat,
      mockSplatFormat,
      mockMsFormat,
      defaultConfig.FILE_ERROR,
      defaultConfig.FILE_INFO,
      defaultConfig.FILE_COMBINE,
      mockDailyRotateFile as any,
    );
    // Expect Console + 3 new DRF instances + transportDaily itself added to list
    expect(createdTransports.length).toBe(5);
    expect(mockConsole).toHaveBeenCalled();
  });

  it('should create Console transport', () => {
    buildTransports(
      false, undefined,
      defaultConfig.TIMESTAMP_FORMAT,
      mockCustomFormat,
      mockSplatFormat,
      mockMsFormat,
      defaultConfig.FILE_ERROR,
      defaultConfig.FILE_INFO,
      defaultConfig.FILE_COMBINE,
      mockDailyRotateFile as any,
    );
    expect(mockConsole).toHaveBeenCalledWith(
      expect.objectContaining({
        format: expect.anything(),
      }),
    );
  });

  it('should create File transports with correct parameters', () => {
    buildTransports(
      false, undefined,
      defaultConfig.TIMESTAMP_FORMAT,
      mockCustomFormat,
      mockSplatFormat,
      mockMsFormat,
      defaultConfig.FILE_ERROR,
      defaultConfig.FILE_INFO,
      defaultConfig.FILE_COMBINE,
      mockDailyRotateFile as any,
    );
    expect(mockFile).toHaveBeenCalledWith(expect.objectContaining({ filename: defaultConfig.FILE_ERROR, level: 'error' }));
    expect(mockFile).toHaveBeenCalledWith(expect.objectContaining({ filename: defaultConfig.FILE_INFO, level: 'info' }));
    expect(mockFile).toHaveBeenCalledWith(expect.objectContaining({ filename: defaultConfig.FILE_COMBINE }));
  });
});
