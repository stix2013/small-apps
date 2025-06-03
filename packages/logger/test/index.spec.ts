import { afterEach, describe, expect, it, vi } from 'vitest';

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; // Added this import
import { subLogger } from '../src';
import path from 'path';
import fs from 'fs';

const LOG_DIR = path.join(__dirname, 'test-logs'); // Changed to test-logs

// Helper function to wait for file content
const waitForFileContent = (filePath: string, expectedContent?: string | RegExp, timeout = 2000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const interval = 100; // Check every 100ms
    const endTime = Date.now() + timeout;

    const checkFile = () => {
      if (fs.existsSync(filePath)) {
        if (expectedContent === undefined) { // Only check for existence
          resolve();
          return;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        if (expectedContent instanceof RegExp) {
          if (expectedContent.test(content)) {
            resolve();
          } else if (Date.now() > endTime) {
            reject(new Error(`Timeout waiting for file "${filePath}" to contain content matching ${expectedContent}. Current content:\n${content}`));
          } else {
            setTimeout(checkFile, interval);
          }
        } else {
          if (content.includes(expectedContent)) {
            resolve();
          } else if (Date.now() > endTime) {
            reject(new Error(`Timeout waiting for file "${filePath}" to contain "${expectedContent}". Current content:\n${content}`));
          } else {
            setTimeout(checkFile, interval);
          }
        }
      } else if (Date.now() > endTime) {
        reject(new Error(`Timeout waiting for file "${filePath}" to exist.`));
      } else {
        setTimeout(checkFile, interval);
      }
    };

    checkFile();
  });
};

// Helper to create log regex
// Format: timestamp [LEVEL_UPPERCASE] [LABEL] [SPLAT_IF_ANY] message
const createLogRegex = (level: string, label: string, message: string, splat?: string): RegExp => {
  const timestampPattern = '\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}';
  const levelPattern = `\\[${level.toUpperCase()}\\]`;
  const labelPattern = `\\[${label}\\]`;
  const splatPattern = splat ? ` \\[\\[${splat}\\]\\]` : '(?: \\[[^\\]]+\\])?'; // Optional splat part if not specified
  const messagePattern = message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters in message
  // The custom format is: `${info.timestamp} [${info.level.toUpperCase()}] [${info.LEVEL}] [${info.SPLAT}] ${info.message}`;
  // So SPLAT comes before message. Let's adjust.
  // The SPLAT array is typically joined by spaces if it exists, e.g. info.SPLAT = ['arg1', 'arg2'] might become '[arg1 arg2]' or similar.
  // The current logger format is `[${info.SPLAT}]`. If info.SPLAT is an array, this might result in e.g. `[arg1,arg2]`.
  // If info.SPLAT is undefined, it might print `[undefined]`. This needs to be handled by the logger's format or tested as is.
  // For simplicity, let's assume if splat is provided in the test, it will appear as `[splat]`
  // If not, we'll make the splat part entirely optional including its brackets: (?: \[[^\]]+\])?
  // Based on Winston's default splat behavior, it interpolates into the message.
  // However, the custom format explicitly includes `[${info.SPLAT}]`.
  // Let's assume `info.SPLAT` will be a string representation of the splat arguments.
  // If logger.info('message %s', 'val') -> info.SPLAT might be "['val']" or something similar.
  // The default format for splat arguments when using `format.splat()` is to integrate them into the message.
  // Since we have `[${info.SPLAT}]` explicitly, we need to see what winston puts in `info.SPLAT`.
  // It's often the array of splat arguments. `util.format` is not explicitly used on `info.SPLAT` in the custom format string.
  // So if `info.SPLAT` is `['foo', 'bar']`, it would print `[foo,bar]`.
  // Let's refine the splat pattern. If testing for a specific splat, it will be `\[SPLAT_CONTENT\]`.
  // If no specific splat is tested, it could be `(?: \[[^\]]*\])?` to match `[anything]` or nothing if `[undefined]` is not printed.
  // Given the format `[${info.SPLAT}]`, if there are no splat args, `info.SPLAT` would be undefined, leading to `[undefined]`.
  // This is likely not desired. A proper `splat()` formatter should be used before `customFormat`.
  // Assuming `format.splat()` is implicitly or explicitly part of the chain that populates `info.message` and `info.splat` property.
  // For now, let's assume `[${info.SPLAT}]` means the literal string value of `info.SPLAT` will be there.
  // If `info.SPLAT` is undefined, it becomes `[undefined]`. If `['test']`, then `[test]`.
  // This is a bit tricky. Let's simplify: if splat is being tested, expect `[SPLAT_VALUE]`. If not, expect `\[undefined\]` or make it more general.

  // Revisiting the problem statement: `[${info.LEVEL}] [${info.SPLAT}] ${info.message}`
  // If LEVEL is label, then `[LABEL_TEXT]`.
  // If SPLAT is for extra args, and not processed by `format.splat()` into the message, then it will be an array.
  // `logger.info('main message', 'splat1', 'splat2')` -> info.message = 'main message', info.SPLAT = ['splat1', 'splat2']
  // Output: `[LABEL_TEXT] [splat1,splat2] main message` (if that's how array.toString() works for SPLAT)

  // Let's assume for a simple splat string test: `logger.info("message %s", "arg")`
  // With `format.splat()` typically this becomes `message arg`.
  // With `[${info.SPLAT}]` and `format.splat()` in the chain, `info.SPLAT` would be `['arg']`.
  // So the output segment would be `[LABEL] [['arg']] message`. This seems too complex.
  // The original `subLogger` doesn't explicitly add `format.splat()` in its `combine`.
  // Winston might add it by default for `printf` or if it sees `%s`.
  // Let's test the current behavior.
  // The current tests for info/error don't show a `[undefined]` or splat part, e.g. `[test-label] info message`.
  // This suggests that if `info.SPLAT` is undefined, the `[${info.SPLAT}]` part might be missing or `customFormat` handles it.
  // The provided `customFormat` is: `return `${info.timestamp} [${info.level.toUpperCase()}] [${info.LEVEL}] [${info.SPLAT}] ${info.message}`;`
  // If `info.SPLAT` is undefined, it will literally print `[undefined]`.
  // The existing tests `infoLog.toContain('[test-label] info message')` would fail if `[undefined]` was always there.
  // This implies `info.LEVEL` is the label, and `info.SPLAT` might be missing if no splat args.
  // This means the format string in the logger might be more dynamic, or the tests are too loose.
  // Let's assume the `[${info.SPLAT}]` part only appears if splat arguments exist.
  // No, `printf` doesn't work that way. It will print literally `[undefined]`.
  // The previous tests `await waitForFileContent(path.join(LOG_DIR, 'info.log'), infoLogPattern);`
  // where `infoLogPattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \[INFO\] \[test-label\] info message/`
  // This regex does NOT account for a `[undefined]` part.
  // This means either:
  // 1. The `customFormat` in src/index.ts is NOT what's actually running (unlikely if I just read it).
  // 2. `info.SPLAT` is somehow not undefined (e.g. default empty array/string).
  // 3. The tests were passing because `waitForFileContent` with a regex only needs a *match*, not a full line match.
  //    If the actual log was `TIMESTAMP [INFO] [test-label] [undefined] info message`, the regex would still match. This is the most likely.

  // So, the regex needs to account for `[undefined]` if no splat args, or `[value]` if splat args.
  const splatValue = splat ? splat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : 'undefined';
  const actualSplatPattern = `\\[${splatValue}\\]`; // Matches `[undefined]` or `[actualSplatValue]`

  return new RegExp(`^${timestampPattern} ${levelPattern} ${labelPattern} ${actualSplatPattern} ${messagePattern}`);
};


describe('Logger', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});

describe('subLogger', () => {
  afterEach(() => {
    // Clean up logs directory
    if (fs.existsSync(LOG_DIR)) {
      fs.rmSync(LOG_DIR, { recursive: true, force: true });
    }
    // Reset logger cache for tests that rely on fresh instances or specific configurations
    winston.loggers.clear();
  });

  describe('Instantiation and Caching', () => {
    it('should return the same logger instance for the same label', () => {
      const logger1 = subLogger('shared-label');
      const logger2 = subLogger('shared-label');
      expect(logger1).toBe(logger2);
    });

    it('should return different logger instances for different labels', () => {
      const logger1 = subLogger('unique-label-1');
      const logger2 = subLogger('unique-label-2');
      expect(logger1).not.toBe(logger2);
    });

    it('should use APP_NAME as default label if none provided', () => {
      // Need to read APP_NAME from config. For now, let's assume we can spy on loggers.add or check properties.
      // Winston doesn't directly expose the label on the logger object easily after creation via `loggers.add`.
      // We can infer this by checking if a logger by APP_NAME is created.
      // This test is a bit indirect.
      // Alternative: check log output for default label.
      const loggerDefault = subLogger(); // No label
      // This test will be better verified by checking log output later.
      // For now, just ensure it returns a logger.
      expect(loggerDefault).toBeInstanceOf(winston.Logger);

      // To properly test the default label, we'd log a message and check the output.
      // This will be covered in log level tests.
    });
  });

  // The following basic tests are largely covered by the more detailed "Log Level Tests"
  // and "Instantiation and Caching" tests. Kept for basic sanity if desired, but could be removed.
  it('should return a winston logger instance', () => {
    const logger = subLogger();
    expect(logger).toBeInstanceOf(winston.Logger);
  });

  it('should use APP_NAME as default label if no label is provided (checked via log output)', async () => {
    // This test is a bit more involved as it requires knowing APP_NAME or using a general pattern.
    // loadConfig is not directly available here without importing it.
    // For now, we assume the default label set by subLogger() will appear in logs.
    const logger = subLogger(); // No label, should use APP_NAME
    logger.level = 'info';
    const message = 'message from default labelled logger';
    // The label will be whatever APP_NAME is in loadConfig().
    // We create a regex that expects *any* label, as we can't know APP_NAME's value easily.
    const logPatternWithDynamicLabel = createLogRegex('info', '[^\\]]+', message); // Matches any char except ']' for label

    const consoleInfoSpy = vi.spyOn(console, 'info');
    logger.info(message);

    await waitForFileContent(path.join(LOG_DIR, 'info.log'), logPatternWithDynamicLabel);
    await waitForFileContent(path.join(LOG_DIR, 'combine.log'), logPatternWithDynamicLabel);
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringMatching(logPatternWithDynamicLabel));
    consoleInfoSpy.mockRestore();
  });


  it('should use the provided label if a label is provided (checked via log output)', async () => {
    const testLabel = 'provided-label-test';
    const logger = subLogger(testLabel);
    logger.level = 'info';
    const message = 'message from provided-label logger';
    const logPattern = createLogRegex('info', testLabel, message);
    const consoleInfoSpy = vi.spyOn(console, 'info');

    logger.info(message);

    await waitForFileContent(path.join(LOG_DIR, 'info.log'), logPattern);
    await waitForFileContent(path.join(LOG_DIR, 'combine.log'), logPattern);
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringMatching(logPattern));
    consoleInfoSpy.mockRestore();
  });


  it('should use the provided timestamp format if provided (checked via log output)', async () => {
    const testLabel = 'timestamp-test';
    const customTimestampFormat = 'DD-MM-YYYY HH:mm:ss';
    const logger = subLogger(testLabel, customTimestampFormat);
    logger.level = 'info';
    const message = 'message from custom timestamp logger';

    // Slightly adapt createLogRegex to expect a different timestamp format
    const customTimestampPattern = '\\d{2}-\\d{2}-\\d{4} \\d{2}:\\d{2}:\\d{2}';
    const logPattern = new RegExp(`^${customTimestampPattern} \\[INFO\\] \\[${testLabel}\\] \\[undefined\\] ${message}`);

    const consoleInfoSpy = vi.spyOn(console, 'info');
    logger.info(message);

    await waitForFileContent(path.join(LOG_DIR, 'info.log'), logPattern);
    await waitForFileContent(path.join(LOG_DIR, 'combine.log'), logPattern);
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringMatching(logPattern));
    consoleInfoSpy.mockRestore();
  });

  describe('Log File Creation', () => {
    it('should create essential log files on logging', async () => {
      const logger = subLogger('file-creation-test');
      // Set level to silly to ensure all log types attempt to write, forcing file creation.
      logger.level = 'silly';
      logger.info('initiate logging for info.log');
      logger.error('initiate logging for error.log');
      logger.debug('initiate logging for combine.log (via debug)');


      await waitForFileContent(path.join(LOG_DIR, 'info.log'));
      await waitForFileContent(path.join(LOG_DIR, 'error.log'));
      await waitForFileContent(path.join(LOG_DIR, 'combine.log'));
      await waitForFileContent(path.join(LOG_DIR, 'exception.log')); // Exception transport should create file

      // Check for daily rotate file (presence of a file matching pattern)
      const files = fs.readdirSync(LOG_DIR);
      // DAILY_FILENAME uses APP_NAME. We use a general pattern.
      // Example: appname-%DATE%.log. %DATE% becomes YYYY-MM-DD-HH for 'custom'.
      // For default 'YYYY-MM-DD', it's just that.
      // The default config uses DAILY_FORMAT = 'YYYY-MM-DD-HH' and DAILY_FILENAME = `${APP_NAME.toLowerCase()}-%DATE%.log`
      // So, we expect files like `someappname-2023-10-27-15.log`
      const dailyRotatePattern = /^[a-z]+-\d{4}-\d{2}-\d{2}-\d{2}\.log$/;
      expect(files.some(file => dailyRotatePattern.test(file))).toBe(true);
    });
  });

  describe('Log Level Tests and Output Formatting', () => {
    const testLabel = 'level-format-test';
    const timestampFormat = 'YYYY-MM-DD HH:mm:ss'; // Default format used by createLogRegex

    // Define test cases for different log levels
    const logLevelsToTest = [
      { level: 'error', consoleMethod: 'error', specificFile: 'error.log' },
      { level: 'warn', consoleMethod: 'warn', specificFile: null },
      { level: 'info', consoleMethod: 'info', specificFile: 'info.log' },
      { level: 'verbose', consoleMethod: 'log', specificFile: null }, // Winston default maps verbose to console.log
      { level: 'debug', consoleMethod: 'debug', specificFile: null },
      { level: 'silly', consoleMethod: 'log', specificFile: null },   // Winston default maps silly to console.log
    ];

    for (const { level, consoleMethod, specificFile } of logLevelsToTest) {
      it(`should log ${level.toUpperCase()} messages correctly to console and files`, async () => {
        const logger = subLogger(testLabel, timestampFormat);
        logger.level = 'silly'; // Ensure all levels are processed by the logger

        const message = `This is a ${level} message.`;
        const consoleSpy = vi.spyOn(console, consoleMethod as any);

        (logger as any)[level](message); // e.g. logger.info(message)

        const logPattern = createLogRegex(level, testLabel, message);

        // Check combine.log for all levels (if level permits)
        await waitForFileContent(path.join(LOG_DIR, 'combine.log'), logPattern);

        // Check specific log file if one is configured for this level
        if (specificFile) {
          await waitForFileContent(path.join(LOG_DIR, specificFile), logPattern);
        } else {
          // For levels like warn, debug, etc., ensure they don't write to info.log or error.log inappropriately
          if (level !== 'info' && level !== 'error') {
            if (fs.existsSync(path.join(LOG_DIR, 'info.log'))) {
              const infoContent = fs.readFileSync(path.join(LOG_DIR, 'info.log'), 'utf-8');
              expect(infoContent).not.toMatch(createLogRegex(level, testLabel, message));
            }
            if (fs.existsSync(path.join(LOG_DIR, 'error.log'))) {
              const errorContent = fs.readFileSync(path.join(LOG_DIR, 'error.log'), 'utf-8');
              expect(errorContent).not.toMatch(createLogRegex(level, testLabel, message));
            }
          }
        }
        // Check console output
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(logPattern));
        consoleSpy.mockRestore();
      });
    }

    it('should log messages with splat arguments correctly (default Winston splat behavior)', async () => {
      const logger = subLogger(testLabel, timestampFormat);
      logger.level = 'info'; // Ensure info messages are logged
      const consoleInfoSpy = vi.spyOn(console, 'info');

      const messageWithoutSplat = 'Info message with string: %s and number: %d';
      const splatStr = 'test string';
      const splatNum = 12345;
      // Winston's default splat() formatter (implicitly used by .printf or if added to format chain)
      // will replace %s and %d in the message string.
      const expectedMessageAfterSplat = `Info message with string: ${splatStr} and number: ${splatNum}`;

      // The customFormat in subLogger is:
      // `${info.timestamp} [${info.level.toUpperCase()}] [${info.LEVEL}] [${info.SPLAT}] ${info.message}`
      // If winston's format.splat() is active, info.message becomes `expectedMessageAfterSplat`.
      // info.SPLAT will be an array of the original splat arguments: `[splatStr, splatNum]`.
      // So the log output would be:
      // TIMESTAMP [INFO] [testLabel] [splatStr,splatNum] expectedMessageAfterSplat
      // This is because `subLogger` does not explicitly add `format.splat()` before `customFormat`.
      // Let's assume this is the case to test the existing `customFormat` behavior.

      logger.info(messageWithoutSplat, splatStr, splatNum);

      // The value of info.SPLAT in the log will be the string representation of the array.
      const splatValueInLog = `${splatStr},${splatNum}`;
      const logPattern = createLogRegex('info', testLabel, messageWithoutSplat, splatValueInLog);


      await waitForFileContent(path.join(LOG_DIR, 'info.log'), logPattern);
      await waitForFileContent(path.join(LOG_DIR, 'combine.log'), logPattern);
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringMatching(logPattern));

      consoleInfoSpy.mockRestore();
    });
  });

  describe('Exception Handling Configuration', () => {
    it('should have an exception handler configured to write to the correct file', () => {
      const logger = subLogger('exception-test');
      const exceptionTransport = logger.exceptions.handlers.find(handler => {
        // Check if it's a File transport. Winston's transports don't have a very specific 'name' property for type checking.
        // We can check for properties characteristic of a FileTransport instance.
        return handler instanceof winston.transports.File || (handler as any).filename === 'exception.log';
      }) as winston.transports.FileTransportInstance | undefined;

      expect(exceptionTransport).toBeDefined();
      expect(exceptionTransport?.filename).toBe('exception.log'); // Assuming FILE_EXCEPTION resolves to this
      // We can get more specific if we import loadConfig or use more detailed checks
      // For example, checking `exceptionTransport.options.filename`
      expect((exceptionTransport?.options as any)?.filename).toBe(path.join('logs', 'exception.log'));
      // Note: The path here is relative to CWD when logger is created, or absolute if specified.
      // The FILE_EXCEPTION in loadConfig is just 'logs/exception.log'.
      // The logger prepends the LOG_DIR only for its own file transports, not necessarily for paths from loadConfig.
      // Let's re-verify how paths are handled in subLogger.
      // `FILE_EXCEPTION` is directly used in `new transports.File({ filename: FILE_EXCEPTION })`.
      // Winston by default considers these paths relative to `process.cwd()`.
      // So, the test should check against this, not necessarily LOG_DIR.
      // However, `loadConfig` itself prepends `LOG_BASE_DIR` ('logs')
      // `const LOG_BASE_DIR = process.env.LOG_DIR || 'logs';`
      // `const FILE_EXCEPTION = path.join(LOG_BASE_DIR, process.env.FILE_EXCEPTION || 'exception.log');`
      // So, `exceptionTransport.options.filename` should indeed be `logs/exception.log`.
    });
  });

  describe('DailyRotateFile Transport Configuration', () => {
    it('should have DailyRotateFile transport configured with correct options', () => {
      const logger = subLogger('daily-rotate-test');
      const dailyRotateTransport = logger.transports.find(transport => {
        return transport instanceof DailyRotateFile;
      }) as DailyRotateFile | undefined;

      expect(dailyRotateTransport).toBeDefined();

      // Expected values (some might come from loadConfig directly if we could import/mock it)
      // These are based on the defaults in loadConfig.ts if env vars are not set
      const expectedConfig = {
        filename: 'app-%DATE%.log', // Assuming APP_NAME defaults to 'app' if not set by env
        datePattern: 'YYYY-MM-DD-HH', // Default DAILY_FORMAT
        zippedArchive: true,          // Default DAILY_ZIP
        maxSize: '20m',               // Default MAX_SIZE
        maxFiles: '7d',               // Default MAX_FILES
        frequency: '24h',             // Default DAILY_FREQUENCY
      };

      // To make this test robust, we should ideally import loadConfig or have a way to get expected values.
      // For now, we'll assert against the known defaults from `loadConfig.ts` structure.
      // Note: `dailyRotateTransport.filename` might be the resolved one, not the pattern.
      // Accessing options directly:
      expect((dailyRotateTransport?.options as any)?.filename).toBe(expectedConfig.filename);
      expect((dailyRotateTransport?.options as any)?.datePattern).toBe(expectedConfig.datePattern);
      expect((dailyRotateTransport?.options as any)?.zippedArchive).toBe(expectedConfig.zippedArchive);
      expect((dailyRotateTransport?.options as any)?.maxSize).toBe(expectedConfig.maxSize);
      expect((dailyRotateTransport?.options as any)?.maxFiles).toBe(expectedConfig.maxFiles);
      expect((dailyRotateTransport?.options as any)?.frequency).toBe(expectedConfig.frequency);
    });
  });
});
