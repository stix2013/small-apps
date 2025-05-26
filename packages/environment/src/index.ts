import fs from 'node:fs'
import { config as envConfig } from 'dotenv'
//
import { envLocal } from './environment.local'
import { envStaging } from './environment.staging'
import { envProd } from './environment.prod'
//
function loadDotfile (filename: string) {
  if (fs.existsSync(filename)) {
    const env = envConfig({ path: filename }).parsed
    // logger.info(filename, env)
    process.env = { ...process.env, ...env }
  }
}

export const environment = () => {
  switch (process.env.APP_ENV) {
    case 'production':
      loadDotfile('.env-prod')

      return {
        ...envProd
      }
    case 'staging':
      loadDotfile('.env-staging')

      return {
        ...envStaging
      }
    default:
      loadDotfile('.env-dev')

      return {
        ...envLocal
      }
  }
}

export type Environment = ReturnType<typeof environment>
