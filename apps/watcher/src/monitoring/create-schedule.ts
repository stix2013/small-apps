import schedule from 'node-schedule'
import axios from 'axios'
//
import config from '@src/config'
// import { logSimInnApi, logSimInnSMS } from '@src/utils/logger'
import { createLoggers } from '@src/utils/logger'
import { simInnApi, simInnSMS } from './siminn'
import { gaugeSimInnApi, gaugeSimInnSMS } from './prometheus'

// get schedule rules
import { createScheduleRules } from './create-schedule-rules'

export const createSchedule = (scheduleName = 'SIMINN-API') => {
  const { logSimInnApi, logSimInnSMS } = createLoggers()
  const { ruleAPI, ruleSMS } = createScheduleRules()

  const jobAPI = schedule.scheduleJob(scheduleName, ruleAPI, async () => {
    try {
      const response = await simInnApi.get(config.simInnApiPathPing)
      gaugeSimInnApi.labels({ status: response.statusText }).set(response.status)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        gaugeSimInnApi.labels({ status: err.response?.statusText }).set(err.response?.status || 0)
        logSimInnApi.error(`${err.message}`)
      } else {
        gaugeSimInnApi.labels({ status: 'Error' }).set(0)
        logSimInnApi.error(`${(err as Error)?.message}`)
      }
    }
  })

  const jobSMS = schedule.scheduleJob('SIMINN-SMS', ruleSMS, async () => {
    try {
      const response = await simInnSMS.get(config.simInnSMSHealthcheck)
      gaugeSimInnSMS.labels({ status: response.statusText }).set(1)
    } catch (err) {
      gaugeSimInnSMS.labels({ status: 'Error' }).set(0)
      logSimInnSMS.error(`${(err as Error)?.message}`)
    }
  })

  return {
    jobAPI,
    jobSMS
  }
}
