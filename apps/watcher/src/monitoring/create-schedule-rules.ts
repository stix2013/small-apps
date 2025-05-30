import schedule from 'node-schedule';

/**
 * @typedef {object} ScheduleConfig
 * @property {number | string} [second]
 * @property {number | string} [minute]
 * @property {number | string} [hour]
 * @property {number | string} [dayOfMonth]
 * @property {number | string} [month]
 * @property {number | string} [dayOfWeek]
 */

/**
 * @typedef {object} ScheduleRuleConfig
 * @property {ScheduleConfig} [api]
 * @property {ScheduleConfig} [sms]
 */

/**
 * Creates schedule rules for API and SMS notifications.
 *
 * @param {ScheduleRuleConfig} [config] - Optional configuration for API and SMS schedules.
 * @returns {{ruleAPI: schedule.RecurrenceRule, ruleSMS: schedule.RecurrenceRule}} - An object containing the schedule rules for API and SMS.
 */
export const createScheduleRules = (config) => {
  const ruleAPI = new schedule.RecurrenceRule();
  const ruleSMS = new schedule.RecurrenceRule();

  // API Rule
  if (config?.api) {
    if (config.api.second !== undefined) ruleAPI.second = config.api.second;
    if (config.api.minute !== undefined) ruleAPI.minute = config.api.minute;
    if (config.api.hour !== undefined) ruleAPI.hour = config.api.hour;
    if (config.api.dayOfMonth !== undefined) ruleAPI.dayOfMonth = config.api.dayOfMonth;
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
    if (config.sms.dayOfMonth !== undefined) ruleSMS.dayOfMonth = config.sms.dayOfMonth;
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
