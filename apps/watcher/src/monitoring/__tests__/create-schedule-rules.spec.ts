import { createScheduleRules } from '../create-schedule-rules';
import { RecurrenceRule, Range } from 'node-schedule';

describe('createScheduleRules', () => {
  // 1. Calling createScheduleRules with no arguments
  it('should return default schedules when no config is provided', () => {
    const { ruleAPI, ruleSMS } = createScheduleRules();

    // Verify API rule (every 5 minutes)
    expect(ruleAPI.minute).toBe('*/5');
    // Check other properties are null (node-schedule default)
    expect(ruleAPI.second).toBeNull();
    expect(ruleAPI.hour).toBeNull();
    expect(ruleAPI.date).toBeNull();
    expect(ruleAPI.month).toBeNull();
    expect(ruleAPI.dayOfWeek).toBeNull();


    // Verify SMS rule (every minute at 30th second)
    expect(ruleSMS.second).toBe(30);
    expect(ruleSMS.minute).toEqual(new Range(0, 59, 1));
    // Check other properties are null (node-schedule default)
    expect(ruleSMS.hour).toBeNull();
    expect(ruleSMS.date).toBeNull();
    expect(ruleSMS.month).toBeNull();
    expect(ruleSMS.dayOfWeek).toBeNull();
  });

  // 2. Calling createScheduleRules with custom API configuration
  it('should use custom API config and default SMS config', () => {
    const customApiConfig = { api: { minute: '*/10', hour: 12 } };
    const { ruleAPI, ruleSMS } = createScheduleRules(customApiConfig);

    // Verify API rule
    expect(ruleAPI.minute).toBe('*/10');
    expect(ruleAPI.hour).toBe(12);
    expect(ruleAPI.second).toBeNull(); // Unspecified, should be default

    // Verify SMS rule (default)
    expect(ruleSMS.second).toBe(30);
    expect(ruleSMS.minute).toEqual(new Range(0, 59, 1));
  });

  // 3. Calling createScheduleRules with custom SMS configuration
  it('should use custom SMS config and default API config', () => {
    const customSmsConfig = { sms: { second: 0, minute: '*/2' } };
    const { ruleAPI, ruleSMS } = createScheduleRules(customSmsConfig);

    // Verify SMS rule
    expect(ruleSMS.second).toBe(0);
    expect(ruleSMS.minute).toBe('*/2');
    expect(ruleSMS.hour).toBeNull(); // Unspecified, should be default

    // Verify API rule (default)
    expect(ruleAPI.minute).toBe('*/5');
  });

  // 4. Calling createScheduleRules with custom configurations for both API and SMS
  it('should use custom configurations for both API and SMS', () => {
    const customConfig = {
      api: { dayOfWeek: 1, hour: 10 }, // Monday at 10 AM
      sms: { month: 3, date: 15, second: 45 }, // March 15th, at 45th second
    };
    const { ruleAPI, ruleSMS } = createScheduleRules(customConfig);

    // Verify API rule
    expect(ruleAPI.dayOfWeek).toBe(1);
    expect(ruleAPI.hour).toBe(10);
    expect(ruleAPI.minute).toBeNull(); // Unspecified

    // Verify SMS rule
    expect(ruleSMS.month).toBe(3);
    expect(ruleSMS.date).toBe(15);
    expect(ruleSMS.second).toBe(45);
    expect(ruleSMS.minute).toBeNull(); // Unspecified
  });

  // 5. Calling createScheduleRules with partial custom configuration
  it('should handle partial custom API configuration', () => {
    const partialApiConfig = { api: { hour: 8 } };
    const { ruleAPI, ruleSMS } = createScheduleRules(partialApiConfig);

    // Verify API rule
    expect(ruleAPI.hour).toBe(8);
    expect(ruleAPI.minute).toBeNull(); // Not specified, should be node-schedule default
    expect(ruleAPI.second).toBeNull(); // Not specified, should be node-schedule default

    // Verify SMS rule (should still be default)
    expect(ruleSMS.second).toBe(30);
    expect(ruleSMS.minute).toEqual(new Range(0, 59, 1));
  });

  it('should handle partial custom SMS configuration', () => {
    const partialSmsConfig = { sms: { minute: 15 } };
    const { ruleAPI, ruleSMS } = createScheduleRules(partialSmsConfig);

    // Verify SMS rule
    expect(ruleSMS.minute).toBe(15);
    expect(ruleSMS.second).toBeNull(); // Not specified, should be node-schedule default
    expect(ruleSMS.hour).toBeNull();   // Not specified, should be node-schedule default

    // Verify API rule (should still be default)
    expect(ruleAPI.minute).toBe('*/5');
  });

  it('should return default API schedule if api config is empty object', () => {
    const { ruleAPI } = createScheduleRules({ api: {} });
    expect(ruleAPI.minute).toBe('*/5');
    expect(ruleAPI.second).toBeNull();
    expect(ruleAPI.hour).toBeNull();
  });

  it('should return default SMS schedule if sms config is empty object', () => {
    const { ruleSMS } = createScheduleRules({ sms: {} });
    expect(ruleSMS.second).toBe(30);
    expect(ruleSMS.minute).toEqual(new Range(0, 59, 1));
    expect(ruleSMS.hour).toBeNull();
  });

  it('should correctly use all possible schedule fields for API', () => {
    const fullApiConfig = {
      api: {
        second: 1,
        minute: 2,
        hour: 3,
        date: 4,
        month: 5,
        dayOfWeek: 6,
      },
    };
    const { ruleAPI } = createScheduleRules(fullApiConfig);
    expect(ruleAPI.second).toBe(1);
    expect(ruleAPI.minute).toBe(2);
    expect(ruleAPI.hour).toBe(3);
    expect(ruleAPI.date).toBe(4);
    expect(ruleAPI.month).toBe(5);
    expect(ruleAPI.dayOfWeek).toBe(6);
  });

  it('should correctly use all possible schedule fields for SMS', () => {
    const fullSmsConfig = {
      sms: {
        second: 10,
        minute: 20,
        hour: 13,
        date: 14,
        month: 6,
        dayOfWeek: 0, // Sunday
      },
    };
    const { ruleSMS } = createScheduleRules(fullSmsConfig);
    expect(ruleSMS.second).toBe(10);
    expect(ruleSMS.minute).toBe(20);
    expect(ruleSMS.hour).toBe(13);
    expect(ruleSMS.date).toBe(14);
    expect(ruleSMS.month).toBe(6);
    expect(ruleSMS.dayOfWeek).toBe(0);
  });
});
