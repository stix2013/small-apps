import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSchedule } from '../create-schedule';
import schedule from 'node-schedule';
import { simInnApi, simInnSMS } from '../siminn';
import { gaugeSimInnApi, gaugeSimInnSMS } from '../prometheus';
import { createScheduleRules } from '../create-schedule-rules';
import config from '@src/config';
import { createLoggers } from '@src/utils/logger';

// --- Mock Dependencies ---

// node-schedule
vi.mock('node-schedule', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node-schedule')>();
  return {
    ...actual, // Spread actual to keep other parts of the module intact if needed
    scheduleJob: vi.fn(),
    gracefulShutdown: vi.fn().mockResolvedValue(undefined), // Ensure gracefulShutdown is also mocked if used
    // default export if the original module uses it (based on previous mock structure)
    default: {
      scheduleJob: vi.fn(),
      gracefulShutdown: vi.fn().mockResolvedValue(undefined),
    }
  };
});

// @src/config - This mock seems fine as it returns a static object.
vi.mock('@src/config', () => ({
  default: {
    simInnApiPathPing: '/test-ping',
    simInnSMSHealthcheck: '/test-health',
    // Add other necessary config properties if schedule.ts uses them
  },
}));

// @src/utils/logger
vi.mock('@src/utils/logger', () => ({
  createLoggers: vi.fn().mockReturnValue({
    logSimInnApi: { error: vi.fn() },
    logSimInnSMS: { error: vi.fn() },
    // Add other loggers if createLoggers returns them
    logCdr: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  }),
  // If 'loggers' array is directly imported and used
  loggers: [{ close: vi.fn() }, { close: vi.fn() }],
  logCdrFilename: vi.fn().mockReturnValue({ info: vi.fn(), warn: vi.fn(), error: vi.fn(), end: vi.fn() })
}));

// ../siminn
vi.mock('../siminn', () => ({
  simInnApi: {
    get: vi.fn(),
  },
  simInnSMS: {
    get: vi.fn(),
  },
}));

// ../prometheus
vi.mock('../prometheus', () => ({
  gaugeSimInnApi: {
    labels: vi.fn().mockReturnThis(),
    set: vi.fn(),
  },
  gaugeSimInnSMS: {
    labels: vi.fn().mockReturnThis(),
    set: vi.fn(),
  },
}));

// ../create-schedule-rules (Corrected path)
vi.mock('../create-schedule-rules', () => ({
  createScheduleRules: vi.fn(), // Implementation will be provided in beforeEach
}));


// --- Test Suite ---
describe('createSchedule', () => {
  let jobAPICallback: () => Promise<void>;
  let jobSMSCallback: () => Promise<void>;
  // Define capturedMockRules with more realistic RecurrenceRule-like objects or actual instances
  // For this test, the exact structure of rules might not be deeply inspected by scheduleJob mock,
  // but it's good practice for them to resemble the expected types.
  const capturedMockRules = {
    ruleAPI: new schedule.RecurrenceRule(), // Using actual RecurrenceRule for type correctness
    ruleSMS: new schedule.RecurrenceRule(), // Needs `import schedule from 'node-schedule'`
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Re-initialize mocks that return other mocks or specific values for each test
    vi.mocked(createLoggers).mockReturnValue({
        logSimInnApi: { error: vi.fn() },
        logSimInnSMS: { error: vi.fn() },
        logCdr: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any); // Cast to any if createLoggers return type is complex or not fully typed here

    vi.mocked(gaugeSimInnApi.labels).mockReturnThis();
    vi.mocked(gaugeSimInnApi.set).mockClear();
    vi.mocked(gaugeSimInnSMS.labels).mockReturnThis();
    vi.mocked(gaugeSimInnSMS.set).mockClear();

    // Set up the mock for createScheduleRules *before* calling createSchedule
    // This ensures createSchedule uses the mocked rules.
    vi.mocked(createScheduleRules).mockReturnValue(capturedMockRules);

    // Call createSchedule to set up the jobs
    createSchedule(); // Default scheduleName 'SIMINN-API' will be used

    const mockScheduleJob = vi.mocked(schedule.scheduleJob);

    expect(mockScheduleJob).toHaveBeenCalledTimes(2);
    expect(mockScheduleJob).toHaveBeenCalledWith(
      'SIMINN-API', // Default scheduleName used in createSchedule
      capturedMockRules.ruleAPI,
      expect.any(Function)
    );
    expect(mockScheduleJob).toHaveBeenCalledWith(
      'SIMINN-SMS',
      capturedMockRules.ruleSMS,
      expect.any(Function)
    );

    // Capture the callbacks
    // The callback is the 3rd argument (index 2) to schedule.scheduleJob
    const apiJobCall = mockScheduleJob.mock.calls.find(call => call[0] === 'SIMINN-API');
    if (apiJobCall && typeof apiJobCall[2] === 'function') {
      jobAPICallback = apiJobCall[2] as () => Promise<void>;
    } else {
      throw new Error("API Job callback (for 'SIMINN-API') not captured or not a function.");
    }

    const smsJobCall = mockScheduleJob.mock.calls.find(call => call[0] === 'SIMINN-SMS');
    if (smsJobCall && typeof smsJobCall[2] === 'function') {
      jobSMSCallback = smsJobCall[2] as () => Promise<void>;
    } else {
      throw new Error("SMS Job callback (for 'SIMINN-SMS') not captured or not a function.");
    }
  });

  describe('SIMINN API Job (jobAPI callback)', () => {
    it('should handle successful API call', async () => {
      const mockResponse = { status: 200, statusText: 'OK' };
      vi.mocked(simInnApi.get).mockResolvedValue(mockResponse);

      await jobAPICallback();

      expect(simInnApi.get).toHaveBeenCalledWith(config.simInnApiPathPing);
      expect(gaugeSimInnApi.labels).toHaveBeenCalledWith({ status: 'OK' });
      expect(gaugeSimInnApi.set).toHaveBeenCalledWith(200);
      expect(vi.mocked(createLoggers)().logSimInnApi.error).not.toHaveBeenCalled();
    });

    it('should handle Axios error during API call', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404, statusText: 'Not Found' },
        message: 'Request failed with status code 404',
      };
      vi.mocked(simInnApi.get).mockRejectedValue(axiosError);

      await jobAPICallback();

      expect(simInnApi.get).toHaveBeenCalledWith(config.simInnApiPathPing);
      expect(gaugeSimInnApi.labels).toHaveBeenCalledWith({ status: 'Not Found' });
      expect(gaugeSimInnApi.set).toHaveBeenCalledWith(404);
      expect(vi.mocked(createLoggers)().logSimInnApi.error).toHaveBeenCalledWith(axiosError.message);
    });

    it('should handle non-Axios error during API call', async () => {
      const genericError = new Error('Network Error');
      vi.mocked(simInnApi.get).mockRejectedValue(genericError);

      await jobAPICallback();

      expect(simInnApi.get).toHaveBeenCalledWith(config.simInnApiPathPing);
      expect(gaugeSimInnApi.labels).toHaveBeenCalledWith({ status: 'Error' });
      expect(gaugeSimInnApi.set).toHaveBeenCalledWith(0);
      expect(vi.mocked(createLoggers)().logSimInnApi.error).toHaveBeenCalledWith(genericError.message);
    });
  });

  describe('SIMINN SMS Job (jobSMS callback)', () => {
    it('should handle successful SMS check', async () => {
      const mockResponse = { status: 200, statusText: 'SMS OK' }; // Assuming simInnSMS.get also returns status/statusText
      vi.mocked(simInnSMS.get).mockResolvedValue(mockResponse);

      await jobSMSCallback();

      expect(simInnSMS.get).toHaveBeenCalledWith(config.simInnSMSHealthcheck);
      expect(gaugeSimInnSMS.labels).toHaveBeenCalledWith({ status: 'SMS OK' });
      expect(gaugeSimInnSMS.set).toHaveBeenCalledWith(1); // 1 for success
      expect(vi.mocked(createLoggers)().logSimInnSMS.error).not.toHaveBeenCalled();
    });

    it('should handle error during SMS check', async () => {
      const smsError = new Error('SMS Check Failed');
      vi.mocked(simInnSMS.get).mockRejectedValue(smsError);

      await jobSMSCallback();

      expect(simInnSMS.get).toHaveBeenCalledWith(config.simInnSMSHealthcheck);
      expect(gaugeSimInnSMS.labels).toHaveBeenCalledWith({ status: 'Error' });
      expect(gaugeSimInnSMS.set).toHaveBeenCalledWith(0); // 0 for error
      expect(vi.mocked(createLoggers)().logSimInnSMS.error).toHaveBeenCalledWith(smsError.message);
    });
  });
});
