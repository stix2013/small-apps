import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSchedule } from '../schedule';
import schedule from 'node-schedule';
import { simInnApi, simInnSMS } from '../siminn';
import { gaugeSimInnApi, gaugeSimInnSMS } from '../prometheus';
import { createScheduleRules } from '../rules';
import config from '@src/config';
import { createLoggers } from '@src/utils/logger';

// --- Mock Dependencies ---

// node-schedule
const mockScheduleJob = vi.fn();
vi.mock('node-schedule', () => ({
  default: {
    scheduleJob: mockScheduleJob,
  },
}));

// @src/config
vi.mock('@src/config', () => ({
  default: {
    simInnApiPathPing: '/test-ping',
    simInnSMSHealthcheck: '/test-health',
    // Add other necessary config properties if schedule.ts uses them
  },
}));

// @src/utils/logger
const mockLogSimInnApiError = vi.fn();
const mockLogSimInnSMSError = vi.fn();
vi.mock('@src/utils/logger', () => ({
  createLoggers: vi.fn(() => ({
    logSimInnApi: {
      error: mockLogSimInnApiError,
    },
    logSimInnSMS: {
      error: mockLogSimInnSMSError,
    },
  })),
}));

// ../siminn
const mockSimInnApiGet = vi.fn();
const mockSimInnSMSGet = vi.fn();
vi.mock('../siminn', () => ({
  simInnApi: {
    get: mockSimInnApiGet,
  },
  simInnSMS: {
    get: mockSimInnSMSGet,
  },
}));

// ../prometheus
const mockGaugeSimInnApiSet = vi.fn();
const mockGaugeSimInnApiLabels = vi.fn().mockReturnValue({ set: mockGaugeSimInnApiSet });
const mockGaugeSimInnSMSSet = vi.fn();
const mockGaugeSimInnSMSLabels = vi.fn().mockReturnValue({ set: mockGaugeSimInnSMSSet });

vi.mock('../prometheus', () => ({
  gaugeSimInnApi: {
    labels: mockGaugeSimInnApiLabels,
    // set: mockGaugeSimInnApiSet, // direct set on gauge is not used in schedule.ts
  },
  gaugeSimInnSMS: {
    labels: mockGaugeSimInnSMSLabels,
    // set: mockGaugeSimInnSMSSet, // direct set on gauge is not used in schedule.ts
  },
}));

// ../rules
const mockRules = { ruleAPI: 'mock-rule-api', ruleSMS: 'mock-rule-sms' };
vi.mock('../rules', () => ({
  createScheduleRules: vi.fn(() => mockRules),
}));


// --- Test Suite ---
describe('createSchedule', () => {
  let jobAPICallback: () => Promise<void>;
  let jobSMSCallback: () => Promise<void>;
  // Store mocked rules for use in assertions
  const capturedMockRules = { ruleAPI: 'mock-rule-api-captured', ruleSMS: 'mock-rule-sms-captured' };

  beforeEach(() => {
    vi.resetAllMocks();

    // Re-initialize mocks that return other mocks if needed
    vi.mocked(createLoggers).mockReturnValue({
        logSimInnApi: { error: mockLogSimInnApiError },
        logSimInnSMS: { error: mockLogSimInnSMSError },
    } as any); // Use 'as any' to simplify mock structure for testing
    vi.mocked(gaugeSimInnApi.labels).mockReturnValue({ set: mockGaugeSimInnApiSet });
    vi.mocked(gaugeSimInnSMS.labels).mockReturnValue({ set: mockGaugeSimInnSMSSet });
    // Use the capturedMockRules for consistency in mock and assertions
    vi.mocked(createScheduleRules).mockReturnValue(capturedMockRules);


    // Call createSchedule to set up the jobs
    createSchedule();

    // Assert that scheduleJob was called with the correct parameters
    expect(mockScheduleJob).toHaveBeenCalledTimes(2);
    expect(mockScheduleJob).toHaveBeenCalledWith(
      'SIMINN-API',
      capturedMockRules.ruleAPI,
      expect.any(Function)
    );
    expect(mockScheduleJob).toHaveBeenCalledWith(
      'SIMINN-SMS',
      capturedMockRules.ruleSMS,
      expect.any(Function)
    );

    // Capture the callbacks
    // Find the API job callback by name 'jobAPI' (first argument to scheduleJob)
    const apiJobCall = mockScheduleJob.mock.calls.find(call => call[0] === 'jobAPI');
    // Find the SMS job callback by name 'jobSMS' (first argument to scheduleJob)
    const smsJobCall = mockScheduleJob.mock.calls.find(call => call[0] === 'jobSMS');

    if (apiJobCall && typeof apiJobCall[2] === 'function') {
      jobAPICallback = apiJobCall[2];
    } else {
      // If jobAPI wasn't found by its specific name, try to find SIMINN-API
      // This is a fallback based on the new assertions, though jobAPI is the actual name used in schedule.ts
      const siminnApiJobCall = mockScheduleJob.mock.calls.find(call => call[0] === 'SIMINN-API');
      if (siminnApiJobCall && typeof siminnApiJobCall[2] === 'function') {
        jobAPICallback = siminnApiJobCall[2];
        console.warn("Found API job by 'SIMINN-API', ensure 'jobAPI' is the name used in schedule.ts for consistency with tests.");
      } else {
        throw new Error('API Job callback not captured. Ensure scheduleJob was called with "jobAPI" or "SIMINN-API" as the job name.');
      }
    }

    if (smsJobCall && typeof smsJobCall[2] === 'function') {
      jobSMSCallback = smsJobCall[2];
    } else {
      // Fallback for SMS job similar to API job
      const siminnSmsJobCall = mockScheduleJob.mock.calls.find(call => call[0] === 'SIMINN-SMS');
      if (siminnSmsJobCall && typeof siminnSmsJobCall[2] === 'function') {
        jobSMSCallback = siminnSmsJobCall[2];
        console.warn("Found SMS job by 'SIMINN-SMS', ensure 'jobSMS' is the name used in schedule.ts for consistency with tests.");
      } else {
        throw new Error('SMS Job callback not captured. Ensure scheduleJob was called with "jobSMS" or "SIMINN-SMS" as the job name.');
      }
    }
  });

  describe('SIMINN API Job (jobAPI callback)', () => {
    it('should handle successful API call', async () => {
      const mockResponse = { status: 200, statusText: 'OK' };
      mockSimInnApiGet.mockResolvedValue(mockResponse);

      await jobAPICallback();

      expect(simInnApi.get).toHaveBeenCalledWith(config.simInnApiPathPing);
      expect(gaugeSimInnApi.labels).toHaveBeenCalledWith({ status: 'OK' });
      expect(mockGaugeSimInnApiSet).toHaveBeenCalledWith(200);
      expect(mockLogSimInnApiError).not.toHaveBeenCalled();
    });

    it('should handle Axios error during API call', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404, statusText: 'Not Found' },
        message: 'Request failed with status code 404',
      };
      mockSimInnApiGet.mockRejectedValue(axiosError);

      await jobAPICallback();

      expect(simInnApi.get).toHaveBeenCalledWith(config.simInnApiPathPing);
      expect(gaugeSimInnApi.labels).toHaveBeenCalledWith({ status: 'Not Found' });
      expect(mockGaugeSimInnApiSet).toHaveBeenCalledWith(404);
      expect(mockLogSimInnApiError).toHaveBeenCalledWith(axiosError.message);
    });

    it('should handle non-Axios error during API call', async () => {
      const genericError = new Error('Network Error');
      mockSimInnApiGet.mockRejectedValue(genericError);

      await jobAPICallback();

      expect(simInnApi.get).toHaveBeenCalledWith(config.simInnApiPathPing);
      expect(gaugeSimInnApi.labels).toHaveBeenCalledWith({ status: 'Error' });
      expect(mockGaugeSimInnApiSet).toHaveBeenCalledWith(0);
      expect(mockLogSimInnApiError).toHaveBeenCalledWith(genericError.message);
    });
  });

  describe('SIMINN SMS Job (jobSMS callback)', () => {
    it('should handle successful SMS check', async () => {
      const mockResponse = { status: 200, statusText: 'SMS OK' }; // Assuming simInnSMS.get also returns status/statusText
      mockSimInnSMSGet.mockResolvedValue(mockResponse);

      await jobSMSCallback();

      expect(simInnSMS.get).toHaveBeenCalledWith(config.simInnSMSHealthcheck);
      expect(gaugeSimInnSMS.labels).toHaveBeenCalledWith({ status: 'SMS OK' });
      expect(mockGaugeSimInnSMSSet).toHaveBeenCalledWith(1); // 1 for success
      expect(mockLogSimInnSMSError).not.toHaveBeenCalled();
    });

    it('should handle error during SMS check', async () => {
      const smsError = new Error('SMS Check Failed');
      mockSimInnSMSGet.mockRejectedValue(smsError);

      await jobSMSCallback();

      expect(simInnSMS.get).toHaveBeenCalledWith(config.simInnSMSHealthcheck);
      expect(gaugeSimInnSMS.labels).toHaveBeenCalledWith({ status: 'Error' });
      expect(mockGaugeSimInnSMSSet).toHaveBeenCalledWith(0); // 0 for error
      expect(mockLogSimInnSMSError).toHaveBeenCalledWith(smsError.message);
    });
  });
});
