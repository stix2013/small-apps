import schedule from 'node-schedule';
import type { Range } from 'node-schedule';

export interface ScheduleConfig {
  second?: number | string;
  minute?: number | string | Range;
  hour?: number | string | Range;
  date?: number | string | Range;
  month?: number | string | Range;
  dayOfWeek?: number | string | Range;
}

export interface ScheduleRuleConfig {
  api?: ScheduleConfig;
  sms?: ScheduleConfig;
}

export interface ScheduleRules {
  ruleAPI: schedule.RecurrenceRule;
  ruleSMS: schedule.RecurrenceRule;
}

/**
 * Creates schedule recurrence rules for API and SMS tasks.
 * Optionally accepts custom configurations for these rules.
 */
export const createScheduleRules = (config?: ScheduleRuleConfig): ScheduleRules => {
  const ruleAPI = new schedule.RecurrenceRule();
  const ruleSMS = new schedule.RecurrenceRule();

  // API Rule
  if (config?.api) {
    if (config.api.second !== undefined) ruleAPI.second = config.api.second;
    if (config.api.minute !== undefined) ruleAPI.minute = config.api.minute;
    if (config.api.hour !== undefined) ruleAPI.hour = config.api.hour;
    if (config.api.date !== undefined) ruleAPI.date = config.api.date;
    if (config.api.month !== undefined) ruleAPI.month = config.api.month;
    if (config.api.dayOfWeek !== undefined) ruleAPI.dayOfWeek = config.api.dayOfWeek;
  } else {
    // Default API schedule: every 5 minutes
    ruleAPI.minute = '*/5';
  }

  // SMS Rule
  if (config?.sms) {
    if (config.sms.second !== undefined) ruleSMS.second = config.sms.second;
    if (config.sms.minute !== undefined) ruleSMS.minute = config.sms.minute;
    if (config.sms.hour !== undefined) ruleSMS.hour = config.sms.hour;
    if (config.sms.date !== undefined) ruleSMS.date = config.sms.date;
    if (config.sms.month !== undefined) ruleSMS.month = config.sms.month;
    if (config.sms.dayOfWeek !== undefined) ruleSMS.dayOfWeek = config.sms.dayOfWeek;
  } else {
    // Default SMS schedule: every minute at the 30th second
    ruleSMS.second = 30;
    ruleSMS.minute = new schedule.Range(0, 59, 1);
  }

  return {
    ruleAPI,
    ruleSMS,
  };
};
