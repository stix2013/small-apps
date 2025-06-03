// express
import express from 'express'
// schedule
import schedule from 'node-schedule'

// Prometheus
import * as Prometheus from 'prom-client'

import config from './config'
import i18n from './i18n';
import { initializeI18n } from './i18n';
import { loggers } from './utils/logger' // Import the loggers array
import { createCDRWatcher } from './cdr'
//
import type { ScheduledJobs } from './monitoring';
import { createSchedule } from './monitoring'
import type { FSWatcher } from 'chokidar';
import type { Server } from 'net';

let server: Server;
let watcher: FSWatcher;
let jobs: ScheduledJobs;

async function main() {
  await initializeI18n();

  jobs = createSchedule()

  // watch CDR files from FTP
  watcher = createCDRWatcher()

  // express
  const app = express()
  const port = config.expressPort || 3000

  app.get('/metrics', async (_, res) => {
    res.set('Content-Type', Prometheus.register.contentType)
    res.end(await Prometheus.register.metrics())
  })

  server = app.listen(port, () => {
    console.log(i18n.t('app.listening', { version: process.env.npm_package_version, port }))
    console.log(i18n.t('app.nodeVersion', { version: process.version }))
  })

  console.log(i18n.t('app.started'));
}

main().catch(error => {
  console.error(i18n.t('app.error.startup'), error);
  process.exit(1);
});

process.on('SIGINT', () => {
  if (server) {
    server.close((err?: Error) => {
      if (err) {
        console.error(i18n.t('app.server.closeError'), err.message)
      } else {
        console.log(i18n.t('app.server.closed'))
      }
    })
  }

  // Close all resources gracefully
  const gracefulShutdownFlow = async () => {
    console.log(i18n.t('app.shutdown.starting'));

    // Close watcher
    if (watcher) {
      try {
        await watcher.close();
        console.log(i18n.t('app.watcher.closed'));
      } catch (err) {
        console.error(i18n.t('app.watcher.closeError'), (err as Error).message);
      }
    }

    // Close scheduled jobs
    if (jobs) { // Ensure jobs object exists
      try {
        await schedule.gracefulShutdown();
        console.log(i18n.t('app.schedule.closed'));
      } catch (err) {
        console.error(i18n.t('app.schedule.closeError'), (err as Error).message);
      }
    }

    // Close loggers
    if (loggers && loggers.length > 0) {
      loggers.forEach((logger) => {
        if (logger && typeof logger.close === 'function') {
          logger.close();
        }
      });
      console.log(i18n.t('app.loggers.closed'));
    }

    // Finally, exit the process
    process.exit(0);
  };

  // Initiate graceful shutdown.
  gracefulShutdownFlow();
})

// For testing purposes, if app and server are needed by other modules.
// However, direct export might be problematic with async main.
// Consider alternative patterns if other modules need to import these.
// For now, removing them from direct export as they are initialized in main().
// export { app, server };
