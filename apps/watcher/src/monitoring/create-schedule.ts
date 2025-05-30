import schedule from 'node-schedule';
import type { Job } from 'node-schedule';
import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
//
import config from '@src/config';
// import { logSimInnApi, logSimInnSMS } from '@src/utils/logger'
import { createLoggers } from '@src/utils/logger'
import { simInnApi, simInnSMS } from './siminn'
import { gaugeSimInnApi, gaugeSimInnSMS } from './prometheus'

// get schedule rules
import { createScheduleRules } from './create-schedule-rules';

/**
 * Basic logger interface for error reporting.
 * Ensures that the logger used within createSchedule has an error method.
 */
interface Logger {
  error: (message: string) => void;
  // info: (message: string) => void; // Example: add other methods if known/used
  // warn: (message: string) => void; // Example: add other methods if known/used
}

/**
 * Represents the scheduled jobs for API and SMS monitoring.
 * Contains the actual Job instances returned by node-schedule.
 */
export interface ScheduledJobs {
  jobAPI: Job;
  jobSMS: Job;
}

/**
 * Creates and starts scheduled jobs for monitoring SIMINN API and SMS services.
 * These jobs periodically check the health of the services using configured API paths
 * and update Prometheus gauges with the status. Errors during checks are logged.
 *
 * @param scheduleName - Optional name for the API monitoring job. Defaults to 'SIMINN-API'.
 * @returns An object containing the scheduled API and SMS jobs (`jobAPI` and `jobSMS`).
 */
export const createSchedule = (scheduleName: string = 'SIMINN-API'): ScheduledJobs => {
  const { logSimInnApi, logSimInnSMS }: { logSimInnApi: Logger; logSimInnSMS: Logger } = createLoggers();
  const { ruleAPI, ruleSMS } = createScheduleRules();

  const jobAPI: Job = schedule.scheduleJob(scheduleName, ruleAPI, async () => {
    try {
      const response: AxiosResponse = await simInnApi.get(config.simInnApiPathPing);
      gaugeSimInnApi.labels({ status: response.statusText }).set(response.status);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError; // Narrow type for easier access, though isAxiosError already does this for props
        gaugeSimInnApi.labels({ status: axiosError.response?.statusText || 'AxiosError' }).set(axiosError.response?.status || 0);
        logSimInnApi.error(`Axios error: ${axiosError.message}`);
      } else if (err instanceof Error) {
        gaugeSimInnApi.labels({ status: 'Error' }).set(0);
        logSimInnApi.error(`Generic error: ${err.message}`);
      } else {
        gaugeSimInnApi.labels({ status: 'UnknownError' }).set(0);
        logSimInnApi.error('An unknown error occurred');
      }
    }
  });

  const jobSMS: Job = schedule.scheduleJob('SIMINN-SMS', ruleSMS, async () => {
    try {
      const response: AxiosResponse = await simInnSMS.get(config.simInnSMSHealthcheck);
      // Assuming status 200 means healthy, so setting gauge to 1. Any other status or error sets to 0.
      if (response.status === 200) {
        gaugeSimInnSMS.labels({ status: response.statusText }).set(1);
      } else {
        gaugeSimInnSMS.labels({ status: response.statusText || 'Non200Status' }).set(0);
      }
    } catch (err: unknown) {
      gaugeSimInnSMS.labels({ status: 'Error' }).set(0);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        logSimInnSMS.error(`Axios error during SMS healthcheck: ${axiosError.message}`);
      } else if (err instanceof Error) {
        logSimInnSMS.error(`Generic error during SMS healthcheck: ${err.message}`);
      } else {
        logSimInnSMS.error('An unknown error occurred during SMS healthcheck');
      }
    }
  });

  return {
    jobAPI,
    jobSMS
  }
}
