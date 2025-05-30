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
    labels: vi.fn().mockReturnThis(), // or mockReturnValue({ set: vi.fn() })
    set: vi.fn(), // if set is directly on gauge after labels().set()
  },
  gaugeSimInnSMS: {
    labels: vi.fn().mockReturnThis(), // or mockReturnValue({ set: vi.fn() })
    set: vi.fn(), // if set is directly on gauge after labels().set()
  },
}));

// ../rules
vi.mock('../rules', () => ({
  // Assuming createScheduleRules returns an object with specific rule strings
  createScheduleRules: vi.fn(() => ({ ruleAPI: 'mock-rule-api-inline', ruleSMS: 'mock-rule-sms-inline' })),
}));

// --- Import mocked modules to use vi.mocked() ---
// schedule is often imported as default or specific named exports
// Adjust based on actual usage in the file under test (schedule.ts)
// Assuming 'schedule' is the default export from 'node-schedule' based on previous structure
// import schedule from 'node-schedule'; // This would now be the mocked version
// For named exports if used:
// import { scheduleJob, gracefulShutdown } from 'node-schedule';

// --- Test Suite ---
describe('createSchedule', () => {
  let jobAPICallback: () => Promise<void>;
  let jobSMSCallback: () => Promise<void>;
  // Store mocked rules for use in assertions
  const capturedMockRules = { ruleAPI: 'mock-rule-api-captured', ruleSMS: 'mock-rule-sms-captured' };

  beforeEach(() => {
    vi.resetAllMocks();

    // Re-initialize mocks that return other mocks or specific values for each test
    vi.mocked(createLoggers).mockReturnValue({
        logSimInnApi: { error: vi.fn() }, // Fresh vi.fn() for error loggers
        logSimInnSMS: { error: vi.fn() },
        logCdr: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    vi.mocked(gaugeSimInnApi.labels).mockReturnThis();
    vi.mocked(gaugeSimInnApi.set).mockClear(); // Clear any previous calls to set
    vi.mocked(gaugeSimInnSMS.labels).mockReturnThis();
    vi.mocked(gaugeSimInnSMS.set).mockClear(); // Clear any previous calls to set
    // Use the capturedMockRules for consistency in mock and assertions
    // vi.mocked(createScheduleRules).mockReturnValue(capturedMockRules);


    // Call createSchedule to set up the jobs
    createSchedule();

    // Assert that scheduleJob was called with the correct parameters
    // Accessing the mocked scheduleJob correctly:
    // If 'node-schedule' default exports an object with scheduleJob:
    const mockScheduleJobInstance = vi.mocked(schedule.scheduleJob);

    expect(mockScheduleJobInstance).toHaveBeenCalledTimes(2);
    expect(mockScheduleJobInstance).toHaveBeenCalledWith(
      'SIMINN-API',
      capturedMockRules.ruleAPI,
      expect.any(Function)
    );
    expect(mockScheduleJobInstance).toHaveBeenCalledWith( // Corrected this line
      'SIMINN-SMS',
      capturedMockRules.ruleSMS,
      expect.any(Function)
    );

    // Capture the callbacks
    // Find the API job callback by name 'jobAPI' (first argument to scheduleJob)
    const mockScheduleJobRef = schedule.scheduleJob; // Get the correct ref
    const apiJobCall = vi.mocked(mockScheduleJobRef).mock.calls.find(call => call[0] === 'jobAPI');
    // Find the SMS job callback by name 'jobSMS' (first argument to scheduleJob)
    const smsJobCall = vi.mocked(mockScheduleJobRef).mock.calls.find(call => call[0] === 'jobSMS');

    if (apiJobCall && typeof apiJobCall[1] === 'function') { // apiJobCall[1] is the rule, apiJobCall[2] is the callback
      jobAPICallback = apiJobCall[1] as () => Promise<void>;
    } else {
      // If jobAPI wasn't found by its specific name, try to find SIMINN-API
      // This is a fallback based on the new assertions, though jobAPI is the actual name used in schedule.ts
      const siminnApiJobCall = vi.mocked(mockScheduleJobRef).mock.calls.find(call => call[0] === 'SIMINN-API');
      if (siminnApiJobCall && typeof siminnApiJobCall[1] === 'function') {
        jobAPICallback = siminnApiJobCall[1] as () => Promise<void>;
        console.warn("Found API job by 'SIMINN-API', ensure 'jobAPI' is the name used in schedule.ts for consistency with tests.");
      } else {
        throw new Error('API Job callback not captured. Ensure scheduleJob was called with "jobAPI" or "SIMINN-API" as the job name.');
      }
    }

    if (smsJobCall && typeof smsJobCall[1] === 'function') { // smsJobCall[1] is rule, smsJobCall[2] is callback
      jobSMSCallback = smsJobCall[1] as () => Promise<void>;
    } else {
      // Fallback for SMS job similar to API job
      const siminnSmsJobCall = vi.mocked(mockScheduleJobRef).mock.calls.find(call => call[0] === 'SIMINN-SMS');
      if (siminnSmsJobCall && typeof siminnSmsJobCall[1] === 'function') {
        jobSMSCallback = siminnSmsJobCall[1] as () => Promise<void>;
        console.warn("Found SMS job by 'SIMINN-SMS', ensure 'jobSMS' is the name used in schedule.ts for consistency with tests.");
      } else {
        throw new Error('SMS Job callback not captured. Ensure scheduleJob was called with "jobSMS" or "SIMINN-SMS" as the job name.');
      }
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
