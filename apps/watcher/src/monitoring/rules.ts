import schedule from 'node-schedule'

export const createScheduleRules = () => {
  const ruleAPI = new schedule.RecurrenceRule()
  const ruleSMS = new schedule.RecurrenceRule()
  ruleSMS.second = 30
  ruleSMS.minute = new schedule.Range(0, 59, 1)

  return {
    ruleAPI,
    ruleSMS
  }
}
