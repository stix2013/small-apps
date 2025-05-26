import { useLogger } from './use-logger'
import { REFRESH_TIME_PERIOD } from './const/refresh'

const logger = useLogger('timeout')

export function timeout (prevTime: number, currTime?: number, period?: number): boolean {
  if (!currTime) {
    currTime = Date.now()
  }

  if (!period) {
    period = REFRESH_TIME_PERIOD
  }

  const diffTime = currTime - prevTime >= period
  logger.info(diffTime, currTime - prevTime, period)

  return diffTime
}
