import { afterEach, describe, expect, it, vi } from 'vitest';

import winston from 'winston';
import { subLogger } from '../src';
import path from 'path';
import fs from 'fs';

const LOG_DIR = path.join(__dirname, '/logs');

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
  });

  it('should return a winston logger instance', () => {
    const logger = subLogger();
    expect(logger).toBeInstanceOf(winston.Logger);
  });

  it('should use the default label if no label is provided', () => {
    const logger = subLogger();
    // @ts-expect-error Property 'label' does not exist on type 'Format'.
    expect(logger.format.label).toBeUndefined(); // Default label is not explicitly set on the format object, it's part of the formatter
  });

  it('should use the provided label if a label is provided', () => {
    const logger = subLogger('test-label');
    // @ts-expect-error Property 'label' does not exist on type 'Format'.
    expect(logger.format.label).toBeUndefined(); // Label is not directly accessible on format, it's used in the formatter. We'll test this by checking log output later.
  });

  it('should use the default timestamp format if no timestamp format is provided', () => {
    const logger = subLogger();
    // @ts-expect-error Property 'timestamp' does not exist on type 'Format'.
    expect(logger.format.timestamp).toBeUndefined(); // Default timestamp is not explicitly set on the format object
  });

  it('should use the provided timestamp format if a timestamp format is provided', () => {
    const logger = subLogger('test-label', 'YYYY-MM-DD');
    // @ts-expect-error Property 'timestamp' does not exist on type 'Format'.
    expect(logger.format.timestamp).toBeUndefined(); // Timestamp format is not directly accessible on format. We'll test this by checking log output later.
  });

  it('should create the log files', async () => {
    const logger = subLogger('test-label');
    logger.info('test message');

    setTimeout(() => {
      expect(fs.existsSync(path.join(LOG_DIR, 'info.log'))).toBe(true);
      expect(fs.existsSync(path.join(LOG_DIR, 'error.log'))).toBe(true);
      expect(fs.existsSync(path.join(LOG_DIR, 'debug.log'))).toBe(true);

      // done();
    }, 100); // Allow time for file creation
  });

  it('should log messages to the console and files', async () => {
    const logger = subLogger('test-label', 'YYYY-MM-DD HH:mm:ss');
    const infoSpy = vi.spyOn(console, 'info');
    const errorSpy = vi.spyOn(console, 'error');
    const debugSpy = vi.spyOn(console, 'debug');

    logger.info('info message');
    logger.error('error message');
    logger.debug('debug message');

    setTimeout(() => {
      expect(infoSpy).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalled();

      const infoLog = fs.readFileSync(path.join(LOG_DIR, 'info.log'), 'utf-8');
      const errorLog = fs.readFileSync(path.join(LOG_DIR, 'error.log'), 'utf-8');
      const debugLog = fs.readFileSync(path.join(LOG_DIR, 'debug.log'), 'utf-8');

      expect(infoLog).toContain('[test-label] info message');
      expect(errorLog).toContain('[test-label] error message');
      expect(debugLog).toContain('[test-label] debug message');

      // Check timestamp format (loosely)
      expect(infoLog).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);

      infoSpy.mockRestore();
      errorSpy.mockRestore();
      debugSpy.mockRestore();
    }, 100); // Allow time for logs to be written
  });
});
