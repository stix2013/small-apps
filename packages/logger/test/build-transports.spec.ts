import { buildTransports } from '../src/build-transports';
import { LoggerConfig } from '../src/load-config';
// Import winston and its parts AFTER vi.mock has been set up.
// Explicitly import the 'transports' object to get the mocked versions.
import importedWinston, { transports as winstonTransports, format as winstonFormat } from 'winston';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock external dependencies

// Define mocks for Slack and Telegram first, as their factories are simple.
const mockSlackHookConstructor = vi.fn();
vi.mock('winston-slack-webhook-transport', () => ({
  default: mockSlackHookConstructor,
}));

const mockTelegramLoggerConstructor = vi.fn();
vi.mock('winston-telegram', () => ({
  default: mockTelegramLoggerConstructor,
}));

// Mock winston itself.
vi.mock('winston', async (importOriginal) => {
  const actualWinston = await importOriginal() as any;

  // Mock functions for Console and DailyRotateFile transports
  const consoleMockFn = vi.fn();
  const dailyRotateFileMockFn = vi.fn();

  // Helper to create a basic mock format object
  const createMockFormat = () => ({ transform: vi.fn(), خودت: vi.fn() }); // Added a dummy 'خودت' to make it distinct for combine

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
      DailyRotateFile: dailyRotateFileMockFn,
    },
    format: mockFormatObject,
    default: {
      ...(actualWinston.default || {}),
      transports: {
        ...(actualWinston.default?.transports || {}),
        Console: consoleMockFn,
        DailyRotateFile: dailyRotateFileMockFn,
      },
      format: mockFormatObject,
    },
  };
});


describe('buildTransports', () => {
  const defaultConfig: LoggerConfig = {
    appName: 'test-app',
    logTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    logDailyFrequency: '24h',
    logDailyZip: 'yes',
    logDailyFormat: 'YYYYMMDD',
    logDailyPath: '/tmp/logs',
    logFilenameCombine: '/tmp/logs/combine.log',
    logFilenameError: '/tmp/logs/error.log',
    logFilenameException: '/tmp/logs/exception.log',
    logFilenameInfo: '/tmp/logs/info.log',
    logMaxSize: '20m',
    logMaxFiles: '14d',
    transports: [],
  };

  let mockConsole: ReturnType<typeof vi.fn>;
  let mockDailyRotateFile: ReturnType<typeof vi.fn>;
  let mockCustomFormat: ReturnType<typeof vi.fn>;
  let mockSplatFormat: ReturnType<typeof vi.fn>;
  let mockMsFormat: ReturnType<typeof vi.fn>;


  beforeEach(() => {
    mockConsole = winstonTransports.Console;
    mockDailyRotateFile = winstonTransports.DailyRotateFile;

    mockCustomFormat = vi.fn(() => ({ transform: vi.fn() }))();
    mockSplatFormat = vi.fn(() => ({ transform: vi.fn() }))();
    mockMsFormat = vi.fn(() => ({ transform: vi.fn() }))();

    vi.clearAllMocks();

    mockConsole = winstonTransports.Console;
    mockDailyRotateFile = winstonTransports.DailyRotateFile;
  });


  it('should create default transports when no specific transports in config', () => {
    const createdTransports = buildTransports(
      false,
      undefined,
      defaultConfig.logTimeFormat,
      mockCustomFormat,
      mockSplatFormat,
      mockMsFormat,
      defaultConfig.logFilenameError,
      defaultConfig.logFilenameInfo,
      defaultConfig.logFilenameCombine,
      mockDailyRotateFile as any,
    );
    // Expect Console + 3 new DRF instances + transportDaily itself added to list
    expect(createdTransports.length).toBe(5);
    expect(mockConsole).toHaveBeenCalled();
    expect(mockDailyRotateFile).toHaveBeenCalledTimes(3); // Constructor called 3 times
  });

  it('should create Console transport', () => {
    buildTransports(
      false, undefined, defaultConfig.logTimeFormat,
      mockCustomFormat, mockSplatFormat, mockMsFormat,
      defaultConfig.logFilenameError, defaultConfig.logFilenameInfo, defaultConfig.logFilenameCombine,
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
      false, undefined, defaultConfig.logTimeFormat,
      mockCustomFormat, mockSplatFormat, mockMsFormat,
      defaultConfig.logFilenameError, defaultConfig.logFilenameInfo, defaultConfig.logFilenameCombine,
      mockDailyRotateFile as any,
    );
    expect(mockDailyRotateFile).toHaveBeenCalledTimes(3); // Constructor called 3 times
    expect(mockDailyRotateFile).toHaveBeenCalledWith(expect.objectContaining({ filename: defaultConfig.logFilenameError, level: 'error' }));
    expect(mockDailyRotateFile).toHaveBeenCalledWith(expect.objectContaining({ filename: defaultConfig.logFilenameInfo, level: 'info' }));
    expect(mockDailyRotateFile).toHaveBeenCalledWith(expect.objectContaining({ filename: defaultConfig.logFilenameCombine }));
  });

  it('should NOT create Slack transport as it is not implemented in buildTransports', () => {
    const config = { ...defaultConfig, transports: [{ type: 'slack', active: true, level: 'error', webhookUrl: 'slack.com' }] };
    buildTransports(
      false, undefined, config.logTimeFormat,
      mockCustomFormat, mockSplatFormat, mockMsFormat,
      config.logFilenameError, config.logFilenameInfo, config.logFilenameCombine,
      mockDailyRotateFile as any
    );
    expect(mockSlackHookConstructor).not.toHaveBeenCalled();
  });

  it('should NOT create Telegram transport as it is not implemented in buildTransports', () => {
    const config = { ...defaultConfig, transports: [{ type: 'telegram', active: true, level: 'error', token: 'token', chatId: '123' }] };
    buildTransports(
      false, undefined, config.logTimeFormat,
      mockCustomFormat, mockSplatFormat, mockMsFormat,
      config.logFilenameError, config.logFilenameInfo, config.logFilenameCombine,
      mockDailyRotateFile as any
    );
    expect(mockTelegramLoggerConstructor).not.toHaveBeenCalled();
  });
});
