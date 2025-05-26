// express
import express from 'express'
// schedule
import schedule from 'node-schedule'

// Prometheus
import * as Prometheus from 'prom-client'

import config from './config'
import { createCDRWatcher } from './cdr'
//
import { createSchedule } from './monitoring'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

process.on('SIGINT', () => {
  server.close((err?: Error) => {
    if (err) {
      console.log(`Error: ${err.message}`)
    } else {
      console.log('Server is closed')
    }
  })

  // end logger
  // loggers.forEach((logger) => {
  //   logger.end()
  // })

  watcher?.close()
    .then(() => {
      console.log('Watcher is closed')
      process.exit(0)
    })
    .catch((err: Error) => console.error(err.message))

  if (jobs) {
    schedule.gracefulShutdown().then(() => {
      console.log('Schedule is closed')
    })
  }
})
