import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import path from 'pathe';
// loadConfig will be imported dynamically in tests after vi.resetModules()

// Store original process.env from a shared location or define it per file if needed
// For now, let's assume originalEnv is simple enough to be redefined or we manage it.
// It's critical that originalEnv is truly the state BEFORE any .env loading.
const originalEnv = { ...process.env }; // Snapshot at the start of this file's execution.

// Mock the entire dotenv module for the scope of these "Default Value Tests"
vi.doMock('dotenv', () => {
  return {
    config: vi.fn().mockReturnValue({ parsed: {} }), // Mock the config function to do nothing
  };
});

describe('loadConfig Default Value Tests', () => {
  beforeEach(async () => {
    process.env = { ...originalEnv }; // Start with a clean slate

    // Ensure specific vars that have defaults are undefined in process.env
    delete process.env.APP_NAME;
    delete process.env.logDir;
    delete process.env.LOG_DAILY_FREQUENCY;
    delete process.env.LOG_DAILY_ZIP;
    delete process.env.LOG_DAILY_PATH;
    delete process.env.LOG_DAILY_FORMAT;
    delete process.env.LOG_TIME_FORMAT;
    delete process.env.LOG_FILENAME_INFO;
    delete process.env.LOG_FILENAME_COMBINE;
    delete process.env.LOG_FILENAME_ERROR;
    delete process.env.LOG_FILENAME_EXCEPTION;
    delete process.env.LOG_MAX_SIZE;
    delete process.env.LOG_MAX_FILES;

    vi.resetModules(); // Ensure logger-config and its (mocked) dotenv are re-imported
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules(); // Clean up modules after each test
  });

  it('should use default APP_NAME if not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.appName).toBe('logger');
  });

  it('should use default logDir if not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.logDir).toBe(path.resolve(__dirname, 'logs'));
  });

  it('should have undefined dailyFrequency if not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.dailyFrequency).toBeUndefined();
  });

  it('should use default dailyZip (false) if LOG_DAILY_ZIP is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.dailyZip).toBe(false);
  });

  it('should use default dailyPath (value of logDir) if LOG_DAILY_PATH is not set', async () => {
    process.env.logDir = 'custom_log_dir_for_daily_path_test';
    vi.resetModules();
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.dailyPath).toBe('custom_log_dir_for_daily_path_test');
  });

  it('should use default dailyPath (resolved default logDir) if LOG_DAILY_PATH and logDir are not set', async () => {
      const { loadConfig: loadConfigFresh } = await import('./logger-config');
      const config = loadConfigFresh();
      expect(config.dailyPath).toBe(path.resolve(__dirname, 'logs'));
  });

  it('should use default formatDaily if LOG_DAILY_FORMAT is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.formatDaily).toBe('YYYYMMDD-HH');
  });

  it('should use default formatTimestamp if LOG_TIME_FORMAT is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.formatTimestamp).toBe('YYYY-MM-DD HH:mm:ss');
  });

  it('should use default fileInfo if LOG_FILENAME_INFO is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    const expectedLogDir = path.resolve(__dirname, 'logs');
    expect(config.fileInfo).toBe(path.resolve(expectedLogDir, 'info.log'));
  });

  it('should use default fileCombine if LOG_FILENAME_COMBINE is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    const expectedLogDir = path.resolve(__dirname, 'logs');
    expect(config.fileCombine).toBe(path.resolve(expectedLogDir, 'combine.log'));
  });

  it('should use default fileError if LOG_FILENAME_ERROR is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    const expectedLogDir = path.resolve(__dirname, 'logs');
    expect(config.fileError).toBe(path.resolve(expectedLogDir, 'error.log'));
  });

  it('should have undefined fileException if LOG_FILENAME_EXCEPTION is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.fileException).toBeUndefined();
  });

  it('should use default maxSize if LOG_MAX_SIZE is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.maxSize).toBe('20m');
  });

  it('should use default maxFiles if LOG_MAX_FILES is not set', async () => {
    const { loadConfig: loadConfigFresh } = await import('./logger-config');
    const config = loadConfigFresh();
    expect(config.maxFiles).toBe('14d');
  });
});
