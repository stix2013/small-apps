import type { Stats } from 'node:fs'
import { watch } from 'chokidar'
import i18n from '@src/i18n';
//
// import { logCdr } from '@src/utils/logger'
import { createLoggers } from '@src/utils'
import config from '@src/config'
import { processFile } from './process-file'
import { options as optionsWatcher } from './options'

export const createCDRWatcher = () => {
  const { logCdr } = createLoggers()
  const watcher = watch(config.path, optionsWatcher)
  logCdr.info('test');
  logCdr.info(i18n.language);

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
        logCdr.info(i18n.t('watcher.fileRemoved', { path }))
      }
    )
    .on('change', (path, stats) => {
      if (stats?.isFile()) {
        logCdr.info(i18n.t('watcher.fileModified', { path, accessTime: stats?.atimeMs }))
      }
    })
    .on('addDir', (path) => {
      logCdr.info(i18n.t('watcher.directoryAdded', { path }))
    })
    .on('unlinkDir', (path) => {
      logCdr.info(i18n.t('watcher.directoryRemoved', { path }))
    })
    .on('ready', () => {
      logCdr.info(i18n.t('watcher.waitForNewFiles'))
      config.ready = true
    })

  return watcher
}
