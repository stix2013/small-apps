import type { AxiosError } from 'axios';
import axios from 'axios'
//
import config from '@src/config'
import { adminClient } from '@src/utils/admin-client'
import { counterProcess } from '@src/monitoring'
import { createLoggers } from '@src/utils/logger'
import type { CDRLine } from '@src/types/cdr-line'
import type { CDRFile } from '@src/types/cdr-file'

export function postData (file: Omit<CDRFile, 'lines'>, lines: CDRLine[]) {
  const data = {
    ...file,
    lines: [...lines]
  }

  return adminClient.post(config.pathWebhook, data)
    .then(() => {
      counterProcess.labels({ label: 'post_data_success' }).inc(1)
      const { logPost } = createLoggers()
      logPost.info(`SUCCESS: ${file.filename}, data:  ${JSON.stringify({ ...file, lines: [] })}`)
    })
    .catch((error) => {
      counterProcess.labels({ label: 'post_data_failed' }).inc(1)

      if (axios.isAxiosError(error)) {
        const errAxios = error as AxiosError
        const { logPost } = createLoggers()

        const errMessage = `filename: ${data.filename}, line count: ${data.lineCount}\n ${errAxios.cause}`
        logPost.error(errMessage)

        throw new Error(errMessage)
      }
    })
}
