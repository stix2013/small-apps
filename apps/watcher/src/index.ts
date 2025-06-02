// express
import express from 'express'
// schedule
import schedule from 'node-schedule'

// Prometheus
import * as Prometheus from 'prom-client'

import config from './config'
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
    console.log(`Watcher v${process.env.npm_package_version} app listens to port ${port}`)
    console.log(`        using NodeJS ${process.version}`)
  })

  console.log('Application started after i18n initialization.');
}

main().catch(error => {
  console.error("Error during application startup:", error);
  process.exit(1);
});

process.on('SIGINT', () => {
  if (server) {
    server.close((err?: Error) => {
      if (err) {
        console.log(`Error: ${err.message}`)
      } else {
        console.log('Server is closed')
      }
    })
  }

  // Close all resources gracefully
  const gracefulShutdownFlow = async () => {
    console.log('Starting graceful shutdown...');

    // Close watcher
    if (watcher) {
      try {
        await watcher.close();
        console.log('Watcher is closed');
      } catch (err) {
        console.error(`Error closing watcher: ${(err as Error).message}`);
      }
    }

    // Close scheduled jobs
    if (jobs) { // Ensure jobs object exists
      try {
        await schedule.gracefulShutdown();
        console.log('Schedule is closed');
      } catch (err) {
        console.error(`Error closing schedule: ${(err as Error).message}`);
      }
    }

    // Close loggers
    if (loggers && loggers.length > 0) {
      loggers.forEach((logger) => {
        if (logger && typeof logger.close === 'function') {
          logger.close();
        }
      });
      console.log('All global loggers closed.');
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
