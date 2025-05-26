// express
import express from 'express'
// schedule
import schedule from 'node-schedule'

// Prometheus
import * as Prometheus from 'prom-client'

import config from './config'
import { loggers } from './utils/logger' // Import the loggers array
import { createCDRWatcher } from './cdr'
//
import { createSchedule } from './monitoring'

const jobs = createSchedule()

// watch CDR files from FTP
const watcher = createCDRWatcher()

// express
const app = express()
const port = config.expressPort || 3000

app.get('/metrics', async (_, res) => {
  res.set('Content-Type', Prometheus.register.contentType)
  res.end(await Prometheus.register.metrics())
})

const server = app.listen(port, () => {
  console.log(`Watcher v${process.env.npm_package_version} app listens to port ${port}`)
  console.log(`        using NodeJS ${process.version}`)
})

export { app, server };

process.on('SIGINT', () => {
  server.close((err?: Error) => {
    if (err) {
      console.log(`Error: ${err.message}`)
    } else {
      console.log('Server is closed')
    }
  })

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
  // Using a separate function helps manage the async flow and ensures
  // process.exit is called only after all cleanup attempts.
  gracefulShutdownFlow();
})
