import type { Stats } from 'node:fs'
import { watch } from 'chokidar'
//
// import { logCdr } from '@src/utils/logger'
import { createLoggers } from '@src/utils'
import config from '@src/config'
import { processFile } from './process-file'
import { options as optionsWatcher } from './options'

export const createCDRWatcher = () => {
  const { logCdr } = createLoggers()
  const watcher = watch(config.path, optionsWatcher)

  watcher
    .on('add', (path: string, stats?: Stats) => {
      if (stats?.isFile() && config.ready) {
        process.nextTick(() => {
          processFile(path, stats)
        })
      }
    })
    .on('unlink',
      (path: string) => {
        logCdr.info(`File ${path} has been removed`)
      }
    )
    .on('change', (path, stats) => {
      if (stats?.isFile()) {
        logCdr.info(`File ${path} has been modified ${stats?.atimeMs}`)
      }
    })
    .on('addDir', (path) => {
      logCdr.info(`Directory ${path}`)
    })
    .on('unlinkDir', (path) => {
      logCdr.info(`Directory ${path} has been removed`)
    })
    .on('ready', () => {
      logCdr.info('Wait for new files')
      config.ready = true
    })

  return watcher
}
