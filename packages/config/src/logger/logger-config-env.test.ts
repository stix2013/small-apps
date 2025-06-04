import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'; // Removed afterAll
import path from 'pathe';
// loadConfig will be imported dynamically in tests

const originalEnv = { ...process.env };
const testEnvPath = path.resolve(__dirname, '.env');

describe('loadConfig', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  describe('When .env file is loaded', () => {
    beforeEach(async () => {
      process.env = { ...originalEnv };
      const actualDotenv = await vi.importActual<typeof import('dotenv')>('dotenv');
      actualDotenv.config({ path: testEnvPath, override: true });
      vi.resetModules();
    });

    it('should load configuration from .env file', async () => {
      const { loadConfig: loadConfigFresh } = await import('./logger-config');
      const config = loadConfigFresh();

      expect(config.appName).toBe('TestAppForConfig');
      expect(config.logDir).toBe('./test_logs');
      expect(config.dailyFrequency).toBe('YYYY-MM-DD');
      expect(config.dailyZip).toBe(true);
      expect(config.formatTimestamp).toBe('HH:mm:ss');
      expect(config.fileInfo).toBe('info-test.log');
      expect(config.maxSize).toBe('10m');
      expect(config.maxFiles).toBe('5d');
      expect(config.dailyPath).toBe('./test_logs/daily');
      expect(config.dailyFilename).toBe('./test_logs/daily/testappforconfig-%DATE%.log');
      expect(config.formatDaily).toBe('YYYY-MM-DD_HH');
      expect(config.fileCombine).toBe('combine-test.log');
      expect(config.fileError).toBe('error-test.log');
      expect(config.fileException).toBe('exception-test.log');
    });
  });

  describe('LOG_DAILY_ZIP specific logic', () => {
    beforeEach(async () => {
        process.env = { ...originalEnv };
        const actualDotenv = await vi.importActual<typeof import('dotenv')>('dotenv');
        actualDotenv.config({ path: testEnvPath, override: true });
        delete process.env.LOG_DAILY_ZIP;
        vi.resetModules();
    });

    it('should set dailyZip to true when LOG_DAILY_ZIP is "yes"', async () => {
      process.env.LOG_DAILY_ZIP = 'yes';
      vi.resetModules();
      const { loadConfig: loadConfigFresh } = await import('./logger-config');
      const config = loadConfigFresh();
      expect(config.dailyZip).toBe(true);
    });

    it('should set dailyZip to true when LOG_DAILY_ZIP is any non-empty string (e.g., "true")', async () => {
      process.env.LOG_DAILY_ZIP = 'true';
      vi.resetModules();
      const { loadConfig: loadConfigFresh } = await import('./logger-config');
      const config = loadConfigFresh();
      expect(config.dailyZip).toBe(true);

      process.env.LOG_DAILY_ZIP = 'any_string';
      vi.resetModules();
      const { loadConfig: loadConfigNext } = await import('./logger-config');
      const config2 = loadConfigNext();
      expect(config2.dailyZip).toBe(true);
    });

    it('should set dailyZip to false when LOG_DAILY_ZIP is an empty string', async () => {
      process.env.LOG_DAILY_ZIP = '';
      vi.resetModules();
      const { loadConfig: loadConfigFresh } = await import('./logger-config');
      const config = loadConfigFresh();
      expect(config.dailyZip).toBe(false);
    });
    // Removed the redundant/misplaced test for LOG_DAILY_ZIP being undefined,
    // as this scenario (true default) is correctly covered and passing in logger-config-default.test.ts.
    // The tests in this file ('logger-config-env.test.ts') are for when .env IS loaded.
    // The case 'LOG_DAILY_ZIP is undefined after .env load but then deleted from process.env'
    // is inherently problematic if the module's internal dotenv reloads the file, as observed.
  });
});
