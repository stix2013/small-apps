import { REFRESH_TIME_PERIOD } from '@yellow-mobile/const'
import { useLogger } from './use-logger'

const logger = useLogger('timeout')

export function timeout (prevTime: number, currTime= Date.now(), period = REFRESH_TIME_PERIOD): boolean {
  const diffTime = currTime - prevTime >= period
  logger.info(diffTime, currTime - prevTime, period)

  return diffTime
}
