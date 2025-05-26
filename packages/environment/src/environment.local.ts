import { getFullPath } from '@yellow-mobile/utils'
import authStrategies from './strategies'

import { environment as envDefault } from './environment'

const environment = {
  ...envDefault,
  appEnv: 'local',
  siteName: 'Yellow Mobile',
  baseRoute: '/',
  publicPath: '/assets/',
  ipxProvider: process.env.IPX_PROVIDER || 'yellow',
  axios: {
    debug: true
  },
  ipxDomains: process.env.IPX_DOMAINS ? process.env.IPX_DOMAINS.split('|') : [],
  appOrigins: '*'
}

const baseFullUrl = getFullPath(environment.baseUrl, environment.basePort)

export const envLocal = {
  app: 'local',
  ...environment,
  baseFullUrl,
  strategies: authStrategies(environment)
}
